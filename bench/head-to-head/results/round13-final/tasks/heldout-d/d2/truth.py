# Conventions (d2): person = author name "Jun Park". Dates = AUTHOR date, local date as recorded in the commit (the officer
# wants when the work was done, in the place it was done); UTC-day and committer-date variants are printed because they differ.
# Future-date rule: any author date after 2026-10-23 (the assumed "today" of the fixture) is a clock error and excluded.
# Gap = days between consecutive distinct commit dates > 30. Other people's commits (Dana Whitfield) never count for Jun.
import subprocess, sys, os, datetime as dt
R = sys.argv[1]
env = {'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_SYSTEM': '/dev/null', 'PATH': os.environ['PATH']}
def git(*a): return subprocess.run(['git', '-C', R, *a], check=True, capture_output=True, text=True, env=env).stdout
rows = [l.split('|') for l in git('log', '--format=%h|%an|%aI|%cI|%s').splitlines()]
jun = [(h, a, c, s) for h, n, a, c, s in rows if n == 'Jun Park']
TODAY = '2026-10-23'
fut = [r for r in jun if r[1][:10] > TODAY]
ok = [r for r in jun if r[1][:10] <= TODAY]
print('future-dated commits (excluded as clock error):', [(h, a, s) for h, a, c, s in fut])
def D(x): return dt.date.fromisoformat(x)
def gaps(dates):
    ds = sorted(set(dates)); return [(a, b, (D(b) - D(a)).days) for a, b in zip(ds, ds[1:]) if (D(b) - D(a)).days > 30]
def u(x): return dt.datetime.fromisoformat(x).astimezone(dt.timezone.utc).date().isoformat()
loc = [a[:10] for h, a, c, s in ok]
print('Jun commits (non-future):', len(ok))
print('AUTHOR local date  first:', min(loc), ' last:', max(loc), ' active months:', len({d[:7] for d in loc if d[:4] == '2025'}))
print('AUTHOR local gaps >30d:', gaps(loc))
print('AUTHOR UTC date    first:', min(map(u, [a for _, a, _, _ in ok])), ' last:', max(map(u, [a for _, a, _, _ in ok])))
print('AUTHOR UTC gaps >30d:', gaps([u(a) for _, a, _, _ in ok]))
cd = [c[:10] for h, a, c, s in ok]
print('COMMITTER date gaps >30d (rebase moves one commit):', gaps(cd))
print('rebased commit (author date != committer date):', [(h, a, c, s) for h, a, c, s in ok if a[:10] != c[:10]])
print('boundary commits (local date vs UTC date):', [(h, a, u(a)) for h, a, c, s in ok if a[:10] != u(a)])
print('other authors in 2025 (must not fill gaps):', [(h, n, a[:10]) for h, n, a, c, s in rows if n != 'Jun Park' and a[:4] == '2025'])
print('HEAD', git('rev-parse', '--short', 'HEAD').strip())
