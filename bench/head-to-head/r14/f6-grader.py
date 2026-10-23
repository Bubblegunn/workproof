#!/usr/bin/env python3
"""usage: f6-grader.py <workdir> <tasks.json> sample|compare [--seed r14-f6]
sample : prints the seeded random 10 percent of cells (task arm run), written to <workdir>/f6/sample.txt.
compare: reads the fresh Opus votes in <workdir>/f6/v*/ (same layout as grades/v*), majority per criterion over valid votes (at least 3 valid
         per task), and compares the sampled cells with the original majority (grades/v*): pass if no sampled cell differs by more than one
         point and the share of criteria with the same verdict is at least 90 percent. Prints a table; no model call."""
import json, os, random, re, sys
W, TASKS_PATH, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
SEED = sys.argv[sys.argv.index("--seed") + 1] if "--seed" in sys.argv else "r14-f6"
cfg = json.load(open(TASKS_PATH)); TASKS = list(cfg["tasks"])
def cells():
    out = []
    for d in sorted(os.listdir(f"{W}/runs")):
        m = re.fullmatch(r"([A-Z]+\d+)-(.+)-(\d+)", d)
        if m and os.path.exists(f"{W}/runs/{d}/DONE"): out.append(m.groups())
    return out
if MODE == "sample":
    allc = cells(); k = max(1, round(len(allc) * 0.10))
    pick = sorted(random.Random(SEED).sample(allc, k))
    os.makedirs(f"{W}/f6", exist_ok=True)
    open(f"{W}/f6/sample.txt", "w").write("\n".join(" ".join(c) for c in pick) + "\n")
    print(len(allc), "cells,", k, "sampled; tasks:", sorted({c[0] for c in pick})); sys.exit(0)
want = lambda t: set(cfg["tasks"][t]["criteria"])
def votes(root, t):
    res = []
    for v in sorted(x for x in os.listdir(root) if re.fullmatch(r"v\d+", x)):
        try:
            lab = json.load(open(f"{root}/{v}/{t}-labels.json"))
            g = json.loads(re.search(r"\{.*\}", open(f"{root}/{v}/{t}-grade.json").read(), re.S).group(0))
            ok = all(isinstance(g.get(L), dict) and g[L] and all(set(cr) >= want(t) and all(isinstance(cr[c], list) and len(cr[c]) == 2 and isinstance(cr[c][1], bool) for c in want(t)) for cr in g[L].values()) for L in lab)
        except Exception: continue
        if ok: res.append((lab, g))
    return res
def verdicts(root, t):
    vs = votes(root, t)
    if len(vs) < 3: sys.exit(f"error: {root} task {t} has {len(vs)} valid votes (need 3)")
    tally = {}
    for lab, g in vs:
        for L, arm in lab.items():
            for n, cr in g[L].items():
                for c in want(t): tally.setdefault((arm, n, c), []).append(cr[c][1])
    return {k: sum(v) * 2 > len(v) for k, v in tally.items()}
sample = [l.split() for l in open(f"{W}/f6/sample.txt").read().strip().split("\n")]
worst, same, total, rows = 0, 0, 0, []
for t in sorted({s[0] for s in sample}):
    orig, fresh = verdicts(f"{W}/grades", t), verdicts(f"{W}/f6", t)
    for (tt, arm, n) in [s for s in sample if s[0] == t]:
        so = sum(orig[(arm, n, c)] for c in want(t)); sf = sum(fresh[(arm, n, c)] for c in want(t))
        agree = sum(orig[(arm, n, c)] == fresh[(arm, n, c)] for c in want(t))
        worst = max(worst, abs(so - sf)); same += agree; total += len(want(t)); rows.append((t, arm, n, so, sf, agree))
print("task arm run | original score | fresh Opus score | criteria with the same verdict")
for r in rows: print(f"{r[0]} {r[1]} {r[2]} | {r[3]} | {r[4]} | {r[5]}/5")
print(f"largest score difference: {worst}; criterion agreement: {same}/{total} = {same / total:.1%}")
print("F6-grader pass (no cell differs by more than 1 point and agreement >= 90%):", worst <= 1 and same / total >= 0.9)
