#!/usr/bin/env python3
"""t2 ground truth: effort per person per semester, reported in Europe/Berlin.

Conventions and why:
 * Date of work = AUTHOR date (when the work was done), not committer date: Carol's two
   December commits were rebased onto main in April and carry April committer dates.
 * Converted to Europe/Berlin (the reporting zone the person stated), not UTC and not the
   offset recorded in the commit: this moves the 23:30Z / 22:30Z / 23:00Z commits across the
   semester boundaries, and Bob's 23:50-05:00 commit onto 13 Nov, the same Berlin day as his next commit.
 * "Days worked" = distinct Berlin calendar days with at least one commit by that person;
   commits counted separately.
 * Merge commits (more than one parent) are bookkeeping, not work; bots are not people.
 * Identity = author name (Dan Petrov used two e-mail addresses).
 * Commits whose author date is impossible (before 2000 or after today, 2026-10-24: 1970 and 2031 here;
   the upstream library history of 2014-2023 is plausible but predates both semesters and the lab) cannot be placed in a semester; they are
   reported as unplaceable, not guessed and not dropped silently.
 * Semesters: WS 2025/26 = 2025-10-01..2026-03-31, SS 2026 = 2026-04-01..2026-09-30 (Berlin dates).
"""
import subprocess, sys, collections, datetime as dt
from zoneinfo import ZoneInfo
d = sys.argv[1]
BER = ZoneInfo("Europe/Berlin")
out = subprocess.run(["git", "-C", d, "log", "--format=%H%x09%an%x09%ae%x09%at%x09%P%x09%s"], capture_output=True, text=True, check=True).stdout
sem = {"WS2025/26": (dt.date(2025, 10, 1), dt.date(2026, 3, 31)), "SS2026": (dt.date(2026, 4, 1), dt.date(2026, 9, 30))}
days = collections.defaultdict(set); commits = collections.Counter()
unplaceable = []; outside = []; skipped = []
LOW, HIGH = dt.datetime(2000, 1, 1, tzinfo=dt.timezone.utc), dt.datetime(2026, 10, 24, 23, 59, tzinfo=dt.timezone.utc)
old_upstream = 0
for l in out.splitlines():
    h, an, ae, at, parents, subj = l.split("\t")
    if len(parents.split()) > 1: skipped.append(("merge", an, subj)) if str(subj).startswith("Merge branch 'feat'") else None; continue
    if "[bot]" in an or "[bot]" in ae or an.lower() == "dependabot": skipped.append(("bot", an, subj)) if int(at) > 1.7e9 else None; continue
    t = dt.datetime.fromtimestamp(int(at), dt.timezone.utc)
    if not (LOW <= t <= HIGH): unplaceable.append((an, t.isoformat(), subj)); continue
    day = t.astimezone(BER).date()
    for s, (a, b) in sem.items():
        if a <= day <= b:
            days[(an, s)].add(day); commits[(an, s)] += 1; break
    else:
        if day < dt.date(2025, 1, 1): old_upstream += 1
        else: outside.append((an, str(day), subj))
print("person,semester,days_worked,commits")
for k in sorted(commits, key=lambda k: (k[1], k[0])):
    print("%s,%s,%d,%d" % (k[0], k[1], len(days[k]), commits[k]))
print("unplaceable (impossible author date):", unplaceable)
print("outside both semesters (Berlin date):", sorted(outside))
print("skipped:", skipped)
print("older upstream commits before 2025 (outside both semesters, not lab work):", old_upstream)
