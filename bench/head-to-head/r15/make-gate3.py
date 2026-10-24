#!/usr/bin/env python3
"""usage: make-gate3.py <workdir> <W7-stage> <W8-stage> <W9-stage>
Merges the tasks of the three independent writers (stage folders already holding tasks.json/labels.json from make-w-tasks.py) with the
read sets d and e into <workdir>/tasks.json and labels.json, builds the writers' fixtures with their own build-fixture.sh into
<workdir>/fixtures/H<SET>T<n> and copies the d/e fixtures (FIX_D, FIX_E environment variables). Prints only the task ids per group."""
import json, os, re, shutil, subprocess, sys
W = sys.argv[1]; stages = dict(zip(("W7", "W8", "W9"), sys.argv[2:5]))
tasks, labels, groups = {}, {}, {}
def add(group, tf, lf):
    t, l = json.load(open(tf)), json.load(open(lf))
    for k, v in t["tasks"].items(): assert k not in tasks, k; tasks[k] = v; groups.setdefault(group, []).append(k)
    labels.update(l)
for s, st in stages.items(): add(s, f"{st}/tasks.json", f"{st}/labels.json")
os.makedirs(f"{W}/fixtures", exist_ok=True)
for s, st in stages.items():
    for tid in groups[s]:
        n = tid.split("T")[-1]; dest = f"{W}/fixtures/H{tid}"
        if os.path.exists(dest): continue
        r = subprocess.run(["bash", f"{st}/t{n}/build-fixture.sh", dest], capture_output=True, text=True)
        if r.returncode: sys.exit(f"fixture build failed for {tid}: {r.stderr[-300:]}")
json.dump({"suffix": "", "groundTruth": {"fixture": "Synthetic history added to pinned public repositories; each task's truth line states the conventions."}, "invoked": json.load(open(f"{os.path.dirname(os.path.abspath(__file__))}/../dev/dev-tasks.json"))["invoked"], "tasks": tasks}, open(f"{W}/tasks.json", "w"), indent=1)
json.dump(labels, open(f"{W}/labels.json", "w"), indent=1)
json.dump(groups, open(f"{W}/groups.json", "w"), indent=1)
print({g: len(v) for g, v in groups.items()})
