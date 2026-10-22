#!/usr/bin/env python3
"""usage: task.py <T1..T8> prompt|fixture [fixtures-dir]  - print one field of a task from tasks.json."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(HERE, "tasks.json")))
if os.environ.get("H2H_TASKS"):   # held-out set: its own tasks file, same shape; the competitor "invoked" prompts stay those of tasks.json
    cfg = {**json.load(open(os.environ["H2H_TASKS"])), "invoked": cfg["invoked"]}
if sys.argv[1] in cfg["invoked"]:
    print(cfg["invoked"][sys.argv[1]].strip())
    sys.exit(0)
task = cfg["tasks"].get(sys.argv[1])
if sys.argv[2] == "fixture":
    print(task["fixture"])
else:
    home = (sys.argv[3] if len(sys.argv) > 3 else "") + "/F4/home"
    print(task["prompt"].replace("{suffix}", cfg["suffix"]).replace("{home}", home))
