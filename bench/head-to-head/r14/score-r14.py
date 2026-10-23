#!/usr/bin/env python3
"""Round 14 copy of dev/score-dev.py: votes carry the reason first and the verdict second; fewer than three usable votes for a packet is an error.
usage: score-r14.py <grade-root> <tasks.json> [--seed S] [--boot N]
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
# --labels <file>: only criteria labelled "outcome" count (the gate counts outcome criteria only); without it all criteria count.
LAB = json.load(open(sys.argv[sys.argv.index("--labels") + 1])) if "--labels" in sys.argv else None
def crits(t): return [c for c in cfg["tasks"][t]["criteria"] if LAB is None or LAB[t][c]["label"] == "outcome"]
votes = sorted(d for d in os.listdir(root) if re.fullmatch(r"v\d+", d))
# runs[(task, arm)][run] = {crit: [vote bools]}
runs = {}
usable = {}
invalid = {}
for v in votes:
    for t in TASKS:
        try:
            lab = json.load(open(f"{root}/{v}/{t}-labels.json"))
            m = re.search(r"\{.*\}", open(f"{root}/{v}/{t}-grade.json").read(), re.S)
            grade = json.loads(m.group(0))
        except (OSError, ValueError, AttributeError):
            continue
        # A vote counts only if every arm letter has runs and every run carries every criterion as [reason, true|false].
        want = set(cfg["tasks"][t]["criteria"])
        ok = isinstance(grade, dict) and all(isinstance(grade.get(L), dict) and grade[L] and all(isinstance(cr, dict) and set(cr) >= want and all(isinstance(cr[c], list) and len(cr[c]) == 2 and isinstance(cr[c][1], bool) for c in want) for cr in grade[L].values()) for L in lab)
        if not ok:
            invalid[t] = invalid.get(t, 0) + 1
            continue
        usable[t] = usable.get(t, 0) + 1
        for letter, arm in lab.items():
            for n, crit in grade[letter].items():
                cell = runs.setdefault((t, arm), {}).setdefault(n, {})
                for c, val in crit.items():
                    if c in want: cell.setdefault(c, []).append(val[1])
for t in TASKS:
    if usable.get(t, 0) < 3:
        sys.exit(f"error: task {t} has {usable.get(t, 0)} usable votes (need at least 3)")
def passed(vs): return sum(vs) * 2 > len(vs)
score = {}   # (task, arm) -> list of run scores
for (t, arm), rr in runs.items():
    score[(t, arm)] = [sum(1 for c in crits(t) if passed(crit.get(c, []))) for n, crit in sorted(rr.items())]
arms = sorted({a for (_, a) in score}, key=lambda a: (a != "OURS", a))
mean = lambda xs: sum(xs) / len(xs) if xs else 0.0
print("per task mean (of 5), valid votes per task:", {t: usable[t] for t in TASKS}, "invalid votes ignored:", invalid)
print("task | " + " | ".join(arms))
for t in TASKS:
    print(t + " | " + " | ".join(f"{mean(score.get((t, a), [])):.2f} {score.get((t, a), [])}" for a in arms))
tot = {a: sum(mean(score.get((t, a), [])) for t in TASKS) for a in arms}
mx = sum(len(crits(t)) for t in TASKS)
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
print(f"bootstrap ({boot} resamples, seed {seed}) 95% interval of OURS minus best other arm: [{lo:.4f}, {hi:.4f}]")
over = [(t, d) for t, d in behind if d > 0.34]
print("clear lead (interval lower bound > 0, and OURS trails the best other arm by more than 0.34 on at most one task):",
      lo > 0 and len(over) <= 1)

# Per-task rules, printed in full (they do not decide the launch claim I1).
top = {t: len(crits(t)) for t in TASKS}
ruleB, ruleBp = [], []
for t in TASKS:
    o = mean(score.get((t, "OURS"), []))
    rival = max(others, key=lambda a: mean(score.get((t, a), [])))
    r = mean(score.get((t, rival), []))
    ceiling = any(mean(score.get((t, a), [])) >= top[t] for a in others)
    passes = (o >= top[t]) if ceiling else (o > r)
    ruleB.append((t, passes, round(o, 2), rival, round(r, 2)))
    if not passes: ruleBp.append((t, round(r - o, 2)))
print("Rule B per task (ours strictly above every other arm; ceiling rule: if any other arm is at the maximum, ours must be too):")
for x in ruleB: print("  ", x)
lost_o = mx - tot["OURS"]; lost_b = mx - tot[best]
print(f"Rule A: our lost points {lost_o:.2f}, best other arm's lost points {lost_b:.2f}; ratio {lost_o / lost_b if lost_b else float('inf'):.2f} (pass if <= 0.80)")
print("Rule B': Rule B fails on at most one task and there by 0.34 or less:", len(ruleBp) == 0 or (len(ruleBp) == 1 and ruleBp[0][1] <= 0.34), ruleBp)
# Sum over tasks of each competitor's better arm (plain or invoked) is shown beside the per-arm totals.
fam = {}
for a in others: fam.setdefault(a[:-2] if a.endswith("_I") else a, []).append(a)
print("better of plain and invoked, per competitor family:", {f: max(tot[a] for a in arms_) for f, arms_ in fam.items()})

# Per-task better of plain and invoked, per competitor family (descriptive, beside the single-best-arm claim above).
famtot = {}
for f, arms_ in fam.items():
    famtot[f] = sum(max(mean(score.get((t, a), [])) for a in arms_) for t in TASKS)
bestfam = max(famtot, key=famtot.get)
print("per-task better of plain and invoked, family totals:", {f: round(v, 2) for f, v in famtot.items()}, f"; OURS minus best family = {tot['OURS'] - famtot[bestfam]:.2f} ({bestfam})")
