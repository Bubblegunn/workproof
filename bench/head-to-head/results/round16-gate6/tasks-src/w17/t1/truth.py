#!/usr/bin/env python3
import subprocess, sys
D = sys.argv[1]
def git(*a, inp=None):
    return subprocess.run(["git", "-C", D, *a], capture_output=True, text=True, input=inp, check=True).stdout
PATHS = ["src/itsdangerous/signer.py", "src/itsdangerous/encoding.py", ".github/workflows"]
SINCE = "2025-03-01T00:00:00+00:00"
# Convention 1: window uses the committer date (when the change entered main); here author==committer date everywhere.
# Convention 2: people are identified by .mailmap canonical e-mail, because the repo's own .mailmap says
#   which addresses are one person; comparing raw addresses would call Dana's two addresses two people.
def canon(name, email):
    out = git("check-mailmap", f"{name} <{email}>").strip()
    return out[out.index("<")+1:-1]
# Convention 3: only non-merge commits are "changes"; the merge commit is evidence about how they arrived.
log = git("log", "--no-merges", f"--since={SINCE}", "--format=%H%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%cI", "--", *PATHS)
commits = [l.split("\x1f") for l in log.strip().split("\n") if l]
merged_in = {}
for m in git("rev-list", "--merges", "HEAD").split():
    p = git("rev-parse", m + "^1", m + "^2").split()
    for h in git("rev-list", f"{p[0]}..{p[1]}").split():
        merged_in[h] = m
def trailers(sha):
    msg = git("show", "-s", "--format=%B", sha)
    out = git("interpret-trailers", "--parse", inp=msg)
    r = []
    for l in out.splitlines():
        k, _, v = l.partition(":")
        if k.strip().lower() in ("reviewed-by", "approved-by"):
            nm, _, em = v.strip().partition("<")
            r.append((nm.strip(), canon(nm.strip(), em.rstrip(">"))))
    return r
rows = []
for h, an, ae, cn, ce, cd in commits:
    a = canon(an, ae)
    ev = ""
    if "[bot]" in an:
        v, ev = "BOT-AUTHORED-NO-HUMAN-EVIDENCE", "author is a bot; no reviewer trailer; merge button committer GitHub says nothing about who approved"
    else:
        tr = trailers(h)
        others = [t for t in tr if t[1] != a]
        if others:
            v, ev = "REVIEWED-BY-OTHER", "trailer: " + ", ".join(t[0] for t in others)
        elif tr:
            v, ev = "SELF-REVIEW-ONLY", "trailer names author's own alternate address (" + tr[0][0] + ")"
        elif h in merged_in:
            m = merged_in[h]
            mc = git("show", "-s", "--format=%cn%x1f%ce", m).strip().split("\x1f")
            subj = git("show", "-s", "--format=%s", m).strip()
            # compare the merger with the author of THIS commit (other commits on the branch may be someone else's)
            if canon(*mc) == a:
                v, ev = "SELF-MERGED", f"merge {m[:10]} '{subj}' by {mc[0]}, the commit's own author"
            else:
                v, ev = "MERGED-BY-OTHER-NO-REVIEW-RECORD", f"merge {m[:10]} '{subj}' by {mc[0]}; integration by another person, no approval recorded"
        else:
            v = "NO-EVIDENCE"
            ev = "no merge commit, no reviewer trailer"
            if ce == "noreply@github.com": ev += "; GitHub squash/web commit (committer GitHub does not name an approver)"
            elif canon(cn, ce) != a: ev += f"; committer {cn} differs from author (re-commit, not a review record)"
            if "Co-authored-by" in git("show", "-s", "--format=%B", h): ev += "; Co-authored-by is a contributor, not a reviewer"
    rows.append((h[:10], cd[:10], an, v, ev, git("show", "-s", "--format=%s", h).strip()))
rows.sort(key=lambda r: r[1])
print("Window: committer date >= 2025-03-01, through HEAD; paths:", PATHS)
print("Non-merge commits touching them:", len(rows))
for r in rows: print(" | ".join(r))
from collections import Counter
print("Counts:", dict(sorted(Counter(r[3] for r in rows).items())))
print("Before window, excluded:", git("log","--no-merges","--until=2025-02-28","--format=%h %s","--",*PATHS).strip().split("\n")[0])
