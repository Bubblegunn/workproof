#!/usr/bin/env python3
"""Ground truth for t1: per-student contribution table for the 7 Sep - 11 Dec 2026 term (Toronto).

Conventions (and why):
- Window: the instant of the author date, converted to America/Toronto, must fall on a calendar day
  2026-09-07 .. 2026-12-11 inclusive.  The course is in Toronto, so a deadline of "11 December" means
  Toronto midnight, not the author's own clock (a +09:00 exchange student's "12 Dec" can still be on time).
- Identities: merged using the roster docs/team.md (name, GitHub handle, lab login) -> the noreply
  address contains the handle, the lab-pc/laptop addresses carry the lab login.
- Bots (name/email contain "[bot]") and the instructor are not students.
- Merge commits are not authored work: excluded from counts (they would credit the integrator).
- Lines: "added"/"deleted" from `git log --numstat -w` (whitespace changes ignored, so the pure re-indent
  commit counts for 0 lines), restricted to the team's own files: third_party/ (vendored),
  poetry.lock (generated, @generated header) and docs/api/ (generated) are excluded.
- Two commit counts are printed: all in-window non-merge human commits, and the subset that changes at
  least one credited line (the re-indent, vendored-only and lockfile-only commits drop out of the latter).
"""
import subprocess, sys
from datetime import datetime, date
from zoneinfo import ZoneInfo

repo = sys.argv[1]
TZ = ZoneInfo("America/Toronto")
START, END = date(2026, 9, 7), date(2026, 12, 11)
CANON = {
    "aisha.rahman@students.example.edu": "Aisha Rahman",
    "aisha@laptop.example.invalid": "Aisha Rahman",
    "12345+aishar@users.noreply.example.org": "Aisha Rahman",
    "ben.okafor@students.example.edu": "Ben Okafor",
    "bokafor@lab-pc.example.invalid": "Ben Okafor",
    "chen.wei@students.example.edu": "Chen Wei",
    "dana.kowalski@students.example.edu": "Dana Kowalski",
}
EXCLUDED_PREFIX = ("third_party/", "docs/api/")
EXCLUDED_FILES = {"poetry.lock"}

def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout

out = git("log", "--no-merges", "--numstat", "-w", "--format=@@%H|%ae|%aI|%s")
commits = []
for block in out.split("@@")[1:]:
    head, *rest = block.strip("\n").split("\n")
    sha, email, iso, subj = head.split("|", 3)
    add = dele = 0
    for l in rest:
        if not l.strip():
            continue
        a, d, p = l.split("\t", 2)
        if p in EXCLUDED_FILES or p.startswith(EXCLUDED_PREFIX) or a == "-":
            continue
        add += int(a); dele += int(d)
    commits.append((sha, email, datetime.fromisoformat(iso), subj, add, dele))

stats, excluded = {}, []
bots = merges = upstream = 0
for sha, email, dtm, subj, add, dele in commits:
    if dtm < datetime(2026, 8, 1, tzinfo=ZoneInfo("UTC")):
        upstream += 1; continue   # the upstream project's own history, long before the course
    if "[bot]" in email:
        bots += 1; continue
    if email not in CANON:
        excluded.append(("instructor/unknown", sha[:8], dtm.astimezone(TZ).isoformat(), subj)); continue
    local = dtm.astimezone(TZ).date()
    if not (START <= local <= END):
        excluded.append((CANON[email], sha[:8], dtm.astimezone(TZ).isoformat(), subj)); continue
    s = stats.setdefault(CANON[email], dict(commits=0, with_lines=0, added=0, deleted=0))
    s["commits"] += 1; s["with_lines"] += (add + dele > 0); s["added"] += add; s["deleted"] += dele
merges = len(git("log", "--merges", "--format=%H", "--since=2026-09-01").split())

print("Window (America/Toronto): 2026-09-07 .. 2026-12-11 inclusive")
for n in sorted(stats):
    s = stats[n]
    print(f"{n}: commits={s['commits']} commits_with_credited_lines={s['with_lines']} added={s['added']} deleted={s['deleted']}")
print(f"Bot commits (not students): {bots}")
print(f"Merge commits in term (not counted): {merges} (authored by Aisha Rahman via her noreply identity)")
print(f"Upstream starter-project commits before the course (ignored): {upstream}")
print("Excluded by date / not a student:")
for e in excluded:
    print("  ", *e)
