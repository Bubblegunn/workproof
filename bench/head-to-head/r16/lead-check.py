#!/usr/bin/env python3
"""Round 16 lead check. usage: lead-check.py <grade-root> <tasks.json> <labels.json> <groups.json> <runs-dir> [--seed S] [--boot N]

Pure arithmetic over the stored votes and the stored transcripts; no model call. It uses the same combination rule as r15/score-r15.py
(per criterion, the majority of the usable votes; a packet needs at least three usable votes; only criteria labelled "outcome" count).

Gate pass (frozen in docs/HEAD-TO-HEAD.md, "Round 16, gate 5") = both of:
  (I1) the lower bound of the 95 percent bootstrap interval (resamples of the runs inside each task and arm) of
       OURS total minus the best other arm's total, over all tasks, is above zero;
  (V)  every cell ran with its working directory under /private/tmp and no cell loaded an owner instruction file.
Reported, not gating: the total of every arm per writer set, OURS against the best other arm per writer set, the mean list-price cost per
cell and the OURS/BASE ratio, OURS minus BASE, OURS minus the mean of the five other arms, OURS minus the pooled plain-model arms
(BASE, RCP, CV: arms that never call a skill), and the tasks where OURS trails the best other arm."""
import json, os, random, re, sys

root, tasks_path, labels_path, groups_path, runs_dir = sys.argv[1:6]
seed = sys.argv[sys.argv.index("--seed") + 1] if "--seed" in sys.argv else "r16-gate5"
boot = int(sys.argv[sys.argv.index("--boot") + 1]) if "--boot" in sys.argv else 10000
cfg = json.load(open(tasks_path)); LAB = json.load(open(labels_path)); GROUPS = json.load(open(groups_path))
TASKS = list(cfg["tasks"])
def crits(t): return [c for c in cfg["tasks"][t]["criteria"] if LAB[t][c]["label"] == "outcome"]
votes = sorted(d for d in os.listdir(root) if re.fullmatch(r"v\d+", d))
runs, usable = {}, {}
for v in votes:
    for t in TASKS:
        try:
            lab = json.load(open(f"{root}/{v}/{t}-labels.json"))
            grade = json.loads(re.search(r"\{.*\}", open(f"{root}/{v}/{t}-grade.json").read(), re.S).group(0))
        except (OSError, ValueError, AttributeError):
            continue
        want = set(cfg["tasks"][t]["criteria"])
        ok = isinstance(grade, dict) and all(isinstance(grade.get(L), dict) and grade[L] and all(isinstance(cr, dict) and set(cr) >= want and all(isinstance(cr[c], list) and len(cr[c]) == 2 and (isinstance(cr[c][1], bool) or (isinstance(cr[c][1], str) and cr[c][1].strip().lower() in ("true", "false"))) for c in want) for cr in grade[L].values()) for L in lab)
        if not ok: continue
        usable[t] = usable.get(t, 0) + 1
        for letter, arm in lab.items():
            for n, crit in grade[letter].items():
                cell = runs.setdefault((t, arm), {}).setdefault(n, {})
                for c, val in crit.items():
                    if c in want: cell.setdefault(c, []).append(val[1] is True or (isinstance(val[1], str) and val[1].strip().lower() == "true"))
for t in TASKS:
    if usable.get(t, 0) < 3: sys.exit(f"error: task {t} has {usable.get(t, 0)} usable votes (need at least 3)")
passed = lambda vs: sum(vs) * 2 > len(vs)
score = {k: [sum(1 for c in crits(k[0]) if passed(cr.get(c, []))) for n, cr in sorted(rr.items())] for k, rr in runs.items()}
arms = sorted({a for (_, a) in score}, key=lambda a: (a != "OURS", a))
others = [a for a in arms if a != "OURS"]
mean = lambda xs: sum(xs) / len(xs) if xs else 0.0
tot = lambda a, ts: sum(mean(score.get((t, a), [])) for t in ts)
out = []
P = out.append

# (I1) bootstrap over all tasks
rng = random.Random(seed); diffs = []
for _ in range(boot):
    o, b = 0.0, {a: 0.0 for a in others}
    for t in TASKS:
        for a in ["OURS"] + others:
            xs = score.get((t, a), [])
            if not xs: continue
            m = mean([rng.choice(xs) for _ in xs])
            if a == "OURS": o += m
            else: b[a] += m
    diffs.append(o - max(b.values()))
