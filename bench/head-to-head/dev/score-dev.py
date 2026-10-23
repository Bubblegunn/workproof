#!/usr/bin/env python3
"""usage: score-dev.py <grade-root> <tasks.json> [--seed S] [--boot N]
<grade-root> holds vote folders v1, v2, v3 (each made by assemble.py with its own seed and graded by grade.sh).
Per criterion of each run the three votes are combined by majority (a vote that could not be parsed is ignored; fewer
than two usable votes for a packet is an error). Prints per-task means, arm totals (sum over tasks of the mean run score),
and the paired bootstrap of OURS minus the best other arm: tasks are fixed, the runs of every arm inside each task are
resampled with replacement. Pure arithmetic, no model call."""
import json, os, random, re, sys
root, tasks_path = sys.argv[1], sys.argv[2]
seed = sys.argv[sys.argv.index("--seed") + 1] if "--seed" in sys.argv else "r13-dev"
boot = int(sys.argv[sys.argv.index("--boot") + 1]) if "--boot" in sys.argv else 10000
cfg = json.load(open(tasks_path))
TASKS = list(cfg["tasks"])
votes = sorted(d for d in os.listdir(root) if re.fullmatch(r"v\d+", d))
# runs[(task, arm)][run] = {crit: [vote bools]}
runs = {}
usable = {}
for v in votes:
    for t in TASKS:
        try:
            lab = json.load(open(f"{root}/{v}/{t}-labels.json"))
            m = re.search(r"\{.*\}", open(f"{root}/{v}/{t}-grade.json").read(), re.S)
            grade = json.loads(m.group(0))
        except (OSError, ValueError, AttributeError):
            continue
        usable[t] = usable.get(t, 0) + 1
        for letter, arm in lab.items():
            for n, crit in grade.get(letter, {}).items():
                cell = runs.setdefault((t, arm), {}).setdefault(n, {})
                for c, val in crit.items():
                    cell.setdefault(c, []).append(bool(val[0]))
for t in TASKS:
    if usable.get(t, 0) < 2:
        sys.exit(f"error: task {t} has {usable.get(t, 0)} usable votes (need at least 2)")
def passed(vs): return sum(vs) * 2 > len(vs)
score = {}   # (task, arm) -> list of run scores
for (t, arm), rr in runs.items():
    score[(t, arm)] = [sum(1 for c in cfg["tasks"][t]["criteria"] if passed(crit.get(c, []))) for n, crit in sorted(rr.items())]
arms = sorted({a for (_, a) in score}, key=lambda a: (a != "OURS", a))
mean = lambda xs: sum(xs) / len(xs) if xs else 0.0
print("per task mean (of 5), votes usable per task:", {t: usable[t] for t in TASKS})
print("task | " + " | ".join(arms))
for t in TASKS:
    print(t + " | " + " | ".join(f"{mean(score.get((t, a), [])):.2f} {score.get((t, a), [])}" for a in arms))
tot = {a: sum(mean(score.get((t, a), [])) for t in TASKS) for a in arms}
mx = sum(len(cfg["tasks"][t]["criteria"]) for t in TASKS)
print("total (max %d): " % mx + ", ".join(f"{a} {tot[a]:.2f}" for a in arms))
others = [a for a in arms if a != "OURS"]
best = max(others, key=lambda a: tot[a])
print(f"best other arm by total: {best} {tot[best]:.2f}; OURS minus best = {tot['OURS'] - tot[best]:.2f}")
behind = [(t, mean(score.get((t, best), [])) - mean(score.get((t, 'OURS'), []))) for t in TASKS]
print("tasks where OURS trails the best other arm (that arm's task mean minus ours):", [(t, round(d, 2)) for t, d in behind if d > 0])
rng = random.Random(seed)
diffs = []
for _ in range(boot):
    t_o = 0.0
    t_b = {a: 0.0 for a in others}
    for t in TASKS:
        for a in ["OURS"] + others:
            xs = score.get((t, a), [])
            if not xs: continue
            m = mean([rng.choice(xs) for _ in xs])
            if a == "OURS": t_o += m
            else: t_b[a] += m
    diffs.append(t_o - max(t_b.values()))
diffs.sort()
lo, hi = diffs[int(0.025 * boot)], diffs[int(0.975 * boot) - 1]
print(f"bootstrap ({boot} resamples, seed {seed}) 95% interval of OURS minus best other arm: [{lo:.2f}, {hi:.2f}]")
over = [(t, d) for t, d in behind if d > 0.34]
print("clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task):",
      lo > 0 and len(over) <= 1)
