#!/usr/bin/env python3
"""usage: make-w-tasks.py <stage-dir> <set-name e.g. W1>
Builds tasks.json and labels.json in <stage-dir> from a writer's folders t1..tN (prompt.txt, truth.txt, criteria.md) by script, without
anyone reading them. Task ids <SET>T1.. (for example W1T1), fixtures H<SET>T1.., every criterion labelled outcome (the writers were told
to write outcome criteria only). Fails unless each folder has exactly 5 numbered criteria."""
import json, os, re, sys
stage, sname = sys.argv[1], sys.argv[2]
tasks, labels = {}, {}
for name in sorted((d for d in os.listdir(stage) if re.fullmatch(r"t\d+", d)), key=lambda x: int(x[1:])):
    base = os.path.join(stage, name)
    prompt = open(os.path.join(base, "prompt.txt"), encoding="utf-8").read().strip()
    truth = open(os.path.join(base, "truth.txt"), encoding="utf-8").read().strip()
    head, items, cur = [], [], None
    for line in open(os.path.join(base, "criteria.md"), encoding="utf-8").read().strip().split("\n"):
        m = re.match(r"^\s*(\d+)\.\s+(.*)$", line)
        if m: items.append(m.group(2)); cur = len(items) - 1
        elif cur is None: head.append(line.strip())
        elif line.strip(): items[cur] += " " + line.strip()
    if len(items) != 5: sys.exit(f"{name}: expected 5 numbered criteria, found {len(items)}")
    tid = f"{sname}T{name[1:]}"
    tasks[tid] = {"title": head[0] if head else tid, "fixture": "H" + tid, "prompt": prompt,
                  "truth": truth + ("\n" + "\n".join(h for h in head[1:] if h) if len(head) > 1 else ""),
                  "criteria": {f"C{i + 1}": t for i, t in enumerate(items)}}
    labels[tid] = {f"C{i + 1}": {"label": "outcome", "note": "Checkable from the delivered answer and files against truth.txt"} for i in range(5)}
json.dump({"suffix": "", "groundTruth": {"fixture": "Synthetic history added to pinned public repositories by build-fixture.sh; truth.txt of each task states the conventions."}, "invoked": {}, "tasks": tasks}, open(os.path.join(stage, "tasks.json"), "w"), indent=1)
json.dump(labels, open(os.path.join(stage, "labels.json"), "w"), indent=1)
print("wrote", " ".join(tasks))