diffs.sort(); lo, hi = diffs[int(0.025 * boot)], diffs[int(0.975 * boot) - 1]
best = max(others, key=lambda a: tot(a, TASKS))
P(f"totals over all {len(TASKS)} tasks (max {sum(len(crits(t)) for t in TASKS)}): " + ", ".join(f"{a} {tot(a, TASKS):.2f}" for a in arms))
P(f"OURS minus best other arm ({best}) = {tot('OURS', TASKS) - tot(best, TASKS):.2f}; 95% bootstrap interval ({boot} resamples, seed {seed}) [{lo:.2f}, {hi:.2f}]")
i1 = lo > 0
P(f"(I1) interval lower bound above zero: {'PASS' if i1 else 'FAIL'} ({lo:.2f})")

# (V) isolation, from the transcripts
bad, n_cells = [], 0
for d in sorted(os.listdir(runs_dir)):
    f = f"{runs_dir}/{d}/out.jsonl"
    if not os.path.isfile(f): continue
    n_cells += 1
    cwd, owner = None, False
    for line in open(f, errors="replace"):
        try: e = json.loads(line)
        except ValueError: continue
        if e.get("type") == "system" and e.get("subtype") == "init":
            cwd = e.get("cwd", "")
            blob = json.dumps(e)
            owner = "/Users/efe/.claude/CLAUDE.md" in blob or "memory_paths" in e and "efe/.claude" in json.dumps(e.get("memory_paths"))
            break
    if not (cwd or "").startswith("/private/tmp/") or owner: bad.append(d)
v_ok = n_cells > 0 and not bad
P(f"(V) {n_cells} cells; working directory under /private/tmp and no owner instruction file in every cell: {'PASS' if v_ok else 'FAIL ' + ', '.join(bad[:5])}")
P(f"GATE: {'PASS' if (i1 and v_ok) else 'FAIL'}")

# Reported, not gating
P("")
P("per writer set (reported, not gating):")
for g, ts in GROUPS.items():
    ot = tot("OURS", ts); bo = max(others, key=lambda a: tot(a, ts))
    P(f"  {g} " + ", ".join(f"{a} {tot(a, ts):.2f}" for a in arms) + f"; OURS minus best other ({bo}) = {ot - tot(bo, ts):.2f}")
cost = {}
for d in sorted(os.listdir(runs_dir)):
    f = f"{runs_dir}/{d}/out.jsonl"
    m = re.fullmatch(r"(.+?)-([A-Z_]+)-(\d+)", d)
    if not m or not os.path.isfile(f): continue
    for line in open(f, errors="replace"):
        try: e = json.loads(line)
        except ValueError: continue
        if e.get("type") == "result" and "total_cost_usd" in e:
            cost.setdefault(m.group(2), []).append(float(e["total_cost_usd"]))
if cost:
    P("mean list-price cost per cell: " + ", ".join(f"{a} {mean(cost[a]):.4f}" for a in sorted(cost)) + (f"; OURS/BASE {mean(cost['OURS']) / mean(cost['BASE']):.2f}" if "OURS" in cost and "BASE" in cost else ""))
plain = [a for a in ("BASE", "RCP", "CV") if a in arms]
P(f"OURS minus BASE = {tot('OURS', TASKS) - tot('BASE', TASKS):.2f}")
P(f"OURS minus the mean of the {len(others)} other arms = {tot('OURS', TASKS) - mean([tot(a, TASKS) for a in others]):.2f}")
P(f"OURS minus the mean of the plain-model arms {plain} = {tot('OURS', TASKS) - mean([tot(a, TASKS) for a in plain]):.2f}")
P("tasks where OURS trails the best other arm by more than 0.34: " + str([(t, round(max(mean(score.get((t, a), [])) for a in others) - mean(score.get((t, 'OURS'), [])), 2)) for t in TASKS if max(mean(score.get((t, a), [])) for a in others) - mean(score.get((t, 'OURS'), [])) > 0.34]))
print("\n".join(out))
