#!/usr/bin/env python3
"""Ground truth for t4: weekly commit counts per student, term Mon 5 Oct 2026 - Sun 31 Jan 2027, Auckland.

Conventions (and why):
- Weeks start on Monday and are computed in Pacific/Auckland local time from the AUTHOR date instant (NZDT, +13:00,
  all term): the course is in Auckland, so a week boundary is Auckland midnight, not UTC and not the author's own
  clock (Mei-Ling was in Singapore).  Author date = when the work was done; committer date is when it was rebased
  or applied and would pile Tama's work into the last week.
- Counted: non-merge commits by the three students.  Merge commits (integrator) and the CI bot are not work.
- Identities: Tama Rangi = "Tama Rangi" <tama.rangi@...> and "trangi" <tama@home...> (TEAM.md).
- Commits outside the 17 weeks (Jack's 2 Oct sketch, Tama's 2 Feb 2027 cleanup) are not counted.
- Flag rule asked by the instructor: more than 50% of a student's in-term commits fall in the last two weeks
  (Mon 18 Jan - Sun 31 Jan 2027).
"""
import subprocess, sys
from collections import defaultdict
from datetime import datetime, date
from zoneinfo import ZoneInfo

repo = sys.argv[1]
TZ = ZoneInfo("Pacific/Auckland")
START = date(2026, 10, 5); NWEEKS = 17
CANON = {"jack.whitaker@students.example.ac.nz": "Jack Whitaker",
         "tama.rangi@students.example.ac.nz": "Tama Rangi", "tama@home.example.invalid": "Tama Rangi",
         "meiling.zhou@students.example.ac.nz": "Mei-Ling Zhou"}
NAMES = ["Jack Whitaker", "Tama Rangi", "Mei-Ling Zhou"]
out = subprocess.run(["git", "-C", repo, "log", "--no-merges", "--format=%ae|%aI|%s"], capture_output=True, text=True, check=True).stdout
grid = {n: [0] * NWEEKS for n in NAMES}
outside = []
for l in out.splitlines():
    ae, iso, subj = l.split("|", 2)
    if ae not in CANON: continue
    local = datetime.fromisoformat(iso).astimezone(TZ)
    w = (local.date() - START).days // 7
    if 0 <= w < NWEEKS and local.date() >= START:
        grid[CANON[ae]][w] += 1
    elif local.year >= 2026 and local >= datetime(2026, 9, 1, tzinfo=TZ):
        outside.append(f"{CANON[ae]} {local.isoformat()} {subj}")
print("Weeks start Monday, Pacific/Auckland, week 1 = 2026-10-05 ... week 17 = 2027-01-25 (ends Sun 2027-01-31)")
print("week_start," + ",".join(NAMES))
for w in range(NWEEKS):
    d = date.fromordinal(START.toordinal() + 7 * w)
    print(f"{d}," + ",".join(str(grid[n][w]) for n in NAMES))
print("totals," + ",".join(str(sum(grid[n])) for n in NAMES))
print("Last two weeks (2027-01-18 .. 2027-01-31):")
for n in NAMES:
    t, l2 = sum(grid[n]), sum(grid[n][-2:])
    print(f"  {n}: {l2} of {t} = {100*l2/t:.0f}% -> {'FLAG (>50%)' if 2*l2 > t else 'ok'}")
print("Commits outside the 17 weeks (not counted): " + "; ".join(sorted(outside)))
