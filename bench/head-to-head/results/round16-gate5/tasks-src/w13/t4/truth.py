#!/usr/bin/env python3
"""t4 ground truth: three CV claims of Noor Haddad checked against history. usage: truth.py <fixture-dir>"""
import subprocess, sys, collections
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, errors="replace", check=True).stdout
# Convention 1 (identity): Noor = two addresses (work address, later noreply address).
NOOR = {"noor.haddad@example.com", "noor@users.noreply.example"}
# Convention 2 (credit): "author" = the author field of a commit, or surviving lines blamed to her. A trailer
# "Co-authored-by" is co-authorship credit given by the maintainer; "Reviewed-by" is review credit only. They
# are different kinds of evidence and are reported separately: the CV claims differ in strength ("designed and
# implemented", "author of", "authored"), so the evidence has to be matched to the verb.
# Convention 3 (rename): history is followed across the rename benches/harness.rs -> benches/runner.rs (pure
# rename commit, 100% similarity); the rename commit by the maintainer is not a contribution to the content.
# Convention 4 (committer): Eli rebased and merged Noor's commits (he is the committer); the author field, not
# the committer, says who wrote them.
def blame(path):
    c = collections.Counter(); out = git("blame", "--line-porcelain", "HEAD", "--", path).split("\n")
    for l in out:
        if l.startswith("author-mail "): c["Noor" if l.split()[1].strip("<>") in NOOR else "other(" + l.split()[1].strip("<>") + ")"] += 1
    return dict(c)
def noor_commits(*paths):
    r = []
    for l in git("log", "--follow", "--format=%h|%ae|%an|%aI|committer %cn %cI|%s", "--", *paths).splitlines():
        if l.split("|")[1] in NOOR: r.append(l)
    return r
print("== claim (b) 'author of the benchmark harness' ==")
print("rename in history:", git("log", "--follow", "-M", "--diff-filter=R", "--summary", "--format=%h %s", "--", "benches/runner.rs").strip().replace("\n", " | "))
nc = noor_commits("benches/runner.rs")
print("commits AUTHORED by Noor on the harness (following the rename):", len(nc))
for l in nc: print("   ", l)
print("surviving lines in benches/runner.rs (blame follows the rename):", blame("benches/runner.rs"))
print("verdict: SUPPORTED. She wrote 85 of the 90 surviving lines; the 5 changed lines are a maintainer tidy; Eli is only committer/merger/renamer.")
print()
print("== claim (a) 'designed and implemented the SIMD formatting path' ==")
sq = git("log", "-1", "--format=%h", "--grep=^Add SIMD formatting path").strip()
print("landing commit", sq, "author:", git("log", "-1", "--format=%an <%ae>", sq).strip())
print("body:", git("log", "-1", "--format=%b", sq).strip().replace("\n", " / "))
print("commits authored by Noor touching src/simd.rs:", len(noor_commits("src/simd.rs")))
print("surviving lines in src/simd.rs:", blame("src/simd.rs"))
print("verdict: PARTLY SUPPORTED. The history credits her as co-author and as author of the prototype in #19 (the #19 commits are not in this repository, only the maintainer's words). 'Implemented' as landed is not shown: every line is committed under Eli; 'designed' cannot be shown by git at all.")
print()
print("== claim (c) 'authored the error-handling rework' ==")
er = git("log", "-1", "--format=%h", "--grep=^Rework error handling").strip()
print("landing commit", er, "author:", git("log", "-1", "--format=%an <%ae>", er).strip())
print("trailers:", git("log", "-1", "--format=%(trailers:only,unfold)", er).strip().replace("\n", " / "))
print("commits authored by Noor touching src/error.rs:", len(noor_commits("src/error.rs")))
print("surviving lines in src/error.rs:", blame("src/error.rs"))
print("verdict: NOT SUPPORTED as 'authored'. She appears only as a reviewer (Reviewed-by trailer, along with Kim Lowe). That is real, creditable work, but a different claim; it must not be read as proof she wrote it, and it is not evidence she did not.")
print()
print("Noor addresses seen:", sorted(set(git("log", "--all", "--format=%ae").split()) & NOOR))
