#!/usr/bin/env python3
"""t5 ground truth: notes for patch release 3.1.2, plus what is on the development line but not in 3.1.2.

Conventions (and why):
- 3.1.2 content = commits reachable from 'Release 3.1.2' and not from 'Release 3.1.1' (R1..R2). HEAD is the development
  line, which later merged the stable line back, so a range ending at HEAD would wrongly include development-only work.
  The release commit itself is not a change.
- Credit = the AUTHOR of the original change. A cherry-pick keeps the author and puts the maintainer in the committer
  field, so the committer (Mara Linden) is not thanked for the backports. Co-authored-by trailers get credit too.
- The same fix exists twice (original on the development line, copy on the stable line, different shas and, for one,
  a different message). A change is one change: copies are matched by `git patch-id --stable` of the diff.
  The stable-line copy is what shipped; the entry is written once.
- "Not in 3.1.2" = non-merge commits reachable from HEAD but not from R2 (the development line), minus any whose
  patch-id matches a commit that shipped in 3.1.2. Merge commits are never listed.
"""
import re, subprocess, sys
repo = sys.argv[1]
def git(*a, inp=None):
    return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True, input=inp).stdout
def find(subj):
    return [l.split()[0] for l in git("log", "--format=%H %s").splitlines() if l.split(" ", 1)[1] == subj][0]
R1, R2 = find("Release 3.1.1"), find("Release 3.1.2")
def pid(s):
    out = git("patch-id", "--stable", inp=git("diff-tree", "-p", "--no-commit-id", s)).split()
    return out[0] if out else None
def info(s):
    f = git("log", "-1", "--format=%an%x00%cn%x00%s%x00%B", s).split("\0")
    co = re.findall(r"^Co-authored-by:\s*(.*?)\s*<", f[3], re.M)
    return dict(author=f[0], committer=f[1], subj=f[2], co=co)
shipped = [s for s in git("rev-list", "--reverse", "--no-merges", f"{R1}..{R2}").split() if s != R2]
dev = git("rev-list", "--reverse", "--no-merges", f"{R2}..HEAD").split()
dev_by_pid = {pid(s): s for s in dev}
print("RELEASE 3.1.2 =", R2[:7], " previous =", R1[:7])
print(f"IN 3.1.2 ({len(shipped)} changes, each once)")
for s in shipped:
    i = info(s)
    origin = dev_by_pid.get(pid(s))
    extra = f"; same change as development-line {origin[:7]} '{info(origin)['subj']}'" if origin else "; only on the stable line"
    credit = i["author"] + (" with " + ", ".join(i["co"]) if i["co"] else "")
    print(f"  {s[:7]} {i['subj']}  credit: {credit}  (committer: {i["committer"]}){extra}")
ship_pids = {pid(s) for s in shipped}
print("ON THE DEVELOPMENT LINE BUT NOT IN 3.1.2")
for s in dev:
    if pid(s) in ship_pids: continue
    i = info(s)
    print(f"  {s[:7]} {i['subj']}  [{i['author']}]")
print("NOT TO BE LISTED AS SEPARATE ITEMS (development-line copies of backported fixes)")
for s in dev:
    if pid(s) in ship_pids: print(f"  {s[:7]} {info(s)['subj']}")
