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

# ---- conventions (purpose: a thank-you page for the last 12 months, today = 2026-10-24) ----
# C1 window: "contributed in the last year" = work that LANDED (committer date, UTC) in 2025-10-24..2026-10-24.
#    Why: a contributor whose patch waited for review must not be dropped because the maintainer was slow;
#    the author date (2025-10-10 for Marcus) is when it was written, not when users received it.
#    (Defensible alternative: author date, stated. Then Marcus's first item falls out but his Feb 2026 test stays.)
START = datetime.datetime(2025, 10, 24, tzinfo=UTC); END = datetime.datetime(2026, 10, 24, 23, 59, 59, tzinfo=UTC)
# C2 identity: same person when the e-mail is the same, or a .mailmap line / noreply handle ties them.
#    Evidence: marcus@example.com (two display names), liwei@example.com (name order swapped),
#    12345678+priyar@users.noreply.github.com -> Priya Raman by the repository's own .mailmap.
EMAIL = {"marcus@example.com": "Marcus Oyelaran", "liwei@example.com": "Li Wei",
         "priya@example.com": "Priya Raman", "12345678+priyar@users.noreply.github.com": "Priya Raman"}
def who(name, email):
    return EMAIL.get(email.lower(), name)
# C3 bots are never thanked (name or e-mail carries [bot]); "Abbott Reyes" is a human despite the letters.
# C4 credit goes to the AUTHOR and to Co-authored-by trailers (work landed under someone else's name);
#    the committer (maintainer / GitHub web) is not credited for others' work. Merge commits carry no work.
def cat(f):
    if f.startswith("tests/"): return "tests"
    if f.startswith("docs/") or f.endswith((".rst", ".md")): return "docs"
    if f.startswith("src/"): return "code"
    return "maintenance"
people = {}
def add(p, c, role):
    people.setdefault(p, []).append((c, role))
outside = {}
for c in load():
    if c["merge"] or c["cd"] < datetime.datetime(2025, 1, 1, tzinfo=UTC): continue  # 2024 and earlier is the upstream history, not part of the synthetic year
    inwin = START <= c["cd"] <= END
    cats = sorted({cat(f) for f in files(c["sha"])})
    credited = [(who(c["an"], c["ae"]), "author", isbot(c["an"], c["ae"]))]
    for _, n, e in trailers(c["body"], ["co-authored-by"]):
        credited.append((who(n, e), "co-author", isbot(n, e)))
    for p, role, bot in credited:
        if bot: continue
        item = (c["cd"].date().isoformat(), c["ad"].date().isoformat(), c["subject"], role, "+".join(cats))
        (people if inwin else outside).setdefault(p, []).append(item)
print("WINDOW landing date 2025-10-24 .. 2026-10-24 (UTC)")
print("HUMANS IN WINDOW (%d):" % len(people))
for p in sorted(people):
    allcats = sorted({x for it in people[p] for x in it[4].split("+")} - {"maintenance"})
    print("- %s | areas: %s" % (p, ", ".join(allcats) or "maintenance only"))
    for it in people[p]:
        print("    landed %s (authored %s) %s: %s [%s]" % (it[0], it[1], it[3], it[2], it[4]))
print("HUMANS ONLY OUTSIDE WINDOW (must not be listed): %s" % ", ".join(sorted(set(outside) - set(people))))
bots = sorted({c["an"] for c in load() if isbot(c["an"], c["ae"]) and c["cd"] >= START})
print("BOTS IN WINDOW (never thanked): %s" % ", ".join(bots))
print("NOT BOTS despite name: Abbott Reyes")
print("MERGE COMMITS ignored: %d" % sum(1 for c in load() if c["merge"] and c["cd"] >= START))
