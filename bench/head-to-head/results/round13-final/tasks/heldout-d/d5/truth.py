# Conventions (d5): person = author NAME "Lena Hoffmann" under either of her emails (work address and GitHub noreply).
# "Lena Hofmann <l.hofmann@other-agency.example>" is a different person and never counts. A billed day is SUPPORTED if Lena
# authored a non-merge commit on that day (author date, local +02:00 date as recorded) whose diff is not whitespace-only.
# THIN = the only candidate evidence for the day is a merge commit or a whitespace-only commit (or a cited commit authored on
# another day). UNSUPPORTED = no Lena commit at all on that day. The cited sha in the CSV is checked separately.
# Weekend commits (Sun 2025-10-12) are not billed and are not an issue.
import subprocess, sys, os, csv, io
R = sys.argv[1]
env = {'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_SYSTEM': '/dev/null', 'PATH': os.environ['PATH']}
def git(*a, ok=True):
    r = subprocess.run(['git', '-C', R, *a], capture_output=True, text=True, env=env)
    if ok and r.returncode: raise SystemExit(r.stderr)
    return r
lena = ('Lena Hoffmann',)
rows = [l.split('|') for l in git('log', '--format=%H|%h|%P|%an|%ae|%aI|%cI|%s').stdout.splitlines()]
info = {r[1]: r for r in rows}
def wsonly(r):
    par = r[2].split()
    if len(par) != 1: return False
    return git('diff', '-w', '--numstat', par[0], r[0]).stdout.strip() == ''
ts = list(csv.DictReader(io.StringIO(git('show', 'HEAD:timesheet.csv').stdout)))
tot = 0; bad = 0; res = {}
for t in ts:
    d = t['date']; h = float(t['hours']); tot += h
    mine = [r for r in rows if r[3] in lena and r[5][:10] == d]
    solid = [r for r in mine if len(r[2].split()) == 1 and not wsonly(r)]
    cited = info.get(t['commit'][:7])
    ccomment = 'cited sha not in repo' if not cited else f"cited {cited[1]} by {cited[3]} <{cited[4]}>, authored {cited[5][:10]}, committed {cited[6][:10]}, {'MERGE' if len(cited[2].split()) > 1 else 'whitespace-only' if wsonly(cited) else 'normal'}: {cited[7]}"
    if solid: v = 'SUPPORTED'
    elif mine: v = 'THIN'
    else: v = 'UNSUPPORTED'
    res[d] = (v, h)
    print(d, f'{h:g}h', v, '|', ccomment)
print('total billed hours:', f'{tot:g}')
for v in ('SUPPORTED', 'THIN', 'UNSUPPORTED'):
    ds = [d for d, (x, h) in res.items() if x == v]
    print(f'{v}: days {ds} hours {sum(res[d][1] for d in ds):g}')
print('NOTE 10-03: day has a commit, but by look-alike Lena Hofmann (different person) -> UNSUPPORTED for Lena')
print('NOTE 10-08: cited commit authored 2025-09-29, re-committed 2025-10-08; no Lena work authored on 10-08 -> UNSUPPORTED by author date (committer date is 10-08, mention it)')
print('NOTE 10-10: only a merge commit by Lena (no content of hers) -> THIN; 10-06 whitespace-only -> THIN; 10-13: sha 9f3e1ab absent; Lena committed Sun 10-12 instead')
print('HEAD', git('rev-parse', '--short', 'HEAD').stdout.strip())
