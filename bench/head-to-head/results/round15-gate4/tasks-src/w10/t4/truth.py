#!/usr/bin/env python3
"""Ground truth for t4: who is in release 1.5.0 compared with 1.4.0 (no tags exist).

Conventions (and why):
* The releases are the commits whose subject is exactly "Release 1.4.0" and "Release 1.5.0" (anchored; other
  commits only mention those strings: "Fix typo in Release 1.4.0 notes", "Start work after Release 1.5.0").
* The set of commits in the release is the ancestry range `R14..R15` (reachable from 1.5.0, not from 1.4.0),
  not a date filter: ancestry is what "in 1.5.0 and not in 1.4.0" means. It therefore includes the two
  feat-ansi commits authored in February (before 1.4.0 was cut, merged afterwards) and excludes the commit
  authored 12 May that landed on 27 May, after Release 1.5.0.
* Merge commits and bots are not contributions; Noor's two addresses are one person (same name).
* A commit that is explicitly reverted ("This reverts commit X") and its revert cancel; the re-land counts.
  Release-housekeeping commits ("Release 1.5.0") are the maintainer's own commits and are counted.
"""
import subprocess, sys, re, collections
repo = sys.argv[1]
ENV = {"GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null", "TZ": "UTC", "LC_ALL": "C",
       "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"}
def git(*a): return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, env=ENV, check=True).stdout
def one(subject):
    r = git("log", "--format=%H", "-E", f"--grep=^{subject}$").split()
    assert len(r) == 1, r
    return r[0]
r14, r15 = one("Release 1\\.4\\.0"), one("Release 1\\.5\\.0")
rng = git("log", "--format=%H%x1f%an%x1f%s%x1f%P%x1f%B%x1e", f"{r14}..{r15}").split("\x1e")
rows = []
for rec in rng:
    rec = rec.strip("\n")
    if not rec: continue
    h, an, s, par, body = rec.split("\x1f")
    rows.append((h, an, s, len(par.split()) > 1, body))
reverted = set(); revs = set()
for h, an, s, mg, body in rows:
    m = re.search(r"This reverts commit ([0-9a-f]{40})", body)
    if m: reverted.add(m.group(1)); revs.add(h)
people = collections.defaultdict(list); notes = []
for h, an, s, mg, body in rows:
    if mg: notes.append(f"merge commit (not counted): {an}: {s}"); continue
    if an.endswith("[bot]"): notes.append(f"bot (not a person): {an}: {s}"); continue
    if h in reverted or h in revs: notes.append(f"reverted pair (cancelled): {an}: {s}"); continue
    people[an].append(s)
print("TASK t4 TRUTH (commits in Release 1.4.0..Release 1.5.0 by ancestry)")
for p in sorted(people, key=lambda k: (-len(people[k]), k)):
    print(f"{p}: {len(people[p])}")
    for s in people[p]: print("    - " + s)
print(f"Distinct people: {len(people)}")
for n in notes: print("  " + n)
print("Not in release (must not be thanked for 1.5.0): Leila Farouk (landed after Release 1.5.0); Jonas 'Start work after Release 1.5.0'; Jonas 'Respect NO_COLOR' (before 1.4.0)")
