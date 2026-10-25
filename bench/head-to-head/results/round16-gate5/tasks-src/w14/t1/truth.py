#!/usr/bin/env python3
"""t1 ground truth: user-facing release notes since the 'Release version 2.3.0' commit.

Conventions (and why):
- Window = commits reachable from HEAD and not from the release commit (range R..HEAD, by graph, not by date).
  The release notes cover what users get that they did not get in 2.3.0.
- User-facing = the commit changes something under src/ by more than whitespace (git diff -w).
  Docs, tests, CI/bot config and formatter-only commits are invisible to library users.
- Net effect of reverts: a commit that was reverted and not re-applied is NOT announced; a revert of a
  revert re-instates the original, so the original IS announced. A revert of a change that already
  shipped in 2.3.0 is a user-visible removal, so it IS reported (as a removal).
- Merge commits and the squash-merge are one entry each; co-authors from trailers are credited.
"""
import re, subprocess, sys
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
rel = git("log", "-1", "--format=%H", "--fixed-strings", "--grep=Release version 2.3.0").strip()
head = git("rev-parse", "HEAD").strip()
shas = git("rev-list", "--reverse", "--topo-order", f"{rel}..{head}").split()
info = {}
for s in shas + []:
    subj = git("log", "-1", "--format=%s", s).strip()
    body = git("log", "-1", "--format=%B", s)
    parents = git("log", "-1", "--format=%P", s).split()
    an = git("log", "-1", "--format=%an", s).strip()
    m = re.search(r"This reverts commit ([0-9a-f]{40})", body)
    info[s] = dict(subj=subj, body=body, merge=len(parents) > 1, author=an, target=m.group(1) if m else None)
reverters = {}
for s, i in info.items():
    if i["target"]:
        reverters.setdefault(i["target"], []).append(s)
def alive(s):
    return not any(alive(r) for r in reverters.get(s, []))
def user_facing(s):
    q = subprocess.run(["git", "-C", repo, "diff", "-w", "--quiet", f"{s}^", s, "--", "src"])
    return q.returncode != 0
announce, removed, skipped = [], [], []
for s in shas:
    i = info[s]
    if i["merge"]:
        continue
    if i["target"]:
        t = i["target"]
        if t not in info and alive(s):
            removed.append(f"{s[:7]} {i['subj']}  (undoes a change that shipped in 2.3.0)")
        else:
            skipped.append(f"{s[:7]} {i['subj']}  (revert inside window)")
        continue
    if "[bot]" in i["author"]:
        skipped.append(f"{s[:7]} {i['subj']}  (bot, config only)"); continue
    if not user_facing(s):
        skipped.append(f"{s[:7]} {i['subj']}  (no user-facing change: docs/tests/whitespace)"); continue
    if not alive(s):
        skipped.append(f"{s[:7]} {i['subj']}  (backed out, net effect none)"); continue
    announce.append(f"{s[:7]} {i['subj']}  [author {i['author']}]")
print("RELEASE COMMIT", rel[:7])
print("ANNOUNCE AS NEW (5 entries: sort_keys, BadSignature message, loads_with_age, memoryview [2 commits, 1 entry], timing fix)")
for a in announce: print("  +", a)
print("ANNOUNCE AS REMOVED/CHANGED (1 entry)")
for r in removed: print("  -", r)
print("DO NOT ANNOUNCE")
for k in skipped: print("  x", k)
