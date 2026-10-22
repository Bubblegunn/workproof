#!/usr/bin/env python3
"""usage: score.py <grade-dir> <runs-dir> [--labels labels.json]
Per-run scores, means, min-max and n for every arm, for outcome criteria only (the gate) and for all criteria, plus the
Skill-call record for OURS and the win rule with the ceiling ruling and the better-of-two-arms comparison for competitors."""
import json, os, re, sys
G, RUNS = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
TASKS_PATH = sys.argv[sys.argv.index("--tasks") + 1] if "--tasks" in sys.argv else os.path.join(HERE, "tasks.json")
cfg = json.load(open(TASKS_PATH))
labels_path = sys.argv[sys.argv.index("--labels") + 1] if "--labels" in sys.argv else os.path.join(HERE, "labels.json")
LAB = json.load(open(labels_path))
TASKS = list(cfg["tasks"])
ORDER = ["OURS", "BASE", "RCP", "RCP_I", "JD", "JD_I", "GAP", "GAP_I", "SR", "SR_I", "CV", "CV_I"]
runs = {}   # (task, arm) -> {run: {crit: bool}}
for t in TASKS:
    lab = json.load(open(f"{G}/{t}-labels.json"))
    m = re.search(r"\{.*\}", open(f"{G}/{t}-grade.json").read(), re.S)
    grade = json.loads(m.group(0))
    for letter, arm in lab.items():
        runs[(t, arm)] = {n: {c: bool(v[0]) for c, v in crit.items()} for n, crit in grade.get(letter, {}).items()}
ARMS = [a for a in ORDER if any(k[1] == a for k in runs)]

def scores(t, arm, kind):
    cs = [c for c in cfg["tasks"][t]["criteria"] if kind == "all" or LAB[t][c]["label"] == "outcome"]
    return [sum(1 for c in cs if r.get(c)) for r in runs.get((t, arm), {}).values()], len(cs)

def cell(t, arm, kind):
    sc, mx = scores(t, arm, kind)
    if not sc: return "n/a"
    return f"{sum(sc)/len(sc):.2f} ({min(sc)}-{max(sc)}, n={len(sc)})"

def mean(t, arm, kind):
    sc, _ = scores(t, arm, kind)
    return sum(sc) / len(sc) if sc else 0.0

def skill_calls(t):
    out = []
    for r in sorted(x for x in os.listdir(RUNS) if re.fullmatch(rf"{t}-OURS-\d+", x)):
        n = 0
        for line in open(f"{RUNS}/{r}/out.jsonl"):
            try: o = json.loads(line)
            except ValueError: continue
            if o.get("type") == "assistant":
                n += sum(1 for b in o["message"]["content"] if b.get("type") == "tool_use" and b.get("name") == "Skill")
        out.append(n)
    return out

def own_runs(t):
    return sorted(int(x.rsplit("-", 1)[1]) for x in os.listdir(RUNS) if re.fullmatch(rf"{t}-OURS-\d+", x))

def used_command(t, n, needle):
    try:
        for line in open(f"{RUNS}/{t}-OURS-{n}/out.jsonl"):
            try: o = json.loads(line)
            except ValueError: continue
            if o.get("type") == "assistant":
                for b in o["message"]["content"]:
                    if b.get("type") == "tool_use" and needle in str((b.get("input") or {}).get("command", "")): return True
    except OSError:
        return False
    return False

def table(kind):
    print("| Task (max) | " + " | ".join(ARMS) + " |\n|---|" + "---|" * len(ARMS))
    tot = {a: 0.0 for a in ARMS}
    for t in TASKS:
        mx = scores(t, "OURS", kind)[1]
        print(f"| {t} ({mx}) | " + " | ".join(cell(t, a, kind) for a in ARMS) + " |")
        for a in ARMS: tot[a] += mean(t, a, kind)
    print(f"| Total ({sum(scores(t, 'OURS', kind)[1] for t in TASKS)}) | " + " | ".join(f"{tot[a]:.2f}" for a in ARMS) + " |")
    return tot

print("## Outcome criteria only (the gate counts these)\n")
tot_o = table("outcome")
print("\n## All criteria (process criteria included)\n")
tot_a = table("all")
print("\n## Skill calls in OURS runs\n")
for t in TASKS: print(f"- {t}: {skill_calls(t)}")

# Gate on outcome criteria only (spec F1). A competitor is compared by the better of its plain and invoked arm, per task and in total.
# The skill-call rate and the CLI-command requirement are process measures: they are printed beside the table and are also
# evaluated under the old condition (rounds 3 to 7 required them) so both verdicts can be shown.
COMP = [("BASE", ["BASE"]), ("RCP", ["RCP", "RCP_I"]), ("JD", ["JD", "JD_I"]), ("GAP", ["GAP", "GAP_I"]), ("SR", ["SR", "SR_I"]), ("CV", ["CV", "CV_I"])]
def best(t, group):
    vals = [mean(t, a, "outcome") for a in group if (t, a) in runs]
    return max(vals) if vals else 0.0
print("\n## Process measures beside the table (not part of the gate)\n")
for t in TASKS:
    sc = skill_calls(t)
    if not sc: continue
    line = f"- {t}: Skill call in {sum(1 for n in sc if n > 0)} of {len(sc)} runs of ours"
    need = cfg.get("requireCommand", {}).get(t)
    if need: line += f"; ran `{need}` in {sum(1 for n in own_runs(t) if used_command(t, n, need))} of {len(own_runs(t))}"
    print(line)
print("\n## Gate (outcome criteria only, better of plain and invoked arm per competitor)\n")
ok_b = True; ok_old = True
for t in TASKS:
    ours = mean(t, "OURS", "outcome"); mx = scores(t, "OURS", "outcome")[1]
    others = {name: best(t, g) for name, g in COMP}
    top = max(others.values())
    if top >= mx - 1e-9: passed = ours >= mx - 1e-9; why = f"ceiling ruling: a competitor reaches the maximum {mx}; we must too"
    else: passed = ours > top + 1e-9; why = "strictly above every competitor"
    old = passed; old_why = ""
    if t in cfg.get("requireSkill", []) and any(n == 0 for n in skill_calls(t)):
        old = False; old_why = "a run of ours made no Skill call"
    need = cfg.get("requireCommand", {}).get(t)
    if need and not all(used_command(t, n, need) for n in own_runs(t)):
        old = False; old_why = f"a run of ours did not run `{need}`"
    ok_b &= passed; ok_old &= old
    print(f"- {t}: ours {ours:.2f}, best competitor {top:.2f} ({max(others, key=others.get)}), max {mx}: {'PASS' if passed else 'FAIL'} ({why})" + (f"; under the old condition: FAIL ({old_why})" if passed and not old else ""))
best_tot = {name: max(tot_o[a] for a in g if a in ARMS) for name, g in COMP}
bn = max(best_tot, key=best_tot.get)
ok_a = tot_o["OURS"] >= 1.2 * best_tot[bn]
print(f"\nrule A: ours {tot_o['OURS']:.2f}, best competitor total {best_tot[bn]:.2f} ({bn}), needs {1.2 * best_tot[bn]:.2f}: {'PASS' if ok_a else 'FAIL'}")
print(f"rule B: {'PASS' if ok_b else 'FAIL'}")
print("gate:", "PASS" if ok_a and ok_b else "FAIL")
print("gate under the old condition (Skill call and CLI command required in every run of ours):", "PASS" if ok_a and ok_old else "FAIL")
