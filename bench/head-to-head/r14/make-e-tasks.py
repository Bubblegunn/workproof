#!/usr/bin/env python3
"""usage: make-e-tasks.py <stage-dir>
Builds tasks.json and labels.json for held-out set e from the writer's folders e1..e5 (prompt.txt, truth.txt, criteria.md)
by script, without anyone reading them. Task ids E1..E5, fixtures HE1..HE5, same shape as the set d files. Every criterion is
labelled outcome (the writer was told to write outcome criteria only). Fails if a folder lacks a file or does not hold
exactly 5 numbered criteria."""
import json, os, re, sys
stage = sys.argv[1]
tasks, labels = {}, {}
for name in sorted(d for d in os.listdir(stage) if re.fullmatch(r"e\d+", d)):
    base = os.path.join(stage, name)
    prompt = open(os.path.join(base, "prompt.txt"), encoding="utf-8").read().strip()
    truth = open(os.path.join(base, "truth.txt"), encoding="utf-8").read().strip()
    crit_md = open(os.path.join(base, "criteria.md"), encoding="utf-8").read().strip().split("\n")
    head, items, cur = [], [], None
    for line in crit_md:
        m = re.match(r"^\s*(\d+)\.\s+(.*)$", line)
        if m: items.append(m.group(2)); cur = len(items) - 1
        elif cur is None: head.append(line.strip())
        elif line.strip(): items[cur] += " " + line.strip()
    if len(items) != 5: sys.exit(f"{name}: expected 5 numbered criteria, found {len(items)}")
    tid = name.upper()
    tasks[tid] = {"title": head[0] if head else name, "fixture": "H" + tid, "prompt": prompt,
                  "truth": truth + ("\n" + "\n".join(h for h in head[1:] if h) if len(head) > 1 else ""),
                  "criteria": {f"C{i + 1}": t for i, t in enumerate(items)}}
    labels[tid] = {f"C{i + 1}": {"label": "outcome", "note": "Checkable from the delivered answer and files against truth.txt"} for i in range(5)}
if len(tasks) != 5: sys.exit(f"expected 5 tasks, found {len(tasks)}")
json.dump({"suffix": "", "groundTruth": {"fixture": "Synthetic history added to pinned public repositories by build-fixture.sh; truth.txt of each task states the conventions."}, "invoked": {}, "tasks": tasks}, open(os.path.join(stage, "tasks.json"), "w"), indent=1)
json.dump(labels, open(os.path.join(stage, "labels.json"), "w"), indent=1)
print("wrote tasks.json and labels.json for", ", ".join(tasks))
