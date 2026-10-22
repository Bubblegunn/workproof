# truth.py <fixture-dir>  (run: python3 -I truth.py <dir>)
# Conventions (c5, client checking a contractor invoice for September 2025):
# - Invoice file: docs/billing/INV-0042.txt (4 items, 62 h). Git history cannot prove hours worked;
#   it can show what was authored, by whom, when, and whether it reached main.
# - "On main" = reachable from main. feature/hreflang is a local branch, not merged.
# - Period check uses the LOCAL calendar date of the author date (contractor offset +09:00).
# - Item-to-commit mapping is by commit subject, fixed by the fixture design:
#     1 exclusion flag    -> 88610e7, 4ddc608, 1030fb4
#     2 hreflang          -> 69ee453, c544074, 1e4185b (branch only)
#     3 cache             -> 382dbdb (author Nora Fisher, not Luka)
#     4 CI Ruby 3.3       -> 80590c4 (dated 2025-10-03, outside the invoice period)
# - Same-day span = last minus first commit time of that day on all branches; reported only as the
#   upper bound of what the timestamps themselves show, not as hours worked.
import subprocess, sys, re
from datetime import date, datetime
d=sys.argv[1]
def git(*a): return subprocess.run(['git','-C',d,*a],capture_output=True,text=True,check=True).stdout
print(git('show','main:docs/billing/INV-0042.txt').strip())
onmain=set(git('rev-list','main').split())
rows=[l.split('|',4) for l in git('log','--all','--reverse','--format=%H|%h|%an|%aI|%s').splitlines()]
items={'1':['Add exclude_from','Add tests for exclude','Document exclude'],'2':['hreflang','Start hreflang'],'3':['Cache generated'],'4':['Fix CI']}
byday={}
for H,h,an,ai,s in rows:
    if an in ('Luka Petrovic','Nora Fisher'):
        item=[k for k,v in items.items() if any(x in s for x in v)]
        item=item[0] if item else '-'
        ld=ai[:10]; inper=date(2025,9,1)<=date.fromisoformat(ld)<=date(2025,9,30)
        print(h,an,ai,'item',item,'on_main' if H in onmain else 'NOT ON MAIN (branch only)','in_Sept_period' if inper else 'OUTSIDE PERIOD',s)
        if item!='-' : byday.setdefault(ld,[]).append(datetime.fromisoformat(ai))
for k,v in sorted(byday.items()):
    print('day',k,'commits',len(v),'first-to-last minutes',int((max(v)-min(v)).total_seconds()//60))
lk=[r for r in rows if r[2]=='Luka Petrovic' and date(2025,9,1)<=date.fromisoformat(r[3][:10])<=date(2025,9,30)]
print('Luka commits dated in Sept (all branches):',len(lk),' on main:',len([r for r in lk if r[0] in onmain]))
print('distinct days with Luka commits in Sept (all branches):',len({r[3][:10] for r in lk}),' (main only):',len({r[3][:10] for r in lk if r[0] in onmain}))
gl=int(re.findall(r'^(\d+)\t',git('show','--numstat','--format=','61504bc'),re.M)[0]) if git('show','--numstat','--format=','61504bc') else 0
print('Gemfile.lock generated lines in "Update dependencies" 61504bc:',gl,'(maps to no invoice item)')
print('hours that the history can directly support: none (git has no hours); invoice total claimed: 62')
print('items fully supported by commits on main within period: 1 only; item 2 branch-only; item 3 authored by Nora Fisher; item 4 dated 2025-10-03')
