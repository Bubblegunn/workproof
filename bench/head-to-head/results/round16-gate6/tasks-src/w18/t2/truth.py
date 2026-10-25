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

# ---- conventions (purpose: welcome message for "this year" = calendar 2026, reporting zone Asia/Tokyo) ----
# C1 year boundary: Asia/Tokyo is UTC+9 all year, so 2026 starts at 2025-12-31T15:00:00Z.
#    Why: the community reports in Tokyo time; Nadia's first commit (2026-01-01 00:20 +09:00) is 2025-12-31 in UTC
#    but New Year's in Tokyo, and Kenji's (2025-12-31 23:40 +09:00) is still 2025 in both.
Y0 = datetime.datetime(2025, 12, 31, 15, 0, tzinfo=UTC); NOW = datetime.datetime(2026, 10, 24, 23, 59, tzinfo=UTC)
# C2 "date of a contribution" = committer (landing) date. Why: Jonas's author date is 1980-01-01 (clock never set),
#    so the author date cannot place the work; the committer date is when it reached the repository.
#    A contribution = authored commit OR Co-authored-by credit in a non-merge commit (work landed under another name).
# C3 identity: same e-mail => same person (Zoe/Zoë, Chloé); same display name => same person (Elena's two addresses).
EMAIL = {"zoe@example.invalid": "Zoë Lindqvist", "chloe@example.invalid": "Chloé Martin",
         "elena@oldjob.example.invalid": "Elena Marchetti", "elena.marchetti@example.invalid": "Elena Marchetti"}
def who(n, e): return EMAIL.get(e.lower(), n)
# C4 bots are never welcomed.
JST = datetime.timezone(datetime.timedelta(hours=9))
first, in_year, desc = {}, {}, {}
for c in load():
    if c["merge"]: continue
    cr = [(who(c["an"], c["ae"]), isbot(c["an"], c["ae"]), "author")]
    cr += [(who(n, e), isbot(n, e), "co-author") for _, n, e in trailers(c["body"], ["co-authored-by"])]
    for p, bot, role in cr:
        if bot: continue
        if p not in first or c["cd"] < first[p][0]: first[p] = (c["cd"], c["subject"], role)
        if Y0 <= c["cd"] <= NOW: in_year.setdefault(p, []).append((c["cd"].astimezone(JST).date().isoformat(), role, c["subject"]))
new = sorted(p for p in in_year if first[p][0] >= Y0)
ret = sorted(p for p in in_year if first[p][0] < Y0)
print("(dates below are Tokyo local dates)")
print("YEAR 2026 in Asia/Tokyo = 2025-12-31T15:00Z .. 2026-10-24")
print("FIRST-CONTRIBUTION SHOUT-OUT (first ever landing is in 2026), %d:" % len(new))
for p in new:
    print("- %s | first: %s %s: %s" % (p, first[p][0].astimezone(JST).date(), first[p][2], first[p][1]))
    for it in in_year[p]: print("    ", it)
print("WELCOME BACK (contributed before 2026 and again in 2026), %d:" % len(ret))
for p in ret:
    print("- %s | first ever: %s (%s)" % (p, first[p][0].astimezone(JST).date(), first[p][2]))
    for it in in_year[p]: print("    ", it)
print("MUST NOT BE WELCOMED: renovate[bot] (bot)")
print("TRAPS: Nadia new only in Tokyo time; Kenji not new (2025-12-31 Tokyo); Rahul new via Co-authored-by only; Chloé not new (2025-08-14 co-author credit);")
print("       Jonas author date 1980 -> still new in 2026 by landing; Elena and Zoe/Zoë returning despite new address / spelling.")
