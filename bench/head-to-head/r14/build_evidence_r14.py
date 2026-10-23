#!/usr/bin/env python3
"""usage: build_evidence.py <config.json> <out-dir>
Writes tasks/, runs/ and grades/ of the evidence folder (EVIDENCE-SPEC items 5-8 and 11 are split between this script,
make_sums.py and score.py). Everything is passed through redact(). Python 3 stdlib only.

config.json:
{"sets": [{"name": "public",
           "tasks": "/path/tasks.json", "labels": "/path/labels.json",
           "pristine": null | "/path/to/fixtures",       # HC fixtures: files changed vs pristine/<fixture>
           "taskdirs": ["/path/to/writer-folder", ...],  # optional: held-out writer folders, copied to tasks/<set>/<basename>/
           "runs": [{"dir": "/path/runs", "arms": "*" | ["OURS", ...], "reused": false, "note": "..."}],
           "grade": "/path/grade-dir"}]}
Run folders are named <TASK>-<ARM>-<N> and hold out.jsonl and fx/."""
import json, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from redact import redact, redact_obj, _EMAIL

CELL = re.compile(r"^([A-Za-z0-9]+)-(.+)-(\d+)$")
INPUT_CAP = RESULT_CAP = 1500
FILE_CAP = 20000
KEEP_OUT = {".git", "test", "tests", ".gitignore", ".travis.yml", "History.md", "LICENSE", "Readme.md", "component.json", "index.js", "package.json", "received", "report.json", "src", "portfolio-bank.md", "resumes"}  # as assemble.py
TASKDIR_KEEP_SRC = {"truth.txt", "truth.py", "criteria.md", "build-fixture.sh", "prompt.txt"}  # emails in these are synthetic fixture identities
MAX_TASKDIR_FILE = 300000


def emails_in(text):
    return {m.group(0).lower() for m in _EMAIL.finditer(text)}


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: f.write(text)


def cap(s, n):
    return s if len(s) <= n else s[:n] + f"\n[truncated at {n} chars]"


def parse_out(path):
    events = []
    for line in open(path, encoding="utf-8", errors="replace"):
        try: o = json.loads(line)
        except ValueError: continue
        if isinstance(o, dict): events.append(o)
    return events


def flat(c):
    if isinstance(c, str): return c
    if isinstance(c, list): return "\n".join(b.get("text", "") if isinstance(b, dict) else str(b) for b in c)
    return "" if c is None else str(c)


def build_trace(events, keep):
    lines, results, order = [], {}, []
    init = next((e for e in events if e.get("type") == "system" and e.get("subtype") == "init"), {})
    tools = [t if isinstance(t, str) else t.get("name", "") for t in init.get("tools", [])]
    lines.append({"event": "init", "apiKeySource": init.get("apiKeySource"), "model": init.get("model"), "tools": tools})
    for e in events:
        if e.get("type") == "user" and isinstance(e.get("message", {}).get("content"), list):
            for b in e["message"]["content"]:
                if b.get("type") == "tool_result": results[b.get("tool_use_id")] = flat(b.get("content"))
        if e.get("type") == "assistant":
            for b in e["message"].get("content", []):
                if b.get("type") == "tool_use": order.append(b)
    for i, b in enumerate(order, 1):
        inp = json.dumps(b.get("input", {}), ensure_ascii=False, sort_keys=True)
        lines.append({"i": i, "name": b.get("name"), "input": inp[:INPUT_CAP], "result": results.get(b.get("id"), "")[:RESULT_CAP]})
    return "".join(json.dumps(redact_obj(l, keep), ensure_ascii=False) + "\n" for l in lines), init


def changed_files(fx, pristine):
    out = []
    for root, dirs, names in os.walk(fx):
        dirs[:] = sorted(x for x in dirs if x != ".git")
        for nm in sorted(names):
            if nm == "portfolio-bank.md": continue
            q = os.path.join(root, nm); rel = os.path.relpath(q, fx); o = os.path.join(pristine, rel)
            try:
                data = open(q, "rb").read()
                if os.path.exists(o) and open(o, "rb").read() == data: continue
                out.append((rel, data.decode("utf-8")))
            except (UnicodeDecodeError, OSError): pass
    return out[:40]


