#!/usr/bin/env python3
"""usage: make-dev15.py <workdir> <d-src-dir> <e-src-dir> <dev-dir>
Merges the development tasks of round 15 into one tasks.json and labels.json under <workdir>: set d (D1-D5), set e (E1-E5) and the
controller's own T11-T16, with real copies of their fixtures in <workdir>/fixtures. Needs the fixture folders of the earlier runs
(<workdir>/../final-d/fixtures, ../final-e/fixtures, ../gate2/fixtures, given as FIX_D, FIX_E, FIX_V environment variables)."""
import json, os, shutil, sys
W, DS, ES, DEV = sys.argv[1:5]
tasks, labels = {}, {}
for tf, lf in ((f"{DS}/tasks.json", f"{DS}/labels.json"), (f"{ES}/tasks.json", f"{ES}/labels.json"), (f"{DEV}/dev-tasks.json", f"{DEV}/dev-labels.json")):
    t, l = json.load(open(tf)), json.load(open(lf))
    for k, v in t["tasks"].items(): assert k not in tasks, k; tasks[k] = v
    labels.update(l)
inv = json.load(open(f"{DEV}/dev-tasks.json"))["invoked"]
os.makedirs(W, exist_ok=True)
json.dump({"suffix": "Save any files in the current directory.", "groundTruth": {"fixture": "Synthetic history added to pinned public repositories or built from scratch; each task's truth line states the conventions."}, "invoked": inv, "tasks": tasks}, open(f"{W}/tasks.json", "w"), indent=1)
json.dump(labels, open(f"{W}/labels.json", "w"), indent=1)
fx = f"{W}/fixtures"; os.makedirs(fx, exist_ok=True)
for src_env, prefix in (("FIX_D", "HD"), ("FIX_E", "HE"), ("FIX_V", "HCV")):
    src = os.environ[src_env]
    for n in sorted(os.listdir(src)):
        if n.startswith(prefix) and not os.path.exists(f"{fx}/{n}"): shutil.copytree(f"{src}/{n}", f"{fx}/{n}")
print("tasks:", " ".join(tasks))
