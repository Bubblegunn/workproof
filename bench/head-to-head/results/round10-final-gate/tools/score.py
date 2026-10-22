#!/usr/bin/env python3
"""score.py - recompute every table of SUMMARY.md from grades/ (no network, no model calls; reads only files inside this folder).
usage: score.py                  print deterministic Markdown for every set found under tasks/<set>/tasks.json (sorted by set name)
       score.py --check FILE     exit 0 if the text between '<!-- score.py:begin -->' and '<!-- score.py:end -->' in FILE equals the output
                                 (compared after removing blank lines at both ends of each text), else print the first difference and exit 1
Inputs per set: tasks/<set>/tasks.json, tasks/<set>/labels.json, grades/<set>/<task>-labels.json, grades/<set>/<task>-grade.json,
runs/<set>/<task>/<arm>/<rep>/cost.json (only for the reused marker).
Gate logic is that of bench/head-to-head/score.py: outcome criteria only, ceiling ruling, better of plain and invoked arm per competitor."""
import difflib, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ["OURS", "BASE", "RCP", "RCP_I", "JD", "JD_I", "GAP", "GAP_I", "SR", "SR_I", "CV", "CV_I"]
COMP = [("BASE", ["BASE"]), ("RCP", ["RCP", "RCP_I"]), ("JD", ["JD", "JD_I"]), ("GAP", ["GAP", "GAP_I"]), ("SR", ["SR", "SR_I"]), ("CV", ["CV", "CV_I"])]
BEGIN, END = "<!-- score.py:begin -->", "<!-- score.py:end -->"
MARK = "†"


