#!/usr/bin/env python3
"""t4 truth. usage: truth.py <fixture>
Request: Kenji Arai's 2025 record: commit count, lines added/removed in hand-written files, anything undone.
Conventions:
- Year = calendar 2025 in UTC on the AUTHOR date. The 31 Dec 2024 20:00 -08:00 commit is 1 Jan 2025 04:00 UTC (in);
  the 31 Dec 2025 23:30 -05:00 commit is 1 Jan 2026 04:30 UTC (out).
- Identity: kenji.arai@lumenworks.example and 31337+karai@users.noreply.example.org. Kenji Araki is another person.
  PR #61 (squash) is authored by Dara Holm; Kenji is only a Co-authored-by, so it is not his commit.
- Merge commits are excluded (they add no authored change); the one merge here is authored by karai.
- Line counts use `git show --numstat -M` so the pure rename benches/bench.rs -> benches/itoa.rs counts only its 3-line
  edit rather than deleting and re-adding the whole file. Without -M the rename inflates the total by the file length.
- Excluded from line counts: Cargo.lock (marked linguist-generated in .gitattributes) and the binary PNG (numstat prints '-').
- Gross = every listed commit counted. The revert (0588dde) and the re-application (e771e4f) cancel the original ;
  "net" counts the cycle once (only the re-application).
"""
import subprocess, sys, datetime as dt
repo = sys.argv[1]
def git(*a): return subprocess.check_output(['git','-C',repo,*a], text=True)
MINE = {'kenji.arai@lumenworks.example','31337+karai@users.noreply.example.org'}
lo = dt.datetime(2025,1,1,tzinfo=dt.timezone.utc); hi = dt.datetime(2026,1,1,tzinfo=dt.timezone.utc)
EXC = ('Cargo.lock',)
def stats(h, M=True):
    a=d=0; binary=[]
    args = ['show','--numstat','--format=','-m' ]
    out = git('show','--numstat','--format=', '-M' if M else '--no-renames', h)
    for l in out.splitlines():
        x,y,f = l.split('\t',2)
        if f in EXC: continue
        if x == '-': binary.append(f); continue
        a+=int(x); d+=int(y)
    return a,d,binary
rows = git('log','--format=%h%x1f%ae%x1f%aI%x1f%P%x1f%s').splitlines()
inyear=[]; merges=[]; outside=[]
for r in rows:
    h,ae,ad,par,s = r.split('\x1f')
    if ae not in MINE: continue
    t = dt.datetime.fromisoformat(ad.replace('Z','+00:00')).astimezone(dt.timezone.utc)
    if len(par.split())>1: merges.append((h,s)); continue
    (inyear if lo<=t<hi else outside).append((h,ad,s))
inyear.reverse()
print("Commits authored by Kenji in 2025 UTC (non-merge):", len(inyear))
ta=td=0
for h,ad,s in inyear:
    a,d,b = stats(h); ta+=a; td+=d
    print(f"  {h} {ad} +{a} -{d} {'(binary: '+','.join(b)+')' if b else ''} {s}")
print(f"GROSS lines in hand-written files (numstat -M, Cargo.lock and binary excluded): +{ta} -{td}")
rev = [x for x in inyear if x[2].startswith('Revert ')]
orig = [x for x in inyear if x[2]=='Rename digits10 to decimal_digits and test it']
na = ta; nd = td
# net: drop the original and its revert, keep the re-application
o = orig[0]; r = rev[0]  # orig[0] is the original, orig[1] the re-application
for h,_,_ in (o, r):
    a,d,_b = stats(h); na-=a; nd-=d
print(f"NET lines counting the revert cycle once (original+revert removed, re-application kept): +{na} -{nd}")
print("Commits for net view:", len(inyear)-2)
print(f"UNDONE: {orig[0][0]} 'Rename digits10 ...' was reverted by {rev[0][0]}, then re-applied as {orig[1][0]} (same patch, same author date 2025-03-10, committed 2025-03-24). In effect today.")
print("Merge commits authored by Kenji (excluded):", merges)
print("Outside 2025 UTC (excluded):", outside)
print("Lines if rename detection is off (WRONG, inflated):", "+%d -%d" % tuple(map(sum, zip(*[stats(h, M=False)[:2] for h,_,_ in inyear]))))
print("Not his: PR #61 (author Dara Holm, Co-authored-by Kenji), Kenji Araki's README commit, Release 1.0.15 bot commit, Lena Voss's two fuzz commits.")
lockc=[h for h,_,s in inyear if s=='Add Cargo.lock'][0]
print("Cargo.lock lines added by Kenji (generated, excluded):", git('show','--numstat','--format=',lockc).split())
