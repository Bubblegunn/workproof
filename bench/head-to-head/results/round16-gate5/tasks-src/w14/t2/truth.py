#!/usr/bin/env python3
"""t2 ground truth: who to thank for the release after the commit titled '6.3.0'.

Conventions (and why):
- Window = commits in 6.3.0..HEAD (graph range). A thank-you section covers the work in this release only.
- Identity = people, not name/e-mail strings. Identities are merged (a) through .mailmap (git applies it for
  %aN/%aE; Co-authored-by trailers are run through `git check-mailmap`), (b) by equal e-mail, and
  (c) by equal name after removing accents and case (José Álvarez / Jose Alvarez; Zoe Park at a work address).
- Credit goes to the commit AUTHOR (not the committer): a cherry-picked change belongs to its author.
- Co-authored-by trailers count as credit (squash merges lose the individual commits).
- Not thanked: the maintainers listed in MAINTAINERS.md (the prompt says "outside the core team"; maintainers are
  matched after mailmap, so 'Nils N.' at a private address is Nils Norell), and bots ([bot] names).
- Only work that is IN the release counts: a commit that was reverted inside the window (and not re-applied)
  gives no credit. (Defensible alternative: thank the reverted contributor for trying; truth lists that person apart.)
- Merge commits are never credited to the merger; the merged commits' authors are.
"""
import re, subprocess, sys, unicodedata
repo = sys.argv[1]
def git(*a, check=True):
    return subprocess.run(["git", "-C", repo, *a], check=check, capture_output=True, text=True).stdout
rel = [l.split()[0] for l in git("log", "--format=%H %s").splitlines() if l.split(" ", 1)[1] == "6.3.0"][0]
shas = git("rev-list", "--reverse", "--topo-order", f"{rel}..HEAD").split()
maint_emails = set(re.findall(r"<([^>]+)>", open(repo + "/MAINTAINERS.md").read()))
def canon(name, email):
    out = git("check-mailmap", f"{name} <{email}>").strip()
    m = re.match(r"(.*) <(.*)>", out)
    return m.group(1), m.group(2).lower()
def norm(n):
    n = unicodedata.normalize("NFKD", n)
    return "".join(ch for ch in n if not unicodedata.combining(ch)).lower().strip()
meta = {}
for s in shas:
    body = git("log", "-1", "--format=%B", s)
    meta[s] = dict(
        subj=git("log", "-1", "--format=%s", s).strip(),
        merge=len(git("log", "-1", "--format=%P", s).split()) > 1,
        an=git("log", "-1", "--format=%an", s).strip(), ae=git("log", "-1", "--format=%ae", s).strip(),
        body=body, target=(re.search(r"This reverts commit ([0-9a-f]{40})", body) or [None, None])[1])
rev = {}
for s, m in meta.items():
    if m["target"]: rev.setdefault(m["target"], []).append(s)
def alive(s): return not any(alive(r) for r in rev.get(s, []))
# union-find over identities
parent = {}
def find(x):
    parent.setdefault(x, x)
    while parent[x] != x:
        parent[x] = parent[parent[x]]; x = parent[x]
    return x
def union(a, b): parent[find(a)] = find(b)
credits = []   # (identity-key-tuple, commit, role, alive)
for s in shas:
    m = meta[s]
    if m["merge"] or m["target"]: continue
    people = [("author",) + canon(m["an"], m["ae"])]
    for line in m["body"].splitlines():
        t = re.match(r"Co-authored-by:\s*(.*?)\s*<(.*)>", line, re.I)
        if t: people.append(("co-author",) + canon(t.group(1), t.group(2)))
    for role, n, e in people:
        union("e:" + e, "n:" + norm(n))
        credits.append((n, e, s, role, alive(s)))
groups = {}
for n, e, s, role, al in credits:
    g = find("e:" + e)
    groups.setdefault(g, []).append((n, e, s, role, al))
def is_bot(n, e): return "[bot]" in n
def is_maint(items): return any(e in maint_emails for _, e, *_ in items)
thank, reverted_only, excluded = [], [], []
for g, items in groups.items():
    names = sorted({n for n, *_ in items}, key=lambda x: (-len(x), x))
    label = names[0]
    if all(is_bot(n, e) for n, e, *_ in items): excluded.append(f"{label} (bot)"); continue
    if is_maint(items): excluded.append(f"{label} (maintainer)"); continue
    if not any(al for *_, al in items):
        reverted_only.append(label); continue
    what = "; ".join(f"{role}: {meta[s]['subj']}" for n, e, s, role, al in items if al)
    thank.append((label, what))
thank.sort()
print("WINDOW", len(shas), "commits after '6.3.0'")
print(f"THANK ({len(thank)} people, each once)")
for l, w in thank: print(f"  {l}: {w}")
print("OPTIONAL (defensible either way, convention: not thanked because the work was reverted)")
for r in reverted_only: print("  ", r)
print("NOT THANKED")
for e in sorted(excluded): print("  ", e)
