#!/usr/bin/env python3
"""t2 truth. usage: truth.py <fixture>
Request: how many lines of the CURRENT source code did Tomasz Brandt write, and what share of the code is that.
Conventions:
- Scope = tracked *.js / *.ts files (index.d.ts included) at HEAD that are NOT marked linguist-generated or
  linguist-vendored in .gitattributes (dist/**, package-lock.json, vendor/**). Hand-written code only; a generated
  bundle or vendored copy authored by him is not his code.
- Every line of those files counts in the denominator (blank lines included), so numerator and denominator agree.
- Attribution = `git blame -w -M -C`: -w ignores the whitespace-only reformat commit (tabs -> two spaces), which
  otherwise hands him every line of the project; -M/-C follow lines moved within / between files, so the five
  validateConcurrency lines he only moved stay with their original author.
- Identity = three of his addresses (kestrelworks work, GitHub no-reply 7310442+tbrandt, personal brandt.example.net).
  Tobias Brandt is a different person.
- Lines in the squash-merged PR #9 are authored by the maintainer in git; Tomasz is only a Co-authored-by trailer.
  They are NOT counted as his, and are reported separately as a disclosed caveat.
"""
import subprocess, sys, collections
repo = sys.argv[1]
def git(*a, check=True):
    return subprocess.run(['git','-C',repo,*a], capture_output=True, text=True, check=check).stdout
MINE = {'tomasz.brandt@kestrelworks.example','7310442+tbrandt@users.noreply.example.org','tb@brandt.example.net'}
files = [f for f in git('ls-files').split('\n') if f.endswith(('.js','.ts'))]
def attr(f, a): return git('check-attr', a, '--', f).strip().endswith(': true')
scope = [f for f in files if not (attr(f,'linguist-generated') or attr(f,'linguist-vendored'))]
excluded = [f for f in files if f not in scope]
def blame(flags):
    tot = collections.Counter(); per = collections.Counter(); sub = collections.Counter()
    for f in scope:
        out = git('blame', *flags, '--line-porcelain', '--', f)
        mail = None; summ = None
        for l in out.split('\n'):
            if l.startswith('author-mail '): mail = l[12:].strip('<>')
            elif l.startswith('summary '): summ = l[8:]
            elif l.startswith('\t'):
                tot[mail]+=1; per[f]+= (mail in MINE)
                if summ and summ.startswith('Add withTimeout helper'): sub['squash']+=1
    return tot, per, sub
tot, per, sub = blame(['-w','-M','-C'])
n = sum(tot.values()); mine = sum(v for k,v in tot.items() if k in MINE)
print("Files in scope:", ", ".join(scope))
print("Excluded (generated/vendored):", ", ".join(excluded))
print("Lines in scope at HEAD:", n)
print("Lines attributed to Tomasz (3 addresses), blame -w -M -C:", mine, f"= {100*mine/n:.1f}%")
for f in scope: print(f"  {f}: {per[f]}")
print("Lines of squash-merged PR #9 (author Priya Nair, Tomasz only co-author), surviving:", sub['squash'])
print("Lines by Tobias Brandt (different person):", tot['tobias.brandt@example.org'])
print("--- sensitivity (for graders) ---")
for name, fl in [("plain blame",[]),("-w",['-w']),("-w -M",['-w','-M']),("-w -M -C -C",['-w','-M','-C','-C'])]:
    t,_,_ = blame(fl); m = sum(v for k,v in t.items() if k in MINE); print(f"  {name}: {m} of {sum(t.values())} = {100*m/sum(t.values()):.1f}%")
allf = files; scope_save = scope
scope = files
t,_,_ = blame(['-w','-M','-C']); m = sum(v for k,v in t.items() if k in MINE)
print(f"  including generated/vendored .js (dist, vendor), -w -M -C: {m} of {sum(t.values())} = {100*m/sum(t.values()):.1f}%")
