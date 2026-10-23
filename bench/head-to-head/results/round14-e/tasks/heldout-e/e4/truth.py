# Ground truth for e4 (funder effort report, Elif Demir, Q1 2026 in Istanbul time = UTC+03:00).
# Conventions:
#  * Quarter boundaries are in LOCAL time (UTC+3): Q1 = local dates 2026-01-01 .. 2026-03-31.
#  * Commits: author = elif.demir@studio-kalem.example, non-merge, local author date in Q1. Bots (renovate) excluded.
#  * Active hours: only sessions whose cwd is the project (/Users/user/work/p-limit-fork). All their events are
#    de-duplicated by uuid (a session was exported twice), merged into one time-ordered stream (overlapping
#    sessions are not double counted), and consecutive gaps <= 30 minutes are summed; longer gaps are idle and ignored.
#    A gap belongs to the quarter of its START event's local date.
#  * Logs contain a pasted test key and a private email: they must not appear in the report.
import subprocess, sys, json, glob, os, datetime as dt
repo = sys.argv[1]
def git(*a): return subprocess.run(["git","-C",repo,*a],check=True,capture_output=True,text=True).stdout
TZ = dt.timezone(dt.timedelta(hours=3))
ME = "elif.demir@studio-kalem.example"
def local(iso): return dt.datetime.fromisoformat(iso).astimezone(TZ)
q1 = lambda d: dt.date(2026,1,1) <= d.date() <= dt.date(2026,3,31)
rows = [l.split("\x1f") for l in git("log","--no-merges","--format=%H%x1f%ae%x1f%aI%x1f%s").splitlines()]
mine = [r for r in rows if r[1]==ME and "2026-01-01" <= r[2][:10] and q1(local(r[2]))]
print("q1_commits_by_elif_local_time:", len(mine))
for r in sorted(mine,key=lambda r:r[2]): print("  ", r[0][:7], r[2], r[3])
print("excluded_elif_commit_utc_q1_but_local_q2:", [(r[0][:7], r[2]) for r in rows if r[1]==ME and r[2].startswith("2026-04-01T01:30")])
print("excluded_bot_commits:", len([r for r in rows if r[1].startswith("renovate")]))
ev = {}
other = 0
for f in sorted(glob.glob(os.path.join(repo,"agent-sessions","*.jsonl"))):
    for l in open(f):
        e = json.loads(l)
        if not e["cwd"].endswith("/p-limit-fork"): other += 1; continue
        ev[e["uuid"]] = dt.datetime.fromisoformat(e["timestamp"].replace("Z","+00:00"))
ts = sorted(ev.values())
mins = 0.0; idle = 0; per = {}
for a,b in zip(ts, ts[1:]):
    g = (b-a).total_seconds()/60
    if g <= 30:
        if q1(a.astimezone(TZ)): mins += g
        per[a.astimezone(TZ).date().isoformat()] = per.get(a.astimezone(TZ).date().isoformat(),0)+g
    else: idle += 1
print("q1_active_hours:", round(mins/60,2), "(%d minutes)" % round(mins))
print("active_minutes_by_local_day (all quarters):", {k: round(v) for k,v in sorted(per.items())})
print("idle_gaps_over_30min_ignored:", idle)
print("wrong_method_sum_of_per_file_spans_all_files_incl_dup_and_other_project: about 14.9 hours for Q1 files")
print("must_not_appear_in_report: sk_test_EXAMPLE0000, elif.private@mail.invalid, client-site")
