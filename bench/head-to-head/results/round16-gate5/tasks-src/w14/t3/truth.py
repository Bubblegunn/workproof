#!/usr/bin/env python3
"""t3 ground truth: what was backed out between 'Release v0.0.21' and HEAD (so it must not be announced).

Conventions (and why):
- Window = first-parent commits in R..HEAD, where R is the commit titled 'Release v0.0.21'. A merged pull request is ONE unit
  (the merge commit, compared with its first parent), because the maintainers announce pull requests, and because a
  revert of the merge (-m 1) undoes the whole branch at once.
- Order is graph order, never commit date: one author clock is ahead, so an original is dated after its own revert.
- "Backed out" is decided from CONTENT, not from the message: unit Y backs out unit X when Y only touches files that X
  touched and, in each of them, Y's resulting blob equals the blob X started from. Revert trailers and titles are
  not needed (one back-out has no trailer, one trailer uses an abbreviated sha).
- A unit is announceable only if, at HEAD, the files it changed still differ from before it. A unit backed out and then
  re-landed with an identical patch (same `git patch-id`) stands.
- Partial back-out = only some of the files of a unit are restored; what remains is still shipped.
- A title that begins with 'Revert' proves nothing: it counts only if the content undoes an earlier unit.
"""
import subprocess, sys
repo = sys.argv[1]
def git(*a, inp=None):
    return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True, input=inp).stdout
R = [l.split()[0] for l in git("log", "--format=%H %s").splitlines() if l.split(" ", 1)[1] == "Release v0.0.21"][0]
units = git("rev-list", "--reverse", "--first-parent", f"{R}..HEAD").split()
def blob(rev, f):
    r = subprocess.run(["git", "-C", repo, "rev-parse", "--verify", "-q", f"{rev}:{f}"], capture_output=True, text=True)
    return r.stdout.strip() or None
def files(u):
    return set(git("diff", "--name-only", f"{u}^1", u).split())
def subj(u): return git("log", "-1", "--format=%s", u).strip()
def who(u):
    # for a merged pull request, the person is the author of the merged branch, not the merger
    has2 = len(git("log", "-1", "--format=%P", u).split()) > 1
    return git("log", "-1", "--format=%an", f"{u}^2" if has2 else u).strip()
def day(u): return git("log", "-1", "--format=%ad", "--date=short", u).strip()
def pid(u):
    p = git("diff", f"{u}^1", u)
    out = git("patch-id", "--stable", inp=p)
    return out.split()[0] if out else None
F = {u: files(u) for u in units}
backs = {}   # X -> list of (Y, partial?)
backout_units = set()
for i, y in enumerate(units):
    for x in [v for v in units[:i] if v not in backout_units]:
        if F[y] and F[y] <= F[x] and all(blob(y, f) == blob(f"{x}^1", f) and blob(f"{x}^1", f) != blob(x, f) for f in F[y]):
            backs.setdefault(x, []).append((y, F[y] != F[x]))
            backout_units.add(y)
pids = {u: pid(u) for u in units}
full, partial, relanded, kept, lookalike = [], [], [], [], []
for u in units:
    if u in backout_units:
        continue
    if u == units[0] and False: pass
    undone = {f for f in F[u] if blob("HEAD", f) == blob(f"{u}^1", f)}
    if u in backs and undone == F[u]:
        by = ", ".join(f"{y[:7]} ({subj(y)}; dated {day(y)})" for y, _ in backs[u])
        full.append(f"{u[:7]} {subj(u)}  [{who(u)}, dated {day(u)}]  backed out by {by}")
    elif u in backs and undone:
        by = ", ".join(f"{y[:7]} ({subj(y)})" for y, _ in backs[u])
        partial.append(f"{u[:7]} {subj(u)}  [{who(u)}]  files restored: {sorted(undone)}; still shipped: {sorted(F[u]-undone)}; by {by}")
    elif u in backs:
        later = [z for z in units[units.index(u)+1:] if z not in backout_units and pids[z] == pids[u]]
        relanded.append(f"{u[:7]} {subj(u)}  [{who(u)}]  backed out, then re-landed identically by {later[0][:7]} ({subj(later[0])}); net: SHIPPED, announce once")
        kept.append(None)
    elif subj(u).startswith("Revert"):
        lookalike.append(f"{u[:7]} {subj(u)}  [{who(u)}]  NOT a revert: it adds a new change, announce if user-visible")
    elif u != R:
        kept.append(f"{u[:7]} {subj(u)}  [{who(u)}]")
# the re-landing commit is the same patch: do not list it as a second change
reland_commits = {z for z in units if z not in backout_units and any(pids[z] == pids[x] and z != x for x in backs)}
print("RELEASE COMMIT", R[:7])
print(f"FULLY BACKED OUT, do not announce ({len(full)})")
for l in full: print("  ", l)
print(f"PARTLY BACKED OUT ({len(partial)})")
for l in partial: print("  ", l)
print(f"BACKED OUT THEN RE-LANDED, still ships ({len(relanded)})")
for l in relanded: print("  ", l)
print(f"TITLE SAYS REVERT BUT IT IS A NEW CHANGE ({len(lookalike)})")
for l in lookalike: print("  ", l)
print("OTHER CHANGES THAT STAND (not reverted)")
for l in kept:
    if l and not any(l.startswith(z[:7]) for z in reland_commits): print("  ", l)
