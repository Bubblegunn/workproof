#!/usr/bin/env python3
"""Ground truth for t3: everyone who helped in Q3 2026 (2026-07-01..2026-09-30 UTC), by role.

Conventions (and why):
* Window is the UTC instant of the commit's committer date [2026-07-01T00:00Z, 2026-10-01T00:00Z). Author and
  committer dates are equal on every commit except the 2026-07-29 patch (author 07-29, committed 07-30); both
  fall inside, so either choice agrees. `Clarify MSRV docs` (2026-07-01 00:10 +0300 = 06-30 21:10Z) and
  `Prepare 1.0.19 notes` (2026-09-30 23:30 -0200 = 10-01 01:30Z) are OUTSIDE.
* Roles stay separate and are never summed into one commit tally (that would inflate): authored commits (the
  git author, not the committer: the maintainer committed other people's patches, and 'GitHub' committed the
  squash merge), co-authored commits (Co-authored-by trailers, key case-insensitive), reported (Reported-by),
  suggested (Suggested-by), reviewed (Reviewed-by), tested (Tested-by).
* Only the final trailer block counts (git interpret-trailers --parse): a line like '> Co-authored-by: ...'
  quoted inside the body is not a trailer, so Quentin Moreau gets no credit from it.
* One person per display name: Hye-jin Seo appears with two addresses in trailers and one as author; Tomas Ek
  with two addresses. Non-persons: names ending in [bot], 'Copilot' (tool), 'GitHub' (platform committer).
"""
import subprocess, sys, calendar, collections
repo = sys.argv[1]
ENV = {"GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null", "TZ": "UTC", "LC_ALL": "C",
       "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"}
def git(*a, inp=None):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, env=ENV, input=inp, check=True).stdout
lo = calendar.timegm((2026, 7, 1, 0, 0, 0)); hi = calendar.timegm((2026, 10, 1, 0, 0, 0))
NONPERSON = {"Copilot", "GitHub"}
def person(n): return not (n.endswith("[bot]") or n in NONPERSON)
ROLE = {"co-authored-by": "co-authored", "reported-by": "reported", "suggested-by": "suggested",
        "reviewed-by": "reviewed", "tested-by": "tested"}
roles = collections.defaultdict(lambda: collections.Counter()); detail = collections.defaultdict(list)
skipped = []
for h in git("log", "--no-merges", "--format=%H").split():
    an, ct, s = git("log", "-1", "--format=%an%x1f%ct%x1f%s", h).strip().split("\x1f")
    if not (lo <= int(ct) < hi): skipped.append(s); continue
    if person(an): roles[an]["authored"] += 1; detail[an].append(("authored", s))
    body = git("log", "-1", "--format=%B", h)
    for line in git("interpret-trailers", "--parse", inp=body).splitlines():
        k, _, v = line.partition(":")
        k = k.strip().lower()
        if k in ROLE:
            nm = v.strip().split("<")[0].strip()
            if person(nm): roles[nm][ROLE[k]] += 1; detail[nm].append((ROLE[k], s))
print("TASK t3 TRUTH (UTC window 2026-07-01..2026-09-30; counts per role, never summed)")
for p in sorted(roles, key=lambda k: (-sum(roles[k].values()), k)):
    print(p + ": " + ", ".join(f"{r} {n}" for r, n in sorted(roles[p].items())))
    for r, s in detail[p]: print(f"    - {r}: {s}")
print("Not credited: bots (dependabot[bot]), tools (Copilot), platform committer (GitHub), Quentin Moreau (quoted line, not a trailer)")
print("Outside window (not counted): " + "; ".join(skipped))
