#!/usr/bin/env python3
"""t5 truth. usage: truth.py <fixture>
Request: Nadia Petrova's first/last contribution dates, months active in 2025 (UTC), longest inactive stretch in 2025,
and a flag on implausible dates.
Conventions:
- Identity by ADDRESS, not name: nadia.petrova@sparrowdata.example (display name changed to "Nadia Sol" in Sept 2025,
  same address) and the GitHub no-reply 5521870+npetrova. Another "Nadia Petrova" at othercorp.example is a different
  person (the prompt gives the handle and the work domain).
- A contribution = non-merge commit AUTHORED by her; date = AUTHOR date converted to UTC. Committer date is when a commit
  was rebased/landed, not when she did the work (b43303c authored 20 Aug, rebased 5 Nov; the squash commit was authored
  10 Dec and landed 6 Jan 2026 by the web service). The 2 Oct commit has her only as committer (patch from Omar Haddad),
  so it is not her contribution and October is NOT an active month.
- Implausible author dates are excluded from the timeline and reported: before the repository's first commit (1970 epoch)
  or later than the commit's own committer date (2031). They are clock/typo errors, not contributions.
- Active month = at least one genuine authored commit in that UTC calendar month. 30 Apr 23:50 -07:00 is 1 May 06:50 UTC, so May.
- Longest gap = largest difference between consecutive genuine contribution timestamps within 2025, in whole elapsed days;
  also shown as the difference between calendar dates.
"""
import subprocess, sys, datetime as dt
repo = sys.argv[1]
def git(*a): return subprocess.check_output(['git','-C',repo,*a], text=True)
MINE = {'nadia.petrova@sparrowdata.example','5521870+npetrova@users.noreply.example.org'}
U = dt.timezone.utc
def p(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(U)
rows = [r.split('\x1f') for r in git('log','--format=%h%x1f%ae%x1f%an%x1f%aI%x1f%cI%x1f%ce%x1f%P%x1f%s').splitlines()]
root = min(p(r[4]) for r in rows)
genuine=[]; anomalies=[]; committer_only=[]; decoy=[]
for h,ae,an,ad,cd,ce,par,s in rows:
    if len(par.split())>1: continue
    a=p(ad); c=p(cd)
    if ae in MINE:
        if a < root or a > c: anomalies.append((h,ad,cd,s)); continue
        genuine.append((a,h,an,ad,cd,s))
    elif ce in MINE and ae not in MINE: committer_only.append((h,an,ad,cd,s))
    elif an=='Nadia Petrova': decoy.append((h,ae,ad,s))
genuine.sort()
print("Genuine authored contributions (UTC):", len(genuine))
for a,h,an,ad,cd,s in genuine:
    print(f"  {h} {a:%Y-%m-%dT%H:%M}Z  (author {ad}, committer {cd}, name '{an}') {s}")
print("FIRST contribution:", f"{genuine[0][0]:%Y-%m-%d}", "| LAST authored contribution:", f"{genuine[-1][0]:%Y-%m-%d}",
      "(the last one landed in the repository on 2026-01-06 via squash merge #72; either is fine if labelled)")
y=[g for g in genuine if g[0].year==2025]
months=sorted({g[0].month for g in y})
print("Months of 2025 active (UTC):", months, "=", len(months), "months")
print("  inactive months:", [m for m in range(1,13) if m not in months])
gaps=[(y[i+1][0]-y[i][0], y[i][0], y[i+1][0]) for i in range(len(y)-1)]
for g,a,b in gaps: print(f"  gap {a:%Y-%m-%d} -> {b:%Y-%m-%d}: {g.days} elapsed days ({g.total_seconds()/86400:.2f}), calendar diff {(b.date()-a.date()).days}")
g,a,b = max(gaps)
print("LONGEST gap in 2025:", f"{a:%Y-%m-%d} to {b:%Y-%m-%d}", f"= {g.days} elapsed days ({(b.date()-a.date()).days} by calendar date)")
print("ANOMALOUS author dates (exclude and flag):")
for h,ad,cd,s in anomalies: print(f"  {h} author {ad} committer {cd} {s}")
print("Commits where she is committer only (not hers):", committer_only)
print("Same display name, different person:", decoy)
print("Wrong-method effects: counting committer-only commit 15dae39 makes October active; using committer dates moves the Aug commit to Nov and the squash commit to 2026; using local offsets moves 584c163 into April.")
