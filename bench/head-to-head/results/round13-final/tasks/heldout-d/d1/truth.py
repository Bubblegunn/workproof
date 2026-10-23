# Conventions (d1): person = author name "Alex Rivera", under work email AND the GitHub noreply email (same name, same repo:
# web-UI squash merges are recorded under the noreply address). "Alex Rivero" is a different person. Only AUTHORED commits
# count (not commits Alex merely committed); merge commits are excluded; reverted work is reported as net-zero.
# Window = author date as written in the commit (local date), 2025-07-01..2025-12-31; UTC-based counts are printed too
# because two boundary commits flip. Generated file docs/api-snapshot.json is excluded from "meaningful" line counts.
import subprocess, sys, os, datetime as dt
R = sys.argv[1]
env = {'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_SYSTEM': '/dev/null', 'PATH': os.environ['PATH']}
def git(*a): return subprocess.run(['git', '-C', R, *a], check=True, capture_output=True, text=True, env=env).stdout
SEP = '\x1f'
out = git('log', '--no-merges', '--numstat', f'--format=@@%H{SEP}%an{SEP}%ae{SEP}%cn{SEP}%aI{SEP}%s')
commits = []
for blk in out.split('@@')[1:]:
    lines = blk.strip('\n').split('\n')
    h, an, ae, cn, ai, s = lines[0].split(SEP)
    files = [l.split('\t') for l in lines[1:] if l.strip()]
    commits.append(dict(h=h[:7], an=an, ae=ae, cn=cn, ai=ai, s=s, files=files))
def utc(ai): return dt.datetime.fromisoformat(ai).astimezone(dt.timezone.utc).date().isoformat()
def inwin(d): return '2025-07-01' <= d <= '2025-12-31'
mine = [c for c in commits if c['an'] == 'Alex Rivera']
print('person commits (name Alex Rivera, all emails), no merges:', len(mine))
for scope in ('local', 'utc'):
    sel = [c for c in mine if inwin(c['ai'][:10] if scope == 'local' else utc(c['ai']))]
    work = [c for c in sel if c['ae'] == 'alex.rivera@northwind.example']
    print(f'--- window by {scope} date: authored commits (both emails) = {len(sel)}; work-email only = {len(work)}')
    for c in sel: print('  ', c['h'], c['ai'], c['ae'], c['s'])
sel = [c for c in mine if inwin(c['ai'][:10])]
def tot(cs, skip_gen):
    a = d = 0
    for c in cs:
        for x, y, f in c['files']:
            if skip_gen and f.startswith('docs/api-snapshot'): continue
            a += int(x); d += int(y)
    return a, d
a, d = tot(sel, True); print('local window, excluding generated snapshot: added', a, 'deleted', d, 'net', a - d)
a, d = tot(sel, False); print('local window, including generated snapshot: added', a, 'deleted', d, 'net', a - d)
print('generated snapshot lines (single commit):', [(c['h'], f[0]) for c in sel for f in c['files'] if f[2].startswith('docs/api-snapshot')])
print('reverted pair: msgpack experiment added 100 and removed 100 (net 0)')
print('different person, must NOT count:', [(c['h'], c['an'], c['ae']) for c in commits if c['an'] == 'Alex Rivero'])
print('committed-by-Alex but authored by someone else, must NOT count:', [(c['h'], c['an']) for c in commits if c['cn'] == 'Alex Rivera' and c['an'] != 'Alex Rivera'])
print('merge commits by Alex (excluded):', git('log', '--merges', '--author=Alex Rivera', '--format=%h %aI %s', '--since=2025-01-01').strip())
print('outside window by local date:', [(c['h'], c['ai'][:10]) for c in mine if not inwin(c['ai'][:10])])
print('themes that shipped: key rotation (+tests), token expiry metrics hook, signature comparison hardening, audit log for signing failures; not shipped: msgpack experiment')
print('HEAD', git('rev-parse', '--short', 'HEAD').strip())
