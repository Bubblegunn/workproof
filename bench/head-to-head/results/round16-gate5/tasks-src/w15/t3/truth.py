#!/usr/bin/env python3
"""t3 ground truth: contributors to lab/ in the frozen version (commit "Freeze for submission").

Conventions and why:
 * Scope = history reachable from the freeze commit, path lab/ only (root files are a forked
   third-party library). Everything after the freeze commit (Parquet writer, csv fix) is out.
 * Credit goes to the commit AUTHOR plus every "Co-authored-by" trailer (key matched
   case-insensitively; one is written in lower case) - squash merges hide co-authors there,
   and the committer of a squash merge is the GitHub merge identity, which did no work.
 * Identity = person name (Hamid Aziz appears under two e-mail addresses).
 * Reviewed-by / Signed-off-by are review or process, not authorship: thanks, not co-author.
 * Bot (dependabot) is not a person. The PI's merge commit is bookkeeping.
 * A change that was reverted and never re-landed (Jorge's streaming parser) is not in the frozen
   version: it is effort to thank for, not code of the release.
 * Size measure = lines added to lab/ by the PR (numstat), shared in full with each credited person;
   shown only to rank substance, not as a formula.
"""
import subprocess, sys, re, collections
d = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", d] + list(a), capture_output=True, text=True, check=True).stdout
freeze = git("log", "--format=%H", "--grep=^Freeze for submission$").split()[0]
rows = git("log", "--reverse", "--format=%H%x1f%an%x1f%ae%x1f%P%x1f%s%x1f%B%x1e", freeze).split("\x1e")
credit = collections.defaultdict(list); reviewers = set(); notes = []
reverted = set()
for r in rows:
    r = r.strip("\n")
    if not r: continue
    h, an, ae, parents, subj, body = r.split("\x1f")
    if len(parents.split()) > 1: notes.append("merge commit ignored: " + subj); continue
    ns = git("show", "--numstat", "--format=", h, "--", "lab").split()
    added = sum(int(ns[i]) for i in range(0, len(ns), 3) if ns[i].isdigit())
    if subj.startswith('Revert "'): reverted.add(re.search(r"\(#(\d+)\)", subj).group(1)); continue
    if "[bot]" in an: notes.append("bot ignored: " + an); continue
    if added == 0: continue
    people = [an] + re.findall(r"(?im)^co-authored-by:\s*(.+?)\s*<", body)
    for rv in re.findall(r"(?im)^reviewed-by:\s*(.+?)\s*<", body): reviewers.add(rv)
    pr = re.search(r"\(#(\d+)\)", subj)
    for p in people: credit[p].append((subj, added, pr.group(1) if pr else None, "author" if p == an else "co-author"))
print("freeze commit:", freeze[:7])
for p, items in sorted(credit.items()):
    live = [i for i in items if i[2] not in reverted]
    gone = [i for i in items if i[2] in reverted]
    print("%-14s in-frozen-version: %s | reverted-never-reinstated: %s" % (p, [(i[0], i[1], i[3]) for i in live], [(i[0], i[1]) for i in gone]))
print("reviewers only:", sorted(reviewers))
print("docs-only contributor (readme, outside lab/ code):", git("log", "--format=%an", "--grep=^docs:", freeze).strip().splitlines())
print("notes:", notes)
print("committer of squash merges: GitHub (not a contributor)")
