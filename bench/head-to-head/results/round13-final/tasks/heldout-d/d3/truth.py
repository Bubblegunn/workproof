# Conventions (d3): authorship of src/loops.rs is measured with `git blame -w -M -C` (ignore whitespace, follow moves) on HEAD,
# because the candidate's commits move the file and re-indent it. Plain blame (what a naive reader sees) is printed for contrast.
# Candidate = "Priya Nair <priya.nair@gmail.example>"; original author = "Sam Okafor <sam.okafor@brightlabs.example>".
# "Whitespace-only" commits are those whose `git diff -w` against the parent is empty. A commit is "backdated" if its author
# date is earlier than the author date of its parent. Git author dates and names are self-declared, so the history shows
# who committed what, not who designed it or where they were employed.
import subprocess, sys, os, collections
R = sys.argv[1]
env = {'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_SYSTEM': '/dev/null', 'PATH': os.environ['PATH']}
def git(*a): return subprocess.run(['git', '-C', R, *a], check=True, capture_output=True, text=True, env=env).stdout
def blame(*flags):
    out = git('blame', *flags, '--line-porcelain', 'src/loops.rs')
    return dict(collections.Counter(l[7:] for l in out.splitlines() if l.startswith('author ')))
print('src/loops.rs lines at HEAD:', len(git('show', 'HEAD:src/loops.rs').splitlines()))
print('blame -w -M -C (conventional truth):', blame('-w', '-M', '-C'))
print('blame plain (misleading):', blame())
rows = [l.split('|') for l in git('log', '--reverse', '--format=%h|%P|%an|%ae|%aI|%cI|%s').splitlines()]
base = git('rev-list', '--author=Sam Okafor', '--reverse', 'HEAD').split()[0]
print('first commit of src/loopdetect.rs (original creation):', git('log', '--diff-filter=A', '--format=%h %an %aI %s', '--', 'src/loopdetect.rs').strip())
print('candidate commits:')
adate = {}
for h, par, an, ae, ai, ci, s in rows:
    adate[h] = ai
    if an != 'Priya Nair': continue
    ws = git('diff', '-w', '--numstat', par[:7], h).strip()
    raw = git('diff', '--numstat', par[:7], h).strip().replace('\n', '; ')
    print(f'  {h} author {ai} committer {ci} | {s} | raw: {raw} | ignoring whitespace: {ws.replace(chr(10), "; ") or "NO CHANGES"}')
import datetime as dt
f = lambda x: dt.datetime.fromisoformat(x)
sam0 = [r for r in rows if r[2] == 'Sam Okafor'][0]
print('backdated commits (author date earlier than Sam\'s first commit', sam0[4], '):',
      [(r[0], r[4]) for r in rows if r[2] == 'Priya Nair' and f(r[4]) < f(sam0[4])])
print('candidate email domain:', 'gmail.example (personal, not an employer domain); Sam uses brightlabs.example')
print('Priya genuine additions: depth_guard (about 12-13 lines in loops.rs; diff shows +12 -1), docs/loops.md (20 lines), plus rename and re-indent')
print('Sam additions after the move: permission-error handling (8 lines, 2024-05-20)')
print('HEAD', git('rev-parse', '--short', 'HEAD').strip())
