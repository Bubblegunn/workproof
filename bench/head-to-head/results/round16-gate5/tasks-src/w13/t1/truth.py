#!/usr/bin/env python3
"""t1 ground truth: how much of src/cache is Dana Whitfield's. usage: truth.py <fixture-dir>"""
import subprocess, sys, collections
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout

# Convention 1 (identity): one person = one of three e-mail addresses used under the same person's name
# ("Dana Whitfield", "D. Whitfield"). The question is about a person, not an address; an address change
# (job change, noreply address) must not split her work. Bots are not people.
PERSON = {
    "dana.whitfield@acme-old.example": "Dana", "dwhitfield@personal.example": "Dana",
    "dana.w@users.noreply.example": "Dana", "marcus@example.org": "Marcus",
    "ci-bot@example.invalid": "bot",
}
def one(grep):
    out = git("log", "--format=%H", "--grep=" + grep).split()
    assert len(out) == 1, (grep, out)
    return out[0]
# Convention 2 (reformat): the commit "style: reformat ..." only changes quote style. It is skipped when
# assigning lines (blame --ignore-rev), because the purpose is who WROTE the code, not who last touched a line.
REFORMAT = one("^style: reformat")
# Convention 3 (squash + trailer): the squash commit "Add redis backend (#41)" is authored by the maintainer
# but carries a Co-authored-by trailer for Dana. Its lines are reported as a separate "shared" bucket, not
# silently given to one person, because history cannot say who typed which line.
SQUASH = one("^Add redis backend")
# Convention 4 (bot): header lines added by ci-bot are mechanical and are excluded from the person shares.
files = git("ls-tree", "-r", "--name-only", "HEAD", "--", "src/cache").split()
tot = collections.Counter(); naive = collections.Counter(); per_file = {}
def blame(extra):
    c = collections.Counter(); pf = {}
    for f in files:
        cf = collections.Counter()
        out = git("blame", "--line-porcelain", *extra, "HEAD", "--", f).splitlines()
        i = 0
        while i < len(out):
            sha = out[i].split()[0]; mail = None
            j = i + 1
            while not out[j].startswith("\t"):
                if out[j].startswith("author-mail "): mail = out[j].split()[1].strip("<>")
                j += 1
            who = "shared(squash #41)" if sha == SQUASH else PERSON[mail]
            cf[who] += 1; c[who] += 1; i = j + 1
        pf[f] = dict(cf)
    return c, pf
tot, per_file = blame(["--ignore-rev", REFORMAT])
naive, _ = blame([])
allc = sum(tot.values()); people = allc - tot["bot"]
print("lines in src/cache at HEAD:", allc, "(bot header lines:", tot["bot"], ")")
print("per file:")
for f in sorted(per_file): print("  ", f, per_file[f])
print("surviving lines, reformat skipped, bot excluded:")
for k in ("Dana", "Marcus", "shared(squash #41)"):
    print("  %-20s %3d  (%.0f%% of %d non-bot lines)" % (k, tot[k], 100 * tot[k] / people, people))
print("Dana direct + shared squash lines (upper bound with co-author credit):", tot["Dana"] + tot["shared(squash #41)"])
print("naive blame (reformat not skipped):", dict(naive))
print("squash commit", SQUASH[:7], "trailer:", git("log", "-1", "--format=%(trailers:key=Co-authored-by,valueonly)", SQUASH).strip())
print("commits that touch src/cache by person (non-bot), identities merged:")
cm = collections.Counter()
for l in git("log", "--format=%ae", "--", "src/cache").split():
    cm[PERSON[l]] += 1
print("  ", dict(cm), " raw addresses of Dana:",
      sorted(set(l for l in git("log", "--format=%ae", "--", "src/cache").split() if PERSON[l] == "Dana")))
print("original eviction (Dana, Feb 2025) was fully replaced by Marcus on 2026-03-05: surviving Dana lines in eviction.py =",
      per_file["src/cache/eviction.py"].get("Dana", 0))
dana_total = tot["Dana"]; m = tot["Marcus"]
print("verdict basis: Dana is the largest single contributor of surviving lines (%d vs %d) and co-author of the redis backend; "
      "Marcus wrote ttl, init and the current eviction; so 'principal author, not sole author'." % (dana_total, m))
