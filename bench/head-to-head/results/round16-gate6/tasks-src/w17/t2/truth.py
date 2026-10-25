#!/usr/bin/env python3
import subprocess, sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
D = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", D, *a], capture_output=True, text=True, check=True).stdout
NY = ZoneInfo("America/New_York")  # real DST rules: 2026-03-08 switch EST->EDT
START = datetime(2026, 1, 1, tzinfo=NY); END = datetime(2026, 7, 1, tzinfo=NY)   # 1 Jan..30 Jun inclusive, NY dates
NOW = datetime(2026, 10, 24, tzinfo=timezone.utc)
# Convention A (purpose: "when it landed on main"): a landing event is a first-parent commit of main.
#   Direct commits land at their COMMITTER date (author date survives rebases and shows only when it was first written).
#   A merge lands everything on its second parent at the merge's committer date, so branch commits are not separate events.
# Convention B: in-hours = Mon-Fri and 08:00:00 <= t < 20:00:00 local; 20:00:00 exactly is outside, 08:00:00 inside (boundary stated).
# Convention C: conversion uses the real America/New_York rules (DST), not a fixed -05:00.
# Convention D: a timestamp is unreliable if the committer date is earlier than its parent's, or later than today (2026-10-24).
# Convention E: people are grouped by display name (same name used with two addresses; repo has no .mailmap) and the
#   landing person is the author of the first-parent commit (the merger for a merge).
rows = []
for l in git("log", "--first-parent", "--format=%H%x1f%P%x1f%an%x1f%ae%x1f%cn%x1f%cI%x1f%aI%x1f%s", "HEAD").strip().split("\n"):
    h, par, an, ae, cn, cI, aI, s = l.split("\x1f")
    rows.append((h, par.split(), an, ae, cn, datetime.fromisoformat(cI), datetime.fromisoformat(aI), s))
by = {r[0]: r for r in rows}
out_rows = []; unreliable = []; inrange = 0
for h, par, an, ae, cn, cd, ad, s in rows:
    if not (datetime(2025,12,30,tzinfo=timezone.utc) < cd): continue
    why = []
    p = by.get(par[0]) if par else None
    if p and cd < p[5]: why.append("committer date earlier than its parent's (%s)" % p[5].isoformat())
    if cd > NOW: why.append("committer date after today (2026-10-24)")
    loc = cd.astimezone(NY)
    if why:
        unreliable.append((h[:10], an, s, cd.isoformat(), "; ".join(why)))
        # an unreliable clock cannot be placed in the window with confidence; reported separately, not counted
        continue
    if not (START <= loc < END): continue
    inrange += 1
    hours = loc.weekday() < 5 and 8 <= loc.hour < 20
    if not hours:
        out_rows.append((h[:10], loc.strftime("%a %Y-%m-%d %H:%M:%S %Z"), an, s, "author date " + ad.isoformat() if ad != cd else ""))
print("Landing events (first-parent commits) in 2026-01-01..2026-06-30 NY with reliable clock:", inrange)
print("Outside the window:", len(out_rows))
for r in out_rows: print(" | ".join(x for x in r if x))
from collections import Counter
print("Per person:", dict(sorted(Counter(r[2] for r in out_rows).items())))
print("Unreliable timestamps (not placed in the count):")
for u in unreliable: print("  " + " | ".join(u))
print("Note: 03be3fca8a would read Wed 2026-05-20 03:00 EDT (outside) if its clock were believed; it is reported, not counted. 1757c4ba32 cannot be placed in the window at all.")
print("Not in range: f4cf610 (committer date Dec 31 19:30 EST = Jan 1 00:30 UTC) and 974c8db (Jul 1 00:10 EDT = Jun 30 in UTC)")
