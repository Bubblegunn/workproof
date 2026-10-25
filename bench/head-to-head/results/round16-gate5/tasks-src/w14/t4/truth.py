#!/usr/bin/env python3
"""t4 ground truth: size of release 1.0.27 (commits, people, first-time contributors).

Conventions (and why):
- Range = commits reachable from the 'Release 1.0.27' commit and not from the 'Release 1.0.26' commit (R26..R27).
  It is graph based because dates are unreliable here: one author date is 1970, one is 2031, one is 2027 (before the
  previous release), a rebased commit has a committer date weeks after its author date, and a pull request branch
  started before 1.0.26 and was merged after it. The commits after the release commit are not part of the release.
- Commit count (primary) = non-merge commits in the range, including bot commits, including the revert pair
  and the release commit itself (the release commit is the last commit of the release). The variants below show the
  other defensible readings.
- People (primary) = distinct humans, as authors or Co-authored-by credits in the range; maintainers count
  because they did work in the release; bots do not. Identities merged by .mailmap (via git's own %aN/%aE),
  and by equal name after case folding (Priya Nair changed e-mail address).
- First-time contributor = a person in the range with no commit (as author) in the history before 1.0.26,
  using the same identity merging. Identity is by person, so Priya Nair (earlier under another e-mail) and
  Omar Odum (earlier commit with a future author date) are not first-time.
"""
import re, subprocess, sys
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
def find(subj):
    return [l.split()[0] for l in git("log", "--format=%H %s").splitlines() if l.split(" ", 1)[1] == subj][0]
R26, R27 = find("Release 1.0.26"), find("Release 1.0.27")
rng = git("rev-list", f"{R26}..{R27}").split()
def meta(s):
    f = git("log", "-1", "--format=%an%x00%ae%x00%P%x00%B", s).split("\0")
    return f[0], f[1].lower(), len(f[2].split()), f[3]
def canon(n, e):
    m = re.match(r"(.*) <(.*)>", git("check-mailmap", f"{n} <{e}>").strip())
    return m.group(1), m.group(2).lower()
def key(n): return re.sub(r"\s+", " ", n.casefold()).strip()
parent = {}
def find_(x):
    parent.setdefault(x, x)
    while parent[x] != x:
        parent[x] = parent[parent[x]]; x = parent[x]
    return x
def union(a, b): parent[find_(a)] = find_(b)
def person(n, e):
    n, e = canon(n, e)
    union("e:" + e, "n:" + key(n))
    return "e:" + e
nonmerge, merges, bots = [], [], 0
authors, coauthors = set(), set()
names = {}
for s in rng:
    n, e, np_, body = meta(s)
    if np_ > 1: merges.append(s); continue
    nonmerge.append(s)
    if "[bot]" in n: bots += 1; continue
    authors.add(person(n, e)); names[person(n, e)] = canon(n, e)[0]
    for line in body.splitlines():
        t = re.match(r"Co-authored-by:\s*(.*?)\s*<(.*)>", line, re.I)
        if t: coauthors.add(person(t.group(1), t.group(2))); names[person(t.group(1), t.group(2))] = canon(t.group(1), t.group(2))[0]
prior = set()
for l in git("log", "--format=%an%x00%ae", R26).splitlines():
    n, e = l.split("\0"); prior.add(person(n, e))
root = lambda s: find_(s)
A = {root(x) for x in authors}; C = {root(x) for x in coauthors} - A
P = {root(x) for x in prior}
first_authors = sorted({names[x] for x in authors if root(x) not in P})
first_co = sorted({names[x] for x in coauthors if root(x) not in P and root(x) not in A})
disp = lambda S: sorted({names[x] for x in (authors | coauthors) if root(x) in S})
print("RANGE", f"{R26[:7]}..{R27[:7]}", f"({len(rng)} commits incl. {len(merges)} merge)")
print("COMMITS (primary: non-merge, bots included, release commit included):", len(nonmerge))
print("  variant: without the release commit itself:", len(nonmerge) - 1)
print("  variant: also counting merge commits:", len(nonmerge) + len(merges))
print("  variant: without bot commits:", len(nonmerge) - bots)
print("  variant: without bots and without the release commit:", len(nonmerge) - bots - 1)
print("PEOPLE (primary: authors + co-authors, maintainers included, bots excluded):", len(A | C))
print("  ", disp(A | C))
print("  variant: authors only:", len(A), disp(A))
print("FIRST-TIME CONTRIBUTORS (primary: authors only):", len(first_authors), first_authors)
print("  variant: counting co-authors too:", len(first_authors) + len(first_co), first_authors + first_co)
since = git("log", "--since=" + git("log", "-1", "--format=%cI", R26).strip(), "--format=%H", R27).split()
print("PITFALL: commits found by date (--since the 1.0.26 commit date) up to the release:", len(since), "(wrong; graph range is the truth)")
