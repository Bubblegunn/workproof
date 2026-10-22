# truth.py <fixture-dir>  (run: python3 -I truth.py <dir>)
# Conventions (c2, immigration contribution statement; employment start 2025-03-03):
# - Person = author email tomas.alvarez@northwind.example or <email:441f57fb>
# - Calendar date of a commit = the LOCAL date in the author-date offset as recorded (the
#   date the person experienced). The 2025-03-02T23:30-08:00 commit is 2025-03-03 in UTC but
#   2025-03-02 locally: before the start date by local date, so it is a boundary case that
#   must be excluded or explicitly flagged. The pm.example commit predates employment.
# - Author dates after 2026-10-22 (the fixture "today") are impossible and are reported as
#   undated/clock-error, never as 2031 work.
# - Files whose first line says "Code generated ... DO NOT EDIT" are generated, not authored.
# - Renames are detected by git's default rename detection (0 lines changed).
# - Co-authored-by credit is listed separately; Wei Zhang is the author of that commit.
import subprocess, sys, re
from datetime import date
d=sys.argv[1]
def git(*a): return subprocess.run(['git','-C',d,*a],capture_output=True,text=True,check=True).stdout
START=date(2025,3,3); TODAY=date(2026,10,22)
ME={'tomas.alvarez@northwind.example','tomas.alvarez@pm.example'}
raw=git('log','--no-merges','--numstat','--format=\x1e%h\x1f%ae\x1f%an\x1f%aI\x1f%s\x1f%b\x1f')
rows=[]
for ch in raw.split('\x1e')[1:]:
    m=ch.split('\x1f'); h,ae,an,ai,s,body,stat=m[0],m[1],m[2],m[3],m[4],m[5],m[6]
    ld=date.fromisoformat(ai[:10])
    nums=re.findall(r'^(\d+)\t(\d+)\t(.+)$',stat,re.M)
    gen=0;hand=0
    for a,b,p in nums:
        if p.startswith('internal/gen/'): gen+=int(a)
        elif '=>' not in p: hand+=int(a)
    rows.append((h,ae,an,ai,ld,s,body,gen,hand,nums))
print('start date:',START)
for h,ae,an,ai,ld,s,body,gen,hand,nums in rows:
    if h in ('d1e6332',) : continue
    if ae in ME or 'Tom' in body:
        if ld>TODAY: cls='IMPOSSIBLE DATE (clock error): undated, do not count as 2031'
        elif ld<START: cls='BEFORE START (local date)'
        else: cls='AFTER START'
        if ae not in ME: cls='NOT AUTHORED BY HIM (co-author credit only)'
        print(h,ai,an,ae,'|',s,'| generated +%d hand +%d |'%(gen,hand),cls)
        if any('=>' in p for _,_,p in nums): print('   rename-only changes:',[p for _,_,p in nums if '=>' in p])
mine=[r for r in rows if r[1] in ME and START<=r[4]<=TODAY]
print('his commits dated on/after start, valid dates:',[r[0] for r in mine],'count',len(mine))
print('hand-written lines added in those:',sum(r[8] for r in mine),' generated lines excluded:',sum(r[7] for r in mine))
print('hand-written lines in impossible-date commit:',[ (r[0],r[8]) for r in rows if r[1] in ME and r[4]>TODAY])
print('boundary commit (UTC date would be start date):', [r[0] for r in rows if r[3].startswith('2025-03-02T23:30')])
print('total commits by him incl. all:',len([r for r in rows if r[1] in ME]))
