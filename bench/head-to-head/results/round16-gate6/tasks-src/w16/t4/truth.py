#!/usr/bin/env python3
"""t4 ground truth: Q3 2026 vs Q2 2026 effort comparison. Usage: truth.py <fixture-dir>"""
import subprocess, sys
from datetime import datetime, timezone
repo = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
U = timezone.utc
Q = {"Q2": (datetime(2026, 4, 1, tzinfo=U), datetime(2026, 7, 1, tzinfo=U)), "Q3": (datetime(2026, 7, 1, tzinfo=U), datetime(2026, 10, 1, tzinfo=U))}
PLAUSIBLE = (datetime(2000, 1, 1, tzinfo=U), datetime(2026, 10, 24, 23, 59, tzinfo=U))   # the repo's own "today" is 2026-10-24
ok = lambda d: PLAUSIBLE[0] <= d <= PLAUSIBLE[1]
# CONVENTION 1 (date): a commit belongs to the quarter in which it LANDED = committer date. The author date is wrong on one
# commit (1970-01-01, a broken import) and ignored. If the committer date is impossible too (2037 clock), the commit takes the
# date of its first parent (it was made right after it): the two such commits sit between commits of the same quarter.
# Plain `git log --since/--until` silently drops or mis-buckets these, and stops early past them.
# CONVENTION 2 (what counts): non-merge commits only (a merge carries no work; the work of the merged branch counts under its
# own commits); bots ([bot]) are listed but not people; each squash merge is ONE change; Co-authored-by does not make an author.
# CONVENTION 3 (size): lines added+deleted, excluding the generated Cargo.lock (hundreds of lines per dependency bump).
SEP = "\x1e"
out = git("log", "--no-merges", f"--format={SEP}%H|%P|%aN|%aI|%cI|%s", "--numstat")
rec = {}; order = []
for blk in out.split(SEP)[1:]:
    head, *st = blk.strip("\n").split("\n")
    h, par, n, ad, cd, s = head.split("|", 5)
    num = lambda v: 0 if v == "-" else int(v)
    ent = [x.split("\t", 2) for x in st if x.strip()]
    rec[h] = dict(h=h[:7], par=par.split()[0] if par else None, name=n, ad=datetime.fromisoformat(ad), cd=datetime.fromisoformat(cd), subj=s,
                  add=sum(num(a) for a, b, p in ent if p != "Cargo.lock"), dele=sum(num(b) for a, b, p in ent if p != "Cargo.lock"), lock=sum(num(a) for a, b, p in ent if p == "Cargo.lock"))
    order.append(h)
allc = {l.split("|")[0]: l.split("|")[1] for l in git("log", "--format=%H|%P|%cI").splitlines()}
cdate = {l.split("|")[0]: datetime.fromisoformat(l.split("|")[2]) for l in git("log", "--format=%H|%P|%cI").splitlines()}
def eff(h):
    d = cdate[h]
    while not ok(d):
        h = allc[h].split()[0]; d = cdate[h]
    return d
tot = {q: dict(c=0, a=0, d=0, people=set(), bots=0, subj=[]) for q in Q}
for h in order:
    r = rec[h]; d = eff(h)
    for q, (lo, hi) in Q.items():
        if lo <= d < hi:
            if r["name"].endswith("[bot]"): tot[q]["bots"] += 1; continue
            t = tot[q]; t["c"] += 1; t["a"] += r["add"]; t["d"] += r["dele"]; t["people"].add(r["name"]); t["subj"].append(r["subj"])
for q in ("Q2", "Q3"):
    t = tot[q]; print(f"{q}: commits={t['c']} added={t['a']} deleted={t['d']} changed={t['a']+t['d']} authors={sorted(t['people'])} bot_commits={t['bots']}")
    for s in t["subj"]: print("     -", s)
pc = lambda a, b: f"{100*(b-a)/a:+.1f}%"
print(f"CHANGE Q2->Q3: commits {tot['Q2']['c']}->{tot['Q3']['c']} ({pc(tot['Q2']['c'], tot['Q3']['c'])}); lines changed {tot['Q2']['a']+tot['Q2']['d']}->{tot['Q3']['a']+tot['Q3']['d']} ({pc(tot['Q2']['a']+tot['Q2']['d'], tot['Q3']['a']+tot['Q3']['d'])}); authors {len(tot['Q2']['people'])}->{len(tot['Q3']['people'])}")
print("WRONG-DATE commits (must not be dropped or put in 1970/2037):")
for h in order:
    r = rec[h]
    if not ok(r["ad"]) or not ok(r["cd"]): print(f"   {r['subj']}: author {r['ad'].date()} committer {r['cd'].date()} -> counted in", [q for q, (lo, hi) in Q.items() if lo <= eff(h) < hi])
print("Lines of Cargo.lock excluded from Q3 (generated):", sum(rec[h]['lock'] for h in order if Q['Q3'][0] <= eff(h) < Q['Q3'][1]))
print("Merge commit in Q3 (not counted): Merge branch 'feat/colours' (3 branch commits counted instead)")
