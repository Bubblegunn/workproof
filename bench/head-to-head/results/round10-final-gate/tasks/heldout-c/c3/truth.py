# truth.py <fixture-dir>  (run: python3 -I truth.py <dir>)
# Conventions (c3, judging a candidate's claim "wrote the theme feature, ~900 lines, mostly
# alone, over two weeks in March 2025"):
# - Feature commits = the 8 commits after base commit abc20a3 (everything after it).
# - Authorship = git AUTHOR; the committer field shows who applied the commit.
# - Lines = added lines from `git log --numstat`; whitespace-only = commit with 0 changed
#   lines under `git show -w --ignore-blank-lines --numstat`; third-party = files whose first line says "Copied from".
# - Author dates can be set freely (GIT_AUTHOR_DATE); committer dates here all fall within
#   minutes on 2025-04-29, so the March spread is not independent evidence of two weeks of work.
import subprocess, sys, re
from datetime import datetime
d=sys.argv[1]
def git(*a): return subprocess.run(['git','-C',d,*a],capture_output=True,text=True,check=True).stdout
BASE='abc20a3'
revs=git('rev-list','--reverse',BASE+'..HEAD').split()
tot=0; by={}; ws_lines=0; tp_lines=0; per=[]
for r in revs:
    an,cn,ad,cd,s=git('log','-1','--format=%an\x1f%cn\x1f%aI\x1f%cI\x1f%s',r).strip().split('\x1f')
    stat=re.findall(r'^(\d+)\t(\d+)\t(.+)$',git('show','--numstat','--format=',r),re.M)
    a=sum(int(x) for x,_,_ in stat)
    wsstat=re.findall(r'^(\d+)\t(\d+)\t(.+)$',git('show','-w','--ignore-blank-lines','--numstat','--format=',r),re.M)
    wsa=sum(int(x) for x,_,_ in wsstat)
    tp=0
    for x,_,p in stat:
        first=git('show',r+':'+p).splitlines()[0] if git('show',r+':'+p) else ''
        if first.startswith('# Copied from') : tp+=int(x)
    tot+=a; by[an]=by.get(an,0)+a
    if wsa==0 and a>0: ws_lines+=a
    tp_lines+=tp
    per.append((r[:7],an,cn,ad,cd,s,a,wsa,tp))
    print(r[:7],'author=%s committer=%s'%(an,cn),'authored',ad,'committed',cd,'+%d (ignoring-whitespace +%d, third-party +%d)'%(a,wsa,tp),s)
print('total lines added in feature commits:',tot,' (claim: ~900)')
print('by author:',by)
print('whitespace-only lines (cargo fmt commit):',ws_lines,' third-party copied lines:',tp_lines)
jun=by['Jun Park']
print('Jun-authored lines, raw:',jun,' minus whitespace-only and third-party:',jun-ws_lines-tp_lines)
print('commits authored by Jun:',len([p for p in per if p[1]=='Jun Park']),' authored by Sam Ortiz but committed by Jun:',[p[0] for p in per if p[1]=='Sam Ortiz' and p[2]=='Jun Park'])
cds=[datetime.fromisoformat(p[4]) for p in per]; ads=[datetime.fromisoformat(p[3]) for p in per]
print('author-date span (days):',(max(ads)-min(ads)).days,' committer-date span (minutes):',int((max(cds)-min(cds)).total_seconds()//60),'all committed on',sorted({c.date().isoformat() for c in cds}))
print('commits in feature range:',len(revs))
