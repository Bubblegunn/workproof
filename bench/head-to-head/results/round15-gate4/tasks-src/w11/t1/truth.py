#!/usr/bin/env python3
"""t1 truth. usage: truth.py <fixture>
Conventions (why each is right for "commits I authored in Q2 2025, UTC"):
- Identity: Maren's three addresses (work brightloom, GitHub no-reply 4821907+mokafor, personal okafor.example.com).
  Matching by surname or by "Maren" would wrongly pull in Marcus Okafor and Maren Okafor-Lindqvist (different people,
  different addresses, no link to handle mokafor).
- "Authored" means the AUTHOR date, not the committer date: a rebase/cherry-pick changes committer date only.
  `git log --since/--until` filters on committer date, so it is the wrong filter here.
- Window is 2025-04-01T00:00:00Z .. 2025-06-30T23:59:59Z inclusive, evaluated in UTC (the prompt says UTC),
  not by the local calendar date written in the author's own offset.
- Merge commits carry no authored change; they are counted separately (a method may include them if it says so).
- Commits where Maren is only a Co-authored-by trailer are not "authored" by her; reported separately.
"""
import subprocess, sys, datetime as dt
repo = sys.argv[1]
def git(*a): return subprocess.check_output(['git','-C',repo,*a], text=True)
MINE = {'maren.okafor@brightloom.example','4821907+mokafor@users.noreply.example.org','maren@okafor.example.com'}
lo = dt.datetime(2025,4,1,tzinfo=dt.timezone.utc); hi = dt.datetime(2025,7,1,tzinfo=dt.timezone.utc)
rows = git('log','--format=%H%x1f%ae%x1f%aI%x1f%P%x1f%s%x1f%B%x1e').split('\x1e')
inq, merges, out, co = [], [], [], []
for r in rows:
    r = r.strip('\n')
    if not r: continue
    h, ae, ad, parents, s, body = r.split('\x1f')
    t = dt.datetime.fromisoformat(ad.replace('Z','+00:00')).astimezone(dt.timezone.utc)
    if ae in MINE:
        item = (t, h[:7], s, ad)
        if lo <= t < hi:
            (merges if len(parents.split())>1 else inq).append(item)
        else: out.append(item)
    elif any(('Co-authored-by' in l and e in l) for l in body.splitlines() for e in MINE) and lo <= t < hi:
        co.append((t,h[:7],s,ad))
print("AUTHORED non-merge commits in window (UTC):", len(inq))
for t,h,s,ad in sorted(inq): print(f"  {h} {t:%Y-%m-%dT%H:%M:%SZ} (as recorded {ad}) {s}")
print("MERGE commits authored in window:", len(merges))
for t,h,s,ad in sorted(merges): print(f"  {h} {t:%Y-%m-%dT%H:%M:%SZ} {s}")
print("TOTAL including merge:", len(inq)+len(merges))
print("CO-AUTHORED ONLY in window (not authored):", len(co))
for t,h,s,ad in sorted(co): print(f"  {h} {t:%Y-%m-%dT%H:%M:%SZ} {s}")
print("MINE but OUTSIDE window by author date (must not be counted):")
for t,h,s,ad in sorted(out):
    if t.year==2025: print(f"  {h} {t:%Y-%m-%dT%H:%M:%SZ} (as recorded {ad}) {s}")
print("NOT MINE, look-alikes: Marcus Okafor <marcus@okafor.example.com>, Maren Okafor-Lindqvist <maren.lindqvist@northpine.example>, dependabot[bot]")
print("Reverted: commit 'readme: mention wasm support' was reverted by 'Revert \"readme: mention wasm support\"' (both authored by Maren, both in window)")