def old_files(fx):
    files = []
    for f in sorted(os.listdir(fx)):
        if f in KEEP_OUT: continue
        p = os.path.join(fx, f)
        if os.path.isfile(p):
            try: files.append((f, open(p, encoding="utf-8").read()))
            except (UnicodeDecodeError, OSError): pass
        elif f == "evidence":
            for root, _, names in os.walk(p):
                for nm in sorted(names):
                    q = os.path.join(root, nm)
                    try: files.append(("evidence/" + os.path.relpath(q, p), open(q, encoding="utf-8").read()))
                    except (UnicodeDecodeError, OSError): pass
    return files


def build_set(S, out, stats):
    name = S["name"]
    tasks_cfg = json.load(open(S["tasks"]))
    # keep set: addresses authored in the task truth/criteria text, and in writer folders (synthetic fixture identities)
    keep = set()
    keep |= emails_in(json.dumps(tasks_cfg.get("groundTruth", {})))
    for t, spec in tasks_cfg["tasks"].items():
        keep |= emails_in(spec.get("truth", "") + json.dumps(spec.get("criteria", {})))
    tdirs = []
    for d in S.get("taskdirs") or []:
        for n in os.listdir(d):
            if n in TASKDIR_KEEP_SRC and os.path.isfile(os.path.join(d, n)):
                keep |= emails_in(open(os.path.join(d, n), encoding="utf-8", errors="replace").read())
        tdirs.append(d)
    # tasks/
    tdst = os.path.join(out, "tasks", name)
    for src, nm in ((S["tasks"], "tasks.json"), (S["labels"], "labels.json")):
        write(os.path.join(tdst, nm), redact(open(src, encoding="utf-8").read(), keep))
    for d in tdirs:
        base = os.path.basename(d.rstrip("/"))
        for root, dirs, names in os.walk(d):
            dirs[:] = sorted(x for x in dirs if x != ".git")
            for n in sorted(names):
                p = os.path.join(root, n)
                try:
                    if os.path.getsize(p) > MAX_TASKDIR_FILE: continue
                    txt = open(p, encoding="utf-8").read()
                except (UnicodeDecodeError, OSError): continue
                write(os.path.join(tdst, base, os.path.relpath(p, d)), redact(txt, keep))
                stats["taskdir_files"] += 1
    # runs/
    seen = {}
    for src in S["runs"]:
        arms = src.get("arms", "*")
        for cell in sorted(os.listdir(src["dir"])):
            m = CELL.match(cell)
            if not m or not os.path.isfile(os.path.join(src["dir"], cell, "out.jsonl")): continue
            task, arm, rep = m.groups()
            if task not in tasks_cfg["tasks"] or (arms != "*" and arm not in arms): continue
            key = (task, arm, rep)
            if key in seen: raise SystemExit(f"duplicate cell {key} in sources {seen[key]} and {src['dir']}")
            seen[key] = src["dir"]
            d = os.path.join(src["dir"], cell)
            events = parse_out(os.path.join(d, "out.jsonl"))
            res = next((e for e in reversed(events) if e.get("type") == "result"), {})
            dst = os.path.join(out, "runs", name, task, arm, rep)
            write(os.path.join(dst, "answer.md"), redact(res.get("result", "") or "", keep))
            trace, init = build_trace(events, keep)
            write(os.path.join(dst, "trace.jsonl"), trace)
            fx = os.path.join(d, "fx")
            pristine = None
            if S.get("pristine") and tasks_cfg["tasks"][task]["fixture"].startswith(("HC", "HD", "HE")):
                pristine = os.path.join(S["pristine"], tasks_cfg["tasks"][task]["fixture"])
            if os.path.isdir(fx):
                for rel, txt in (changed_files(fx, pristine) if pristine else old_files(fx)):
                    write(os.path.join(dst, "files", rel), redact(cap(txt, FILE_CAP), keep)); stats["files"] += 1
            cost = {"total_cost_usd": res.get("total_cost_usd"), "num_turns": res.get("num_turns"), "duration_ms": res.get("duration_ms"),
                    "usage": res.get("usage"), "model": init.get("model") or next(iter(res.get("modelUsage", {}) or {}), None),
                    "reused": bool(src.get("reused", False)), "run_path": os.path.join(src["dir"], cell)}
            if src.get("note"): cost["note"] = src["note"]
            write(os.path.join(dst, "cost.json"), json.dumps(redact_obj(cost, keep), indent=1, sort_keys=True) + "\n")
            stats["cells"] += 1
    # grades/
    G = S["grade"]; gdst = os.path.join(out, "grades", name)
    models = set()
    for t in tasks_cfg["tasks"]:
        for suffix in ("prompt.txt", "packet.txt", "labels.json", "grade.json", "grade.raw", "grade.err"):
            p = os.path.join(G, f"{t}-{suffix}")
            if os.path.isfile(p):
                write(os.path.join(gdst, f"{t}-{suffix}"), redact(open(p, encoding="utf-8", errors="replace").read(), keep))
                stats["grade_files"] += 1
        raw = os.path.join(G, f"{t}-grade.raw")
        if os.path.isfile(raw):
            try:
                o = json.load(open(raw, encoding="utf-8"))
                for x in (o if isinstance(o, list) else [o]): models |= set((x.get("modelUsage") or {}))
            except ValueError: pass
    if os.path.isfile(os.path.join(G, "cost.txt")):
        write(os.path.join(gdst, "cost.txt"), redact(open(os.path.join(G, "cost.txt")).read(), keep))
    for sub in sorted(os.listdir(G)):   # earlier attempts (parse failures, re-asks): <task>-grade-attempt1.json etc.
        sp = os.path.join(G, sub)
        if not (os.path.isdir(sp) and sub.startswith("attempt")): continue
        for n in sorted(os.listdir(sp)):
            mm = re.match(r"^(.+?)-(prompt|grade)\.(txt|json|raw|err)$", n)
            if mm: dest = f"{mm.group(1)}-{mm.group(2)}-{sub}.{mm.group(3)}"
            elif n == "cost.txt": dest = f"cost-{sub}.txt"
            else: dest = f"{sub}-{n}"
            write(os.path.join(gdst, dest), redact(open(os.path.join(sp, n), encoding="utf-8", errors="replace").read(), keep))
            stats["grade_files"] += 1
    return sorted(models)


