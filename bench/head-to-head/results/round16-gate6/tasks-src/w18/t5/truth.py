#!/usr/bin/env python3
# truth.py <fixture-dir> : ground truth from plain git, python3 stdlib only
import subprocess, sys, os, re, datetime
repo = sys.argv[1]
UTC = datetime.timezone.utc
def git(*a):
    r = subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True,
                       env={"PATH": os.environ["PATH"], "LC_ALL": "C", "GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null"})
    return r.stdout.decode("utf-8")
def dt(s):
    return datetime.datetime.fromisoformat(s).astimezone(UTC)
def load(*rev_args):
    """All commits reachable per rev_args (default HEAD), oldest first, topological. Dict per commit."""
    fmt = "%x1e%H%x1f%P%x1f%an%x1f%ae%x1f%aI%x1f%cn%x1f%ce%x1f%cI%x1f%B"
    out = git("log", "--reverse", "--topo-order", "--no-mailmap", "--format=" + fmt, *(rev_args or ["HEAD"]))
    res = []
    for rec in out.split("\x1e")[1:]:
        h, p, an, ae, ad, cn, ce, cd, body = rec.split("\x1f", 8)
        res.append(dict(sha=h, parents=p.split(), an=an, ae=ae, ad=dt(ad), cn=cn, ce=ce, cd=dt(cd),
                        subject=body.strip().split("\n")[0], body=body.strip(),
                        merge=len(p.split()) > 1))
    return res
def files(sha):
    return [l for l in git("diff-tree", "-r", "--root", "--no-commit-id", "--name-only", sha).split("\n") if l]
def trailers(body, keys):
    out = []
    for m in re.finditer(r"^(%s):\s*(.+?)\s*<([^>]*)>\s*$" % "|".join(keys), body, re.I | re.M):
        out.append((m.group(1).lower(), m.group(2), m.group(3)))
    return out
def isbot(name, email):
    return name.endswith("[bot]") or "[bot]@" in email

# ---- conventions (purpose: a thank-you for work that LANDED between 2026-06-01 and today, 2026-10-24) ----
# C1 window by landing (committer) date, UTC: 2026-06-01 .. 2026-10-24. Gwen Akhtar's 2026-05-28 commit is outside.
W0 = datetime.datetime(2026, 6, 1, tzinfo=UTC); W1 = datetime.datetime(2026, 10, 24, 23, 59, 59, tzinfo=UTC)
# C2 a commit that was reverted ("This reverts commit <sha>") and never re-applied by the same sha is NOT landed work.
#    A reland is a new commit; credit then comes from its own author and Co-authored-by trailers.
#    Why: a thank-you for "what landed" must not thank Lucía for AIX support that is not in the code, and must not drop Kofi
#    whose fix was relanded under the maintainer's name with a trailer. (Defensible alternative: thank Lucía for the
#    attempt, clearly labelled as not merged. She must not be listed as having shipped work.)
# C3 credit = author + Co-authored-by trailers (any capitalisation); Signed-off-by is the author again; the maintainer's
#    own name repeated as a trailer counts once. Reviewed-by / Tested-by / Reported-by are not authored work -> notes only.
# C4 identity: same e-mail => same person (Pedro Alves / palves). Bots (names ending in [bot]) are never thanked.
# C5 revert commits themselves are not a contribution (they only undo one).
EMAIL = {"pedro@example.invalid": "Pedro Alves"}
def who(n, e): return EMAIL.get(e.lower(), n)
allc = load()
reverted = set()
for c in allc:
    for m in re.finditer(r"This reverts commit ([0-9a-f]{40})", c["body"]): reverted.add(m.group(1))
rows, attempts, notes = {}, {}, {}
for c in allc:
    if c["merge"] or not (W0 <= c["cd"] <= W1): continue
    if c["subject"].startswith('Revert "'): continue
    cr = [(c["an"], c["ae"], "author")] + [(n, e, "co-author") for _, n, e in trailers(c["body"], ["co-authored-by"])]
    seen = set()
    for n, e, role in cr:
        p = who(n, e)
        if isbot(n, e) or p in seen: continue
        seen.add(p)
        if c["sha"] in reverted:
            attempts.setdefault(p, []).append("%s %s (reverted, not landed): %s" % (c["cd"].date(), role, c["subject"]))
        else:
            rows.setdefault(p, []).append("%s %s: %s" % (c["cd"].date(), role, c["subject"]))
    for k, n, e in trailers(c["body"], ["reviewed-by", "tested-by", "reported-by"]):
        notes.setdefault(who(n, e), []).append("%s on '%s'" % (k, c["subject"]))
print("WINDOW landing date 2026-06-01 .. 2026-10-24 (UTC)")
print("THANK (work landed):")
for p in sorted(rows):
    print("- %s" % p)
    for x in rows[p]: print("    " + x)
print("NOT LANDED (reverted, never re-applied by them): %s" % "; ".join("%s -> %s" % (p, v) for p, v in sorted(attempts.items())))
print("   (Kofi Mensah's original was reverted but is credited through the reland trailer; Lucía Fernández has no landed work.)")
print("REVIEW/TEST/REPORT ONLY (no authored work; may get a separate 'thanks for reviewing/testing', not a code credit): %s" % ", ".join(sorted(notes)))
print("NEVER THANKED: dependabot[bot], copilot-swe-agent[bot]")
print("OUTSIDE WINDOW: Gwen Akhtar")
