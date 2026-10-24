#!/usr/bin/env python3
"""Ground truth for t3: who does substantive work (term 5 Oct 2026 - 22 Jan 2027, UK time) on a JavaScript team repo.

Conventions (and why):
- Window: calendar days 2026-10-05 .. 2027-01-22 in Europe/London.  The date used is the AUTHOR date instant (when
  the work was written), not the committer date (a rebase on 3 Feb must not push Sofia's 20 Jan work out).
  Exception: an author date earlier than the repository's oldest commit is impossible (unset clock, here 1970-01-01);
  for that case the committer date is used.
- Identities: same display name = same student (Noah and Viktor each have two e-mail addresses).  Bots
  ("[bot]") and the instructor are not students.  Merge commits are not authored work.
- Substantive line = an added line, in a non-generated file, that is not blank, not a comment-only line in
  code (starts with //), and not a whitespace-only change (diff run with -w).  Excluded as generated:
  package-lock.json and dist/.  Pure renames (git -M, 100% similarity) add no lines.
- A commit that a later `git revert` undoes is dropped together with its revert commit (the net work is zero);
  the later re-implementation is a separate commit and counts normally.
- raw = in-window non-merge human commits (what shortlog -sn would show after merging aliases);
  substantive commits = those with at least one substantive added line.
- Ranking is by substantive lines.
"""
import re, subprocess, sys
from collections import defaultdict
from datetime import datetime, date
from zoneinfo import ZoneInfo

repo = sys.argv[1]
TZ = ZoneInfo("Europe/London")
START, END = date(2026, 10, 5), date(2027, 1, 22)
STUDENTS = {"Sofia Marin", "Noah Brandt", "Viktor Pavlenko", "Lena Fischer"}
GENERATED = ("package-lock.json", "dist/")
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout

root_sha = git("rev-list", "--max-parents=0", "HEAD").split()[0]
root_date = datetime.fromisoformat(git("log", "-1", "--format=%aI", root_sha).strip())
recs = git("log", "--no-merges", "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%cI%x1f%B%x1e").split("\x1e")
commits = []
for r in recs:
    r = r.strip("\n")
    if not r: continue
    sha, an, ae, ai, ci, body = r.split("\x1f", 5)
    commits.append(dict(sha=sha, name=an, email=ae, a=datetime.fromisoformat(ai), c=datetime.fromisoformat(ci), body=body))

reverted = set()
for c in commits:
    for m in re.finditer(r"This reverts commit ([0-9a-f]{40})", c["body"]):
        reverted.add(m.group(1)); reverted.add(c["sha"])

def when(c):
    return c["c"] if c["a"] < root_date else c["a"]

def substantive(sha):
    out = git("show", "-w", "-M", "-U0", "--no-color", "--format=", sha)
    cur, n = None, 0
    for l in out.splitlines():
        if l.startswith("+++ "):
            cur = l[6:] if l.startswith("+++ b/") else None
        elif l.startswith("+") and cur and not cur.startswith(GENERATED):
            t = l[1:].strip()
            if not t: continue
            if cur.endswith(".js") and t.startswith("//"): continue
            n += 1
    return n

raw = defaultdict(int); subc = defaultdict(int); lines = defaultdict(int)
notes = []
for c in commits:
    if c["name"] not in STUDENTS: continue
    w = when(c)
    d = w.astimezone(TZ).date()
    if not (START <= d <= END):
        if c["a"].year >= 2026 or w.year >= 2026:
            notes.append(f"outside window: {c['name']} {c['sha'][:8]} used-date {w.astimezone(TZ).isoformat()}")
        continue
    raw[c["name"]] += 1
    if c["sha"] in reverted:
        notes.append(f"reverted pair dropped: {c['name']} {c['sha'][:8]} {c['body'].splitlines()[0]}")
        continue
    n = substantive(c["sha"])
    if n:
        subc[c["name"]] += 1; lines[c["name"]] += n

print("Window (Europe/London): 2026-10-05 .. 2027-01-22 inclusive")
print("Ranking by substantive added lines (raw commits in brackets):")
for rank, n in enumerate(sorted(STUDENTS, key=lambda x: -lines[x]), 1):
    print(f"{rank}. {n}: substantive_lines={lines[n]} substantive_commits={subc[n]} raw_commits={raw[n]}")
top_raw = max(STUDENTS, key=lambda x: raw[x])
print(f"Most raw commits: {top_raw} ({raw[top_raw]}); substantive rank of that student: {sorted(STUDENTS, key=lambda x: -lines[x]).index(top_raw)+1} of 4")
print("Notes:")
for n in sorted(notes): print("  ", n)
