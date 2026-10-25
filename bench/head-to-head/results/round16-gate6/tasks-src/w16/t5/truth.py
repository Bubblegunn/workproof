#!/usr/bin/env python3
"""t5 ground truth: what each team delivered in Q3 2026, from docs/teams.csv. Usage: truth.py <fixture-dir>"""
import subprocess, sys, csv, re, io
from datetime import datetime, date, timezone
repo = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
START = datetime(2026, 7, 1, tzinfo=timezone.utc); END = datetime(2026, 10, 1, tzinfo=timezone.utc)
# CONVENTION 1 (team membership): taken from the roster in the repo (docs/teams.csv, effective-dated), applied AT THE DATE OF THE
# COMMIT: Ravi Menon was in Cops until 2026-08-14 and in Tooling from 2026-08-15, so his work is credited to the team he was on
# when he did it, not to his current team (a team's delivery is what the team did, with the people it had then).
# CONVENTION 2 (identity): roster e-mails map to names; hberg@personal.example.net and "H. Berg" are Hanna Berg. Anyone not in the roster
# (Guest Dev) is reported as Unassigned, not dropped. Bots (dependabot[bot]) belong to no team and are listed apart.
# CONVENTION 3 (credit): the prompt says a change involving two teams shows up for both, and Co-authored-by names those who worked on a
# squashed PR. So a change counts ONCE for each distinct team among its author and co-authors (a Cops author with a Cops co-author
# alias is one Cops change, not two), and its full lines count for every team involved (lines are therefore not additive across teams).
# CONVENTION 4 (size): lines added+deleted with git's default rename detection (a pure move of a file is not a rewrite of it).
roster = list(csv.DictReader(io.StringIO(git("show", "HEAD:docs/teams.csv"))))
def team_of(email, d):
    rows = [r for r in roster if r["email"] == email]
    if not rows: return None
    name = rows[0]["name"]
    best = [r for r in roster if r["name"] == name and date.fromisoformat(r["effective_from"]) <= d]
    return max(best, key=lambda r: r["effective_from"])["team"] if best else None
SEP = "\x1e"
out = git("log", "--no-merges", f"--format={SEP}%H|%aN|%aE|%aI|%s%n%b%x1f", "--numstat", f"--since=2026-06-01")
res = {}; listing = {}; bots = []
for blk in out.split(SEP)[1:]:
    body, _, stats = blk.partition("\x1f")
    head, _, msg = body.partition("\n")
    h, n, e, ad, subj = head.split("|", 4)
    d = datetime.fromisoformat(ad)
    if not (START <= d < END): continue
    lines = sum(int(a) + int(b) for a, b, p in (x.split("\t", 2) for x in stats.strip().split("\n") if x.strip()) if a != "-")
    if n.endswith("[bot]"): bots.append((n, subj, lines)); continue
    emails = [e] + re.findall(r"^Co-authored-by:.*<(.+?)>", msg, re.M)
    teams = {team_of(x, d.date()) or "Unassigned" for x in emails}
    for t in teams:
        r = res.setdefault(t, dict(changes=0, lines=0)); r["changes"] += 1; r["lines"] += lines
        listing.setdefault(t, []).append(f"{subj} ({lines})")
for t in sorted(res):
    print(f"{t}: changes={res[t]['changes']} lines={res[t]['lines']}")
    for s in listing[t]: print("     -", s)
print("BOTS (no team):", bots)
print("Not in Q3 (must not appear): 'Add old cop' 2026-06-30, 'Add after-quarter cop' 2026-10-05")