def render(set_name, out):
    p = lambda s="": out.write(s + "\n")
    tdir = os.path.join(HERE, "tasks", set_name); gdir = os.path.join(HERE, "grades", set_name)
    cfg = json.load(open(os.path.join(tdir, "tasks.json"), encoding="utf-8"))
    LAB = json.load(open(os.path.join(tdir, "labels.json"), encoding="utf-8"))
    TASKS = list(cfg["tasks"])
    runs = {}    # (task, arm) -> {run: {crit: bool}}
    for t in TASKS:
        lab = json.load(open(os.path.join(gdir, f"{t}-labels.json")))
        m = re.search(r"\{.*\}", open(os.path.join(gdir, f"{t}-grade.json"), encoding="utf-8").read(), re.S)
        grade = json.loads(m.group(0))
        for letter, arm in lab.items():
            runs[(t, arm)] = {n: {c: bool(v[0]) for c, v in crit.items()} for n, crit in grade.get(letter, {}).items()}
    ARMS = [a for a in ORDER if any(k[1] == a for k in runs)]

    reused = {}   # (task, arm) -> [reused flags]
    rdir = os.path.join(HERE, "runs", set_name)
    for t in TASKS:
        for a in ARMS:
            d = os.path.join(rdir, t, a)
            if os.path.isdir(d):
                for rep in sorted(os.listdir(d)):
                    cp = os.path.join(d, rep, "cost.json")
                    if os.path.isfile(cp): reused.setdefault((t, a), []).append(bool(json.load(open(cp)).get("reused")))

    def scores(t, arm):
        cs = [c for c in cfg["tasks"][t]["criteria"] if LAB[t][c]["label"] == "outcome"]
        return [sum(1 for c in cs if r.get(c)) for _, r in sorted(runs.get((t, arm), {}).items())], len(cs)

    def mean(t, arm):
        sc, _ = scores(t, arm)
        return sum(sc) / len(sc) if sc else 0.0

    def cell(t, arm):
        sc, _ = scores(t, arm)
        if not sc: return "n/a"
        s = f"{sum(sc)/len(sc):.2f} ({min(sc)}-{max(sc)}, n={len(sc)})"
        return s + (MARK if any(reused.get((t, arm), [])) else "")

    p(f"## Set `{set_name}`: outcome criteria only (the gate counts these)\n")
    p("| Task (max) | " + " | ".join(ARMS) + " |\n|---|" + "---|" * len(ARMS))
    tot = {a: 0.0 for a in ARMS}
    for t in TASKS:
        p(f"| {t} ({scores(t, 'OURS')[1]}) | " + " | ".join(cell(t, a) for a in ARMS) + " |")
        for a in ARMS: tot[a] += mean(t, a)
    mx_total = sum(scores(t, "OURS")[1] for t in TASKS)
    p(f"| Total ({mx_total}) | " + " | ".join(f"{tot[a]:.2f}" for a in ARMS) + " |")
    n_cells = sum(len(v) for v in reused.values()); n_re = sum(sum(v) for v in reused.values())
    p(f"\nReused cells ({MARK}, cost.json `reused: true`): {n_re} of {n_cells} recorded cells" + (f"; a {MARK} after a table cell means at least one of its runs is reused." if n_re else "."))

    p("\n### Gate per task (better of plain and invoked arm per competitor)\n")
    ok_b = True
    for t in TASKS:
        ours = mean(t, "OURS"); mx = scores(t, "OURS")[1]
        others = {name: max([mean(t, a) for a in g if (t, a) in runs] or [0.0]) for name, g in COMP}
        top = max(others.values())
        if top >= mx - 1e-9: passed = ours >= mx - 1e-9; why = f"ceiling ruling: a competitor reaches the maximum {mx}; we must too"
        else: passed = ours > top + 1e-9; why = "strictly above every competitor"
        ok_b &= passed
        p(f"- {t}: ours {ours:.2f}, best competitor {top:.2f} ({max(others, key=others.get)}), max {mx}: {'PASS' if passed else 'FAIL'} ({why})")
    best_tot = {name: max([tot[a] for a in g if a in ARMS] or [0.0]) for name, g in COMP}
    bn = max(best_tot, key=best_tot.get); best = best_tot[bn]; ours_t = tot["OURS"]
    lost_o, lost_b = mx_total - ours_t, mx_total - best
    ok_a = lost_o <= 0.8 * lost_b + 1e-9
    ok_a12 = ours_t >= 1.2 * best - 1e-9
    p(f"\nrule A (ours lost <= 80 percent of the best other arm's lost points): ours lost {lost_o:.2f}, best other arm ({bn}) lost {lost_b:.2f}, limit {0.8 * lost_b:.2f}: {'PASS' if ok_a else 'FAIL'}")
    p(f"rule A, form of bench/head-to-head/score.py (ours >= 1.2 x best competitor total): ours {ours_t:.2f}, best competitor total {best:.2f} ({bn}), needs {1.2 * best:.2f}: {'PASS' if ok_a12 else 'FAIL'}")
    p(f"rule B: {'PASS' if ok_b else 'FAIL'}")
    p("gate: " + ("PASS" if ok_a and ok_b else "FAIL"))
    p("gate with the 1.2x form of rule A: " + ("PASS" if ok_a12 and ok_b else "FAIL"))


def output():
    sets = sorted(d for d in os.listdir(os.path.join(HERE, "tasks")) if os.path.isfile(os.path.join(HERE, "tasks", d, "tasks.json")))
    buf = io.StringIO()
    for i, s in enumerate(sets):
        if i: buf.write("\n")
        render(s, buf)
    return buf.getvalue()


def main(a):
    text = output()
    if a[:1] != ["--check"]:
        sys.stdout.write(text); return 0
    doc = open(a[1], encoding="utf-8").read()
    if BEGIN not in doc or END not in doc or doc.index(BEGIN) > doc.index(END):
        print(f"markers {BEGIN} / {END} not found in {a[1]}"); return 1
    block = doc[doc.index(BEGIN) + len(BEGIN):doc.index(END)]
    want, have = text.strip("\n"), block.strip("\n")
    if want == have:
        print("OK: SUMMARY block equals score.py output"); return 0
    print("DIFFERENT:"); sys.stdout.writelines(list(difflib.unified_diff(have.splitlines(True), want.splitlines(True), "SUMMARY.md", "score.py", n=1))[:40])
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
