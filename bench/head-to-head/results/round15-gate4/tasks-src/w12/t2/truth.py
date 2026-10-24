#!/usr/bin/env python3
"""Ground truth for t2: Tomas Weber's appeal (term 14 Sep - 18 Dec 2026, Germany).

Conventions (and why):
- Window: author-date instant converted to Europe/Berlin, calendar days 2026-09-14 .. 2026-12-18 inclusive
  (the course is in Germany; "18 December" is a Berlin date, not the author's local clock).
- Identities: TEAM.md lists two addresses for Tomas (accent / no accent); merged by e-mail.
- Authored commits are counted by AUTHOR (not committer): two of his commits were rebased by Hannah and carry
  her as committer.  A commit he authored that was later reverted is still counted as authored work,
  but its lines do not survive.
- Share of the package: lines of ledger/*.go (excluding files marked "Code generated ... DO NOT EDIT") that survive at
  HEAD, found with `git blame -w` (whitespace ignored; blame follows the audit.go -> auditlog.go rename), where the
  origin commit's author instant is inside the window.  Lines from out-of-window commits are neither numerator nor
  denominator (not part of the graded term); the pre-term instructor stub is outside as well.
- Credit rule for an origin commit: squash merge ("Squash of <branch>" in the message) -> the Co-authored-by person
  gets 100% (the squasher only merged; TEAM.md says squash messages carry the real author); other commit with
  Co-authored-by (pair programming) -> author and co-authors split equally; otherwise the author.
"""
import re, subprocess, sys
from collections import defaultdict
from datetime import datetime, date
from zoneinfo import ZoneInfo

repo = sys.argv[1]
TZ = ZoneInfo("Europe/Berlin")
START, END = date(2026, 9, 14), date(2026, 12, 18)
CANON = {
    "hannah.lee@students.example.org": "Hannah Lee",
    "tomas.weber@students.example.org": "Tomas Weber",
    "tweber@dorm.example.invalid": "Tomas Weber",
    "mei.tanaka@students.example.org": "Mei Tanaka",
    "oleg.petrov@students.example.org": "Oleg Petrov",
}
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout
def inwin(iso):
    d = datetime.fromisoformat(iso).astimezone(TZ).date()
    return START <= d <= END

info = {}
for rec in git("log", "--format=%H%x1f%ae%x1f%ce%x1f%aI%x1f%P%x1f%s%x1f%B%x1e").split("\x1e"):
    rec = rec.strip("\n")
    if not rec: continue
    sha, ae, ce, aiso, parents, subj, body = rec.split("\x1f", 6)
    info[sha] = dict(ae=ae, ce=ce, iso=aiso, merge=len(parents.split()) > 1, subj=subj, body=body)

authored, coauthored, outside = defaultdict(list), defaultdict(list), []
for sha, c in info.items():
    if c["ae"] not in CANON or c["merge"]: continue
    name = CANON[c["ae"]]
    if not inwin(c["iso"]):
        if c["iso"] >= "2026-09-01":
            outside.append((name, sha[:8], datetime.fromisoformat(c["iso"]).astimezone(TZ).isoformat(), c["subj"]))
        continue
    authored[name].append((sha[:8], c["subj"], c["ce"] != c["ae"]))
    for m in re.finditer(r"^Co-authored-by: .*<(.+?)>", c["body"], re.M):
        coauthored[CANON[m.group(1)]].append((sha[:8], c["subj"]))

files = [f for f in git("ls-files", "ledger").split() if f.endswith(".go")]
credit = defaultdict(float); naive = defaultdict(int); total = 0.0
generated = []
for f in files:
    if "DO NOT EDIT" in open(f"{repo}/{f}").read(500):
        generated.append(f); continue
    for line in git("blame", "--line-porcelain", "-w", "HEAD", "--", f).splitlines():
        m = re.match(r"^([0-9a-f]{40}) \d+ \d+", line)
        if not m: continue
        c = info[m.group(1)]
        if not inwin(c["iso"]): continue
        total += 1
        naive[CANON[c["ae"]]] += 1
        co = [CANON[x] for x in re.findall(r"^Co-authored-by: .*<(.+?)>", c["body"], re.M)]
        if co and "Squash of" in c["body"]:
            for p in co: credit[p] += 1 / len(co)
        elif co:
            who = [CANON[c["ae"]]] + co
            for p in who: credit[p] += 1 / len(who)
        else:
            credit[CANON[c["ae"]]] += 1

share = 100 * credit["Tomas Weber"] / total
print("Window (Europe/Berlin): 2026-09-14 .. 2026-12-18 inclusive")
print("Authored commits in window (by author, aliases merged, counted even when someone else committed them):")
for n in sorted(authored):
    print(f"  {n}: {len(authored[n])} authored ({sum(1 for a in authored[n] if a[2])} committed by someone else)")
print("Tomas Weber authored commits:", "; ".join(f"{s} {m}" for s, m, _ in sorted(authored["Tomas Weber"])))
print("Commits by others carrying a Tomas Weber Co-authored-by trailer:", "; ".join(f"{s} {m}" for s, m in sorted(coauthored["Tomas Weber"])))
print("Team-member commits outside the window (ignored):")
for o in sorted(outside): print("  ", *o)
print(f"Generated files excluded: {', '.join(generated)}")
print(f"Surviving in-window lines at HEAD in ledger/ (denominator): {int(total)}")
for n in sorted(credit):
    print(f"  {n}: credited={credit[n]:.1f} share={100*credit[n]/total:.1f}%   (blame-author-only: {naive[n]} = {100*naive[n]/total:.1f}%)")
print(f"Tomas Weber share of the package: {share:.1f}% -> his claim of 'about a third' is {'supported' if 28 <= share <= 38 else 'NOT supported'} (supported band 28-38%)")
