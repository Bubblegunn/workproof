#!/usr/bin/env python3
"""t2 ground truth: Priya Raman's work on the store migration, 2026-01-01..2026-03-31, US Pacific. usage: truth.py <fixture-dir>"""
import subprocess, sys, collections
from datetime import datetime
from zoneinfo import ZoneInfo
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout

# Convention 1 (identity): Priya = two addresses (job change on 2026-02-20). Bots are not people.
PERSON = {"priya.raman@example.com": "Priya", "praman@corp.example.invalid": "Priya",
          "tom@example.net": "Tom", "lena@example.org": "Lena"}
def who(mail): return PERSON.get(mail, "bot" if "[bot]" in mail else mail)
# Convention 2 (what is "the migration"): non-merge commits that touch internal/store/. Merge commits are not
# authorship: the PR merge by Lena only records that Lena pressed merge; Priya's branch commits are counted as hers.
# Convention 3 (window and zone): the person asked for calendar dates in US Pacific, so author dates are converted
# to America/Los_Angeles. Author date is when the work was written; the stated window is 2026-01-01..2026-03-31.
Z = ZoneInfo("America/Los_Angeles"); LO = datetime(2026, 1, 1, tzinfo=Z); HI = datetime(2026, 4, 1, tzinfo=Z)
rows = []
for l in git("log", "--no-merges", "--format=%H|%ae|%aI|%P|%s", "--", "internal/store").splitlines():
    h, mail, ad, par, s = l.split("|", 4)
    d = datetime.fromisoformat(ad)
    pd = [datetime.fromisoformat(git("log", "-1", "--format=%aI", p).strip()) for p in par.split()]
    # Convention 4 (wrong clock): an author date earlier than a parent's date by more than a day is a clock error
    # (here 1970-01-01). Such a commit is placed by its position in history (after its parent, before its child),
    # not by the impossible date, because the person must not lose work to a mis-set laptop clock.
    bad = any(d < p.replace() and (p - d).days > 1 for p in pd)
    rows.append(dict(h=h, who=who(mail), d=d, bad=bad, s=s, par=par.split()))
# position date for bad-clock commits = date of its parent
byh = {r["h"]: r for r in rows}
def eff(r):
    if not r["bad"]: return r["d"]
    p = byh.get(r["par"][0]); return eff(p) if p else r["d"]
for r in rows: r["eff"] = eff(r).astimezone(Z)
inwin = [r for r in rows if LO <= r["eff"] < HI]
print("commits touching internal/store (non-merge): %d total" % len(rows))
print("in window (Pacific, bad clocks placed by position): by person ->", dict(collections.Counter(r["who"] for r in inwin)))
pr = sorted([r for r in inwin if r["who"] == "Priya"], key=lambda r: r["eff"])
print("Priya in window: %d of %d (%.0f%%)" % (len(pr), len(inwin), 100 * len(pr) / len(inwin)))
for r in pr: print("   ", r["eff"].strftime("%Y-%m-%d %H:%M %Z"), "BAD-CLOCK(author date %s)" % r["d"].isoformat() if r["bad"] else "", r["s"])
out = [r for r in rows if r["who"] == "Priya" and r not in inwin]
print("Priya outside window:", [(r["eff"].strftime("%Y-%m-%d %H:%M %Z"), r["s"]) for r in out])
U = [r for r in rows if r["who"] == "Priya" and datetime(2026,1,1,tzinfo=ZoneInfo("UTC")) <= r["d"] < datetime(2026,4,1,tzinfo=ZoneInfo("UTC"))]
print("(for comparison) same count if cut at UTC with raw author dates: %d (it drops the 1970 commit and moves the Dec-31 and Mar-31 evening commits)" % len(U))
print("bad-clock commits:", [(r["h"][:7], r["s"], r["d"].isoformat()) for r in rows if r["bad"]])
print("Priya addresses seen:", sorted(set(l.split("|")[0] for l in git("log", "--format=%ae|%an").splitlines() if who(l.split("|")[0]) == "Priya")))
print("dependabot commits touch only go.mod:", git("log", "--author=dependabot", "--name-only", "--format=").split())
rev = git("log", "-1", "--format=%H|%an|%aI|%s", "--grep=^Revert").strip().split("|")
print("revert of the cutover:", rev[1], rev[2], rev[3])
rl = [r for r in rows if r["s"].startswith("cutover:")]
print("cutover commits:", [(r["who"], r["eff"].strftime("%m-%d"), r["s"]) for r in sorted(rl, key=lambda r: r["eff"])])
m = git("log", "-1", "--format=%H", "--grep=Merge pull request #52").strip()
print("PR #52 merge commit by:", git("log", "-1", "--format=%an", m).strip(), "| authors of the commits it brought in:",
      sorted(set(git("log", "--format=%an", m + "^1.." + m + "^2").splitlines())))
print("migration plan: created by", git("log", "--reverse", "--format=%an", "--", "docs/migration-plan.md").splitlines()[0],
      "; extended by", sorted(set(git("log", "--format=%an", "--", "docs/migration-plan.md").splitlines())))
print("at HEAD the new store is the default (re-landed after the revert):", "DEFAULTFIX_001" in git("show", "HEAD:internal/store/cutover.go"))
print("verdict basis: Priya wrote 10 of the 13 in-window commits touching internal/store (Tom 2 incl. the revert, Lena 1), the cutover and its re-land after Tom's revert; the plan was Tom's first and Priya extended it; history cannot show managing people.")
