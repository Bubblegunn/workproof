#!/usr/bin/env python3
"""Ground truth for t5: who wrote the code that is in app/ at the 18 Dec 2026 deadline (Oslo).

Conventions (and why):
- Snapshot: the last commit whose AUTHOR date instant is on or before 2026-12-18 23:59:59 Europe/Oslo.  The branch
  tip has two later commits (one printed as 18 Dec but written at 15:30 -08:00 = 00:30 on 19 Dec in Oslo).
  The question is "the code at the deadline", not "at HEAD".
- Scope: tracked *.rs files under app/ except app/vendor/ (third-party port) and files with an "@generated" header.
  Cargo.toml and TEAM.md are not source code.
- Ownership: `git blame -w -M -C` at the snapshot.  -w ignores whitespace-only changes (the CI bot's cargo fmt
  re-indent commit would otherwise own almost every line; the repo also lists that commit in
  .git-blame-ignore-revs, giving the same answer), -M/-C follow code moved inside a file or between files changed in the
  same commit (Ingrid's refactor moved Kofi's helper code into util.rs).  A line belongs to the author of the commit
  that last really changed it.
- Identities: Kofi = "Kofi Mensah" + "kmensah"; Ravi = "Ravi Menon" + "ravi-m" (noreply), per TEAM.md.
- Percentages are of all in-scope lines at the snapshot; the instructor's starter file is its own row.  A second
  figure excludes the starter code (students only).
"""
import re, subprocess, sys
from collections import defaultdict
from datetime import datetime
from zoneinfo import ZoneInfo

repo = sys.argv[1]
TZ = ZoneInfo("Europe/Oslo")
DEADLINE = datetime(2026, 12, 18, 23, 59, 59, tzinfo=TZ)
CANON = {"ingrid.solberg@students.example.no": "Ingrid Solberg",
         "kofi.mensah@students.example.no": "Kofi Mensah", "kofi@lab.example.invalid": "Kofi Mensah",
         "lucia.fernandez@students.example.no": "Lucia Fernandez",
         "ravi.menon@students.example.no": "Ravi Menon", "77001+ravim@users.noreply.example.org": "Ravi Menon",
         "hale@ifi.example.no": "Instructor (starter code)"}
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout

info = {}
order = []
for rec in git("log", "--first-parent", "--reverse", "--format=%H%x1f%ae%x1f%aI%x1f%s").splitlines():
    sha, ae, iso, subj = rec.split("\x1f")
    info[sha] = (ae, datetime.fromisoformat(iso), subj); order.append(sha)
snap = None
for sha in order:                      # linear history: first commit past the deadline ends the snapshot
    if info[sha][1] > DEADLINE: break
    snap = sha
files = [f for f in git("ls-tree", "-r", "--name-only", snap, "app").split()
         if f.endswith(".rs") and not f.startswith("app/vendor/")]
count = defaultdict(int); naive = defaultdict(int); skipped = []
for f in files:
    head = git("show", f"{snap}:{f}")[:200]
    if "@generated" in head:
        skipped.append(f); continue
    for mode, sink in (("-w -M -C", count), ("", naive)):
        args = ["blame", "--line-porcelain", *mode.split(), snap, "--", f]
        for l in git(*args).splitlines():
            m = re.match(r"^([0-9a-f]{40}) \d+ \d+", l)
            if m:
                ae = info[m.group(1)][0] if m.group(1) in info else "upstream"
                sink[CANON.get(ae, ae)] += 1
total = sum(count.values())
students = total - count["Instructor (starter code)"]
print(f"Snapshot: {snap[:8]} \"{info[snap][2]}\" (author date {info[snap][1].astimezone(TZ).isoformat()})")
print("Commits after the deadline (excluded):", "; ".join(f"{s[:8]} {info[s][2]} ({info[s][1].astimezone(TZ).isoformat()})" for s in order[order.index(snap)+1:]))
print("Scope files:", ", ".join(f for f in files if f not in skipped))
print("Excluded as generated:", ", ".join(skipped), "| excluded as vendored: app/vendor/*")
print(f"In-scope lines at snapshot: {total} (students only: {students})")
for n in sorted(count, key=lambda x: -count[x]):
    s = f"  {n}: {count[n]} lines = {100*count[n]/total:.1f}% of all"
    if n != "Instructor (starter code)": s += f", {100*count[n]/students:.1f}% of student-written code"
    print(s)
print("Reference only (plain `git blame`, no -w/-M/-C, wrong answer):", ", ".join(f"{k}={100*v/total:.0f}%" for k, v in sorted(naive.items(), key=lambda x: -x[1])))
