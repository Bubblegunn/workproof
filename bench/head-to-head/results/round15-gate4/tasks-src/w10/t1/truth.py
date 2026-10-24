#!/usr/bin/env python3
"""Ground truth for t1: contributors to the repo in the half year 2026-01-01..2026-06-30, UTC.

Conventions (and why):
* Window is [2026-01-01T00:00:00Z, 2026-07-01T00:00:00Z). The requester reports in UTC, so each
  commit's instant (%at, epoch) is compared, never the local-time string: a commit written
  2025-12-31 23:30 -0500 is 2026-01-01 04:30Z (in), 2026-07-01 00:30 +0200 is 2026-06-30 22:30Z (in),
  2026-01-01 00:20 +0200 is 2025-12-31 22:20Z (out).
* Date used is the author date (== committer date on every non-merge commit here).
* Merge commits are not contributions of their author (a merge of PR work by the maintainer would
  credit the maintainer twice); they are excluded with --no-merges and reported separately.
* Bots (name ends in [bot]) are not people and are listed apart.
* Identities: the repo's .mailmap folds Mira's second address. Ana's noreply identity "asouza" is
  folded because every such commit carries "Signed-off-by: Ana Souza <ana@example.com>".
* A "commit" count is authored non-merge commits. All other identities are distinct people.
"""
import subprocess, sys, calendar, collections, re
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True,
                          env={"GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null",
                               "TZ": "UTC", "LC_ALL": "C", "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"}).stdout
lo = calendar.timegm((2026, 1, 1, 0, 0, 0)); hi = calendar.timegm((2026, 7, 1, 0, 0, 0))
ident = {"mira.kovacs@example.org": "Mira Kovacs", "mira@example.com": "Mira Kovacs",
         "asouza@users.noreply.example.org": "Ana Souza"}
def who(name, email):
    return ident.get(email.lower(), name)
fmt = "%H%x1f%an%x1f%ae%x1f%at%x1f%s%x1f%P%x1e"
people = collections.defaultdict(list); bots = collections.defaultdict(int); merges = collections.defaultdict(int)
outside = []
for rec in git("log", "--format=" + fmt).split("\x1e"):
    rec = rec.strip("\n")
    if not rec: continue
    h, an, ae, at, s, par = rec.split("\x1f")
    at = int(at); inw = lo <= at < hi
    ismerge = len(par.split()) > 1
    if not inw:
        outside.append((an, s)); continue
    if ismerge: merges[who(an, ae)] += 1; continue
    if an.endswith("[bot]"): bots[an] += 1; continue
    people[who(an, ae)].append(s)
print("TASK t1 TRUTH (window 2026-01-01T00:00Z to 2026-07-01T00:00Z, authored non-merge commits)")
tot = 0
for p in sorted(people, key=lambda k: (-len(people[k]), k)):
    print(f"{p}: {len(people[p])} commits")
    for s in people[p]: print(f"    - {s}")
    tot += len(people[p])
print(f"TOTAL human commits: {tot}; distinct people: {len(people)}")
print("Bots (not people): " + ", ".join(f"{k} {v}" for k, v in sorted(bots.items())))
print("Merge commits in window (not contributions): " + ", ".join(f"{k} {v}" for k, v in merges.items()))
names_in = set(people)
print("People with commits ONLY outside window (must not be thanked as window contributors): " +
      ", ".join(sorted({a for a, _ in outside if a not in names_in and not a.endswith('[bot]') and who(a, '') not in names_in and a != 'asouza'})))
