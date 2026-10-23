# Ground truth for e5 (auditor: second-person review evidence for lib/ changes, Q1 2026).
# Conventions:
#  * In scope: non-merge commits whose AUTHOR date is 2026-01-01..2026-03-31 and that touch a path under lib/.
#    Reverts are changes and are in scope. Commits touching only README/Gemfile/spec are out of scope.
#  * Evidence = a Reviewed-by trailer (key case-insensitive; git's trailer parser: only the last paragraph counts, so a
#    "Reviewed-by:" quoted inside prose does NOT count). Acked-by is a different key and does NOT count.
#  * Reviewer must be a different person from the author. People are compared by email after applying the repository's
#    .mailmap (git check-mailmap), because one person committed from a second address (ben.a@laptop.invalid).
#  * A commit with no trailer of its own that was brought in through a merge commit (second-parent side) counts as reviewed
#    when the MERGE commit carries an independent Reviewed-by (reviewer different from that commit's author).
#  * Limits (must be stated by the answer): a trailer is a typed claim in a message, not proof the review took place.
import subprocess, sys
repo = sys.argv[1]
def git(*a): return subprocess.run(["git","-C",repo,*a],check=True,capture_output=True,text=True).stdout
def canon(addr):  # mailmap-canonical email from "Name <email>"
    e = addr[addr.index("<")+1:addr.index(">")]
    return git("check-mailmap", "<%s>" % e).strip().split("<")[1].rstrip(">")
FMT = "%H%x1f%aN%x1f%aE%x1f%aI%x1f%s%x1f%(trailers:key=Reviewed-by,valueonly,separator=%x1d)%x1e"
def rows(rng):
    out = []
    for r in git("log", "--no-merges", "--format="+FMT, *rng).split("\x1e"):
        if r.strip():
            h,n,e,d,s,t = [x.strip("\n") for x in r.split("\x1f")]
            out.append((h.strip(),n,e,d,s,[x.strip() for x in t.split("\x1d") if x.strip()]))
    return out
merge_cover = {}
for m in git("log", "--merges", "--format=%H").split():
    p1, p2 = git("rev-parse", m+"^1", m+"^2").split()
    tr = [x.strip() for x in git("log","-1","--format=%(trailers:key=Reviewed-by,valueonly,separator=%x1d)",m).split("\x1d") if x.strip()]
    for c in git("rev-list", p1+".."+p2).split(): merge_cover[c] = (m, tr)
allrows = rows([])
scope = []
for h,n,e,d,s,tr in allrows:
    if not ("2026-01-01" <= d[:10] <= "2026-03-31"): continue
    files = git("show","--name-only","--format=",h).split()
    if any(f.startswith("lib/") for f in files): scope.append((h,n,e,d,s,tr))
print("in_scope_lib_changes_q1_2026:", len(scope))
ok = bad = 0
for h,n,e,d,s,tr in sorted(scope, key=lambda r: r[3]):
    status, who, why = "UNREVIEWED", "", ""
    via = None
    cand = tr
    if not cand and h in merge_cover:
        via, cand = merge_cover[h]
    indep = [x for x in cand if canon(x) != e]
    if indep: status, who = "REVIEWED", indep[0]
    elif cand: why = "self-review (reviewer is same person after mailmap)"
    elif not cand: why = "no Reviewed-by trailer"
    if via and indep: why = "reviewed via merge %s" % via[:7]
    if status == "REVIEWED": ok += 1
    else: bad += 1
    print("  %s %s author=%s %s | %s | reviewer=%s %s" % (h[:7], d[:10], e.split("@")[0], status, s, who or "-", ("("+why+")") if why else ""))
print("reviewed:", ok, "flagged:", bad)
print("out_of_scope_examples: README-only commit 2026-02-20, bot Gemfile bump 2026-02-27, .mailmap commit, 2026-04-01 commit (author date in Q2)")
