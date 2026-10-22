#!/usr/bin/env python3
"""usage: assemble.py <runs-dir> <out-dir> <seed> [fixtures-dir]
Builds one anonymised packet per task: arms shuffled and labelled A..E, all runs of an arm pooled under its label.
Writes <task>-packet.txt, <task>-labels.json and <task>-prompt.txt (the full grader prompt). The grader never sees arm names."""
import json, os, random, re, sys
RUNS, OUT, SEED = sys.argv[1], sys.argv[2], sys.argv[3]
FIXTURES = sys.argv[4] if len(sys.argv) > 4 else ""
SOURCES = {"F7": "F7/portfolio-bank.md", "F8": "F8/resumes/past-resume.md"}
HERE = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.environ.get("H2H_TASKS") or os.path.join(HERE, "tasks.json")))
ARMS_ORDER = ["OURS", "BASE", "RCP", "RCP_I", "JD", "JD_I", "GAP", "GAP_I", "SR", "SR_I", "CV", "CV_I"]
KEEP_OUT = {".git", "test", "tests", ".gitignore", ".travis.yml", "History.md", "LICENSE", "Readme.md", "component.json", "index.js", "package.json", "received", "report.json", "src", "portfolio-bank.md", "resumes"}
os.makedirs(OUT, exist_ok=True)

def changed_files(fx, pristine):
    """Held-out set c (fixtures HCn, repositories of any ecosystem): list the files the agent added or changed
    relative to the pristine fixture, instead of the KEEP_OUT filter of the older fixtures. .git is skipped."""
    out = []
    for root, dirs, names in os.walk(fx):
        dirs[:] = sorted(x for x in dirs if x != ".git")
        for nm in sorted(names):
            if nm == "portfolio-bank.md": continue   # the JD_I arm gets this file from the harness; listing it would reveal the arm
            q = os.path.join(root, nm); rel = os.path.relpath(q, fx); o = os.path.join(pristine, rel)
            try:
                data = open(q, "rb").read()
                if os.path.exists(o) and open(o, "rb").read() == data: continue
                out.append((rel, data.decode("utf-8")[:7000]))
            except (UnicodeDecodeError, OSError): pass
    return out[:12]

def one(d, pristine=None):
    res, cmds = "", []
    for line in open(os.path.join(d, "out.jsonl")):
        try: o = json.loads(line)
        except ValueError: continue
        if o.get("type") == "result": res = o.get("result", "")
        if o.get("type") == "assistant":
            for b in o["message"]["content"]:
                if b.get("type") == "tool_use":
                    i = b["input"]
                    cmds.append(b["name"] + ": " + str(i.get("command") or i.get("file_path") or i.get("skill") or "")[:260].replace("\n", " ; "))
    files = []
    fx = os.path.join(d, "fx")
    if pristine:
        return res, cmds, changed_files(fx, pristine)
    for f in sorted(os.listdir(fx)):
        if f in KEEP_OUT: continue
        p = os.path.join(fx, f)
        if os.path.isfile(p):
            try: files.append((f, open(p).read()[:7000]))
            except (UnicodeDecodeError, OSError): pass
        elif f == "evidence":   # held-out H1 asks for a folder of files
            for root, _, names in os.walk(p):
                for nm in sorted(names):
                    q = os.path.join(root, nm)
                    try: files.append(("evidence/" + os.path.relpath(q, p), open(q).read()[:7000]))
                    except (UnicodeDecodeError, OSError): pass
    return res, cmds, files

for t, spec in cfg["tasks"].items():
    arms = [a for a in ARMS_ORDER if any(re.fullmatch(rf"{t}-{a}-\d+", x) for x in os.listdir(RUNS))]
    random.Random(f"{SEED}-{t}").shuffle(arms)
    labels = {}
    parts = []
    for i, arm in enumerate(arms):
        letter = chr(65 + i)
        labels[letter] = arm
        runs = sorted(x for x in os.listdir(RUNS) if re.fullmatch(rf"{t}-{arm}-\d+", x))
        for r in runs:
            n = r.rsplit("-", 1)[1]
            pristine = os.path.join(FIXTURES, spec["fixture"]) if spec["fixture"].startswith("HC") and FIXTURES else None
            res, cmds, files = one(os.path.join(RUNS, r), pristine)
            parts.append(f"\n\n######## ARM {letter} RUN {n}\n### Commands/tools the agent used (in order)\n" + "\n".join(cmds[:40]) +
                         "\n### Final answer text\n" + res[:3500] + "\n### Files it left in the working directory\n" +
                         ("\n".join(f"--- {name}\n{text}" for name, text in files) or "(none)"))
    json.dump(labels, open(os.path.join(OUT, f"{t}-labels.json"), "w"))
    source = ""
    if spec["fixture"] in SOURCES and FIXTURES:
        source = "=== SOURCE FILE the user gave the agents (" + SOURCES[spec["fixture"]] + ") ===\n" + open(os.path.join(FIXTURES, SOURCES[spec["fixture"]])).read() + "\n\n"
    crit = "\n".join(f"{k} {v}" for k, v in spec["criteria"].items())
    prompt = (
        "You are a strict blind grader. Below are the outputs of several arms (labelled with letters, in random order, you do not know which tool each used), "
        "several runs per arm, on one task. Grade every run against each criterion. Be literal and objective: pass only if the evidence in the packet shows it. "
        "If a run produced no file and asked a question or refused instead, criteria that need a file fail.\n\n"
        f"Task prompt given to each agent: \"{spec['prompt'].replace('{suffix}', cfg['suffix']).replace('{home}', '<home>')}\"\n"
        f"Ground truth: {spec['truth']} {cfg['groundTruth']['fixture']}\n{crit}\n\n" +
        source +
        "Reply with ONLY a JSON object: {\"A\": {\"1\": {\"C1\": [true|false, \"one-line reason\"], \"C2\": [...]}, \"2\": {...}}, \"B\": ...} "
        "where the inner keys are the run numbers, with no prose before or after.\n\n=== PACKET ===\n" + "".join(parts))
    open(os.path.join(OUT, f"{t}-packet.txt"), "w").write("".join(parts))
    open(os.path.join(OUT, f"{t}-prompt.txt"), "w").write(prompt)
print("wrote packets for", ", ".join(cfg["tasks"]))
