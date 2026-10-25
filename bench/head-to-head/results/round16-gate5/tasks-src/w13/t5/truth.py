#!/usr/bin/env python3
"""t5 ground truth: Alex Kim's tenure and the timing of the rate limiter. usage: truth.py <fixture-dir>"""
import subprocess, sys
from datetime import datetime, timezone
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, errors="replace", check=True).stdout
U = timezone.utc
def utc(s): return datetime.fromisoformat(s).astimezone(U)
def f(d): return d.strftime("%Y-%m-%d %H:%M UTC")
# Convention 1 (identity): the candidate is the two addresses the requester listed. A third address with the same
# name (alex.kim@othercorp.example) is a different person: same name is not same person, and the requester did
# not list it. Its two commits are therefore NOT the candidate's.
ALEX = {"akim@oldjob.example.invalid", "alex.kim@example.com"}
OTHER = "alex.kim@othercorp.example"
# Convention 2 (two dates): author date = when the work was written (rebase keeps it); landing date = when the
# commit entered main (committer date for fast-forwarded commits, the merge commit's date for branch commits).
# For "contributor since" and "within the first month" both are reported, because they answer different
# questions: the first measures when the person began working, the second when the project could see it.
# Convention 3 (zone): UTC, as the requester asked.
rows = []
for l in git("log", "--no-merges", "--format=%H|%ae|%aI|%cI|%s").splitlines():
    h, ae, ad, cd, s = l.split("|", 4); rows.append((h, ae, utc(ad), utc(cd), s))
mine = [r for r in rows if r[1] in ALEX]
landed = {}
for l in git("log", "--first-parent", "--format=%H|%cI|%P").splitlines():
    h, cd, par = l.split("|"); par = par.split()
    landed[h] = utc(cd)
    if len(par) == 2:                       # merge: its second-parent commits landed when it was merged
        for x in git("rev-list", par[0] + ".." + par[1]).split(): landed[x] = utc(cd)
print("candidate's authored commits (non-merge, both addresses):", len(mine))
for h, ae, a, c, s in sorted(mine, key=lambda r: r[2]):
    print("   author %s | landed %s | %s | %s" % (f(a), f(landed[h]), ae, s))
print("co-authored via trailer (squash by the maintainer):",
      [(l.split("|")[0], l.split("|")[1]) for l in git("log", "--format=%h|%s|%(trailers:key=Co-authored-by,valueonly,separator=;)", "--grep=^Limiter: add burst").splitlines()])
fa = min(r[2] for r in mine); fl = min(landed[r[0]] for r in mine)
print("first AUTHORED date (UTC):", f(fa), "(in the author's own +09:00 offset that is 2025-01-01 08:30, i.e. January 1st)")
print("first LANDED date (UTC):", f(fl))
lim = [r for r in rows if "limiter" in r[4].lower()]
lim_first = min(landed[r[0]] for r in lim if r[1] in ALEX)
sq = git("log", "-1", "--format=%H", "--grep=^Limiter: add burst setting").strip()
print("limiter first landed on main (merge of #61):", f(lim_first), "=", (lim_first - fl).days, "days after the first landing")
print("limiter feature complete (burst setting, squash #64 with Co-authored-by Alex):", f(landed[sq]), "=", (landed[sq] - fl).days, "days after the first landing")
print("limiter drafted from the first authored date to completion:", (landed[sq] - fa).days, "days")
print("last authored commit:", f(max(r[2] for r in mine)))
oth = [r for r in rows if r[1] == OTHER]
print("NOT the candidate (same name, other address %s): %d commits, earliest %s:" % (OTHER, len(oth), f(min(r[2] for r in oth))), [r[4] for r in oth])
print("verdict basis: 'since January 2025' is true only for unlanded drafts (first authored 2025-01-01 local / 2024-12-31 UTC); the project saw him from 2025-03-06. The 2025-01-08 commit that makes January look supported is another person's. 'Limiter within the first month' holds counted from first landing (27 days, 18 for the working limiter), not from first draft (91 days).")
