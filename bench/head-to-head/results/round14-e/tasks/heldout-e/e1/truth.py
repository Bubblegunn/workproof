# Ground truth for e1 (promotion packet, Priya Raman, 2026-01-01..2026-06-30).
# Conventions:
#  * Identity: Priya has two identities in history: priya.raman@acme-corp.example ("Priya Raman")
#    and priya@priya-laptop.invalid ("priya", old laptop). Both are hers (prompt gives only her name).
#  * Period is decided by AUTHOR date, not committer date (a rebased commit has a later committer date).
#  * "Authored commits" = non-merge commits with her identity as author. Merge commits are never counted.
#  * A commit authored by someone else with a Co-authored-by trailer naming her is "shared", not counted
#    in her authored total but listed separately.
#  * Generated/vendored paths (vendor/, requirements-lock.txt) are excluded from line counts.
#  * Revert pair: a feature and its Revert commit are both real commits; surviving lines subtract the reverted file.
import subprocess, sys
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
MINE = {"priya.raman@acme-corp.example", "priya@priya-laptop.invalid"}
LO, HI = "2026-01-01T00:00:00+00:00", "2026-07-01T00:00:00+00:00"
GEN = ("vendor/", "requirements-lock.txt")
rows = [l.split("\x1f") for l in git("log", "--no-merges", "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%cI%x1f%s%x1f%(trailers:key=Co-authored-by,valueonly,separator=;)%x1e").split("\x1e") if l.strip()]
rows = [[x.strip() for x in r] for r in rows]
mine, shared, naive = [], [], 0
for r in rows:
    h, an, ae, ad, cd, s, co = [x.strip() for x in r]
    inper = LO <= ad < HI
    if ae in MINE and LO <= cd < HI: naive += 1
    if inper and ae in MINE: mine.append((h, ad, ae, s))
    if inper and ae not in MINE and any(m in co for m in MINE): shared.append((h, ad, an, s))
def added(h):
    t = 0
    for l in git("show", "--numstat", "--format=", h).splitlines():
        a, d, p = l.split("\t", 2)
        if a != "-" and not p.startswith(GEN): t += int(a)
    return t
print("authored_nonmerge_commits_in_period:", len(mine))
print("  of which via laptop identity:", sum(1 for m in mine if m[2] == "priya@priya-laptop.invalid"))
print("naive_count_by_committer_date_both_emails (WRONG method):", naive)
for m in sorted(mine, key=lambda x: x[1]): print("  ", m[0][:7], m[1][:10], m[2].split("@")[0], m[3], "+%d" % added(m[0]))
print("coauthored_shared_commits:", [(s[0][:7], s[2], s[3].splitlines()[0]) for s in shared])
tot = sum(added(m[0]) for m in mine)
print("handwritten_lines_added_excluding_vendor_and_lock:", tot)
print("generated_lines_added_in_period (vendor/ + lock):",
      sum(int(l.split("\t")[0]) for m in mine for l in git("show", "--numstat", "--format=", m[0]).splitlines() if l.split("\t", 2)[2].startswith(GEN)))
print("reverted_lines_in_handwritten (cache.py added then reverted): 120")
print("surviving_handwritten_lines_approx:", tot - 120)
print("excluded_before_period_by_author_date:", [r[0][:7] for r in rows if r[2] in MINE and r[3] < LO and "2026-01-01" <= r[4][:10] < "2026-07-01"])
print("excluded_after_period_by_author_date:", [r[0][:7] for r in rows if r[2] in MINE and r[3] >= HI])
print("merge_commits_authored_by_her_not_counted:", git("log", "--merges", "--author=priya.raman", "--format=%h %s").strip())