GRADER_MD = """# Grader

- Grader model(s) seen in the stored grader output (`modelUsage` of `<task>-grade.raw`): {models}.
- Invocation (from the round's `grade2.sh`): `claude -p --model sonnet --setting-sources project --strict-mcp-config --tools "" --output-format json < <task>-prompt.txt`.
  One call per task, no tools, the whole prompt on stdin.
- Prompt template source: `assemble.py` in this folder (copy of `bench/head-to-head/assemble.py`). It builds `<task>-prompt.txt` and
  `<task>-packet.txt`, shuffles the arms with `random.Random(f"{{seed}}-{{task}}")` and labels them A, B, C, ... The grader never sees arm names.
- `<task>-labels.json` is the shuffled order shown to the grader (letter -> arm). `<task>-packet.txt` is the packet; `<task>-prompt.txt` is the full prompt.
- Votes: one grader call per task, so one vote per task. Its parsed text is `<task>-grade.json` (per letter, per run number, per criterion: `[true|false, reason]`);
  the raw tool output (cost, usage, model) is `<task>-grade.raw`. `score.py` parses the first JSON object in `<task>-grade.json`.
- Earlier attempts (parse failures, re-asks) are stored beside the scored one as `<task>-grade-attempt1.*` and `<task>-prompt-attempt1.txt`; only the unsuffixed files are scored.
- `cost.txt`: grader cost per task in USD.
- Every file here is the redacted copy (see the redaction note in the folder README/SUMMARY). The prompt that was actually sent differs only where a
  placeholder `<email:xxxxxxxx>`, `<redacted:secret>`, `/Users/user`, `/home/user` or `claude-uid` replaced personal data.
"""


def main(a):
    cfg = json.load(open(a[0])); out = a[1]
    stats = {"cells": 0, "files": 0, "grade_files": 0, "taskdir_files": 0}
    models = set()
    for S in cfg["sets"]:
        models |= set(build_set(S, out, stats))
    write(os.path.join(out, "grades", "GRADER.md"), GRADER_MD.format(models=", ".join(sorted(models)) or "unknown"))
    here = os.path.dirname(os.path.abspath(__file__))
    asm = os.path.join(here, "..", "assemble.py")
    if os.path.isfile(asm): shutil.copyfile(asm, os.path.join(out, "grades", "assemble.py"))
    print(json.dumps(stats))

if __name__ == "__main__":
    main(sys.argv[1:])
