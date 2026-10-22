# truth.py <fixture-dir>  (run: python3 -I truth.py <dir>)
# Conventions (chosen for c1, promotion evidence, window 2025-01-01..2025-06-30):
# - "Dana" = author email dana.reyes@acme-corp.example OR dana.reyes@gmail.example
#   (the gmail one is her personal laptop; proven by a Signed-off-by trailer naming her).
# - A commit belongs to the window by AUTHOR date (UTC), not committer date, because
#   a rebase rewrites committer date. Merge commits are not counted as her work items.
# - Line counts come from `git log --numstat`; vendor/ and the mechanical formatter-header
#   commit are reported separately because they are not authored effort.
# - Co-authored-by trailers give partial credit only; they are listed, not counted in her total.
import subprocess, sys, re
from datetime import datetime, timezone
d = sys.argv[1]
def git(*a): return subprocess.run(['git','-C',d,*a],capture_output=True,text=True,check=True).stdout
DANA = {'dana.reyes@acme-corp.example','dana.reyes@gmail.example'}
LO = datetime(2025,1,1,tzinfo=timezone.utc); HI = datetime(2025,7,1,tzinfo=timezone.utc)
SEP='\x1e'
raw = git('log','--no-merges','--numstat','--format='+SEP+'%h\x1f%ae\x1f%aI\x1f%cI\x1f%s\x1f%b')
rows=[]
for chunk in raw.split(SEP)[1:]:
    head,_,stat = chunk.partition('\n\n') if False else (chunk,'','')
    lines = chunk.split('\n')
    meta = chunk.split('\x1f')
    h,ae,ad,cd,subj = meta[0],meta[1],meta[2],meta[3],meta[4]
    body = meta[5]
    nums = re.findall(r'^(\d+)\t(\d+)\t(.+)$', body, re.M)
    add = sum(int(a) for a,_,_ in nums); dele = sum(int(b) for _,b,_ in nums)
    vend = sum(int(a) for a,_,p in nums if p.startswith('vendor/'))
    rows.append(dict(h=h,ae=ae,ad=datetime.fromisoformat(ad).astimezone(timezone.utc),cd=cd,s=subj,add=add,dele=dele,vend=vend,body=body))
mine=[r for r in rows if r['ae'] in DANA and LO<=r['ad']<HI]
print('DANA commits in window (author date, non-merge):', len(mine))
for r in sorted(mine,key=lambda r:r['ad']):
    print(' ',r['h'],r['ad'].strftime('%Y-%m-%d'),r['ae'],'+%d/-%d'%(r['add'],r['dele']),'(vendor +%d)'%r['vend'] if r['vend'] else '',r['s'])
print('merge commits by Dana in window:', len([l for l in git('log','--merges','--format=%ae %aI').splitlines() if l.split()[0] in DANA and LO<=datetime.fromisoformat(l.split()[1]).astimezone(timezone.utc)<HI]))
out=[r for r in rows if r['ae'] in DANA and not (LO<=r['ad']<HI) and r['ad'].year>=2024 and r['h'] not in ()]
print('Dana commits authored outside window but present (rebased):',[(r['h'],r['ad'].strftime('%Y-%m-%d'),r['cd'][:10]) for r in out if r['ad']<LO])
print('commits by gmail identity:',[r['h'] for r in mine if r['ae']=='dana.reyes@gmail.example'])
tot_add=sum(r['add'] for r in mine); tot_vend=sum(r['vend'] for r in mine)
mech=[r for r in mine if 'formatter header' in r['s']]
mech_add=sum(r['add'] for r in mech)
print('lines added raw:',tot_add,' vendor:',tot_vend,' mechanical formatter commit:',mech_add,' net of both:',tot_add-tot_vend-mech_add)
rev=[r for r in mine if r['s'].startswith('Revert')]
orig=[r for r in mine if r['s']=='Speed up inline parser (30% faster)']
print('reverted feature (not in final code):',[r['h'] for r in orig],'reverted by',[r['h'] for r in rev])
print('final code still has src/mistune/fastpath.py:', 'src/mistune/fastpath.py' in git('ls-files').split())
co=[r['h'] for r in rows if 'Co-authored-by: Dana Reyes' in r['body']]
print('commits by others crediting Dana as co-author:',co)
print('distinct work items (excluding revert pair, vendor, formatter, merge): ', len(mine)-2-1-1)
