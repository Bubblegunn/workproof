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

# ---- conventions (purpose: per-person table for the third quarter of 2026 in US Pacific time) ----
# C1 quarter = 2026-07-01 00:00 PDT .. 2026-09-30 23:59:59 PDT = 2026-07-01T07:00Z .. 2026-10-01T07:00Z (Pacific is UTC-7 in summer).
#    Why: the reporting zone is stated. Dmitri's commit (2026-06-30 17:30 -0700) is 1 July in UTC but still Q2 in Pacific time;
#    Lucas's (2026-09-30 23:30 -0700) is 1 October in UTC but still Q3 in Pacific time.
Q0 = datetime.datetime(2026, 7, 1, 7, 0, tzinfo=UTC); Q1 = datetime.datetime(2026, 10, 1, 7, 0, tzinfo=UTC)
# C2 date of a commit = committer (landing) date. Why: Beatriz wrote her patch on 2026-06-20 and the maintainer applied it on
#    2026-07-08; it reached the project in Q3. (Defensible alternative: author date, stated; then Beatriz falls out and Dmitri...
#    stays out as well. Either way the stated convention must be applied to everyone.)
# C3 a commit counts for its AUTHOR (never the committer: Ewa applied Beatriz's and Roberto's patches, GitHub web-flow
#    committed Jun's and Sana's PRs). Co-authored-by trailers are counted in a separate column. Signed-off-by is the author again.
#    Reviewed-by / Reported-by are not work that landed; they are listed as notes, not counted.
# C4 merge commits (Sana's merge of master into her branch, the maintainer's PR merge) are not contributions.
# C5 identity: Jun's home address is tied to the work address by the repository's .mailmap; Sana's two addresses share a display name.
EMAIL = {"jun@work.example.invalid": "Jun Takeda", "jun.takeda@home.example.invalid": "Jun Takeda"}
def who(n, e): return EMAIL.get(e.lower(), n)
# C6 bots: names ending in [bot] or -bot. "Roberto Botelho" is a human.
def bot(n, e): return isbot(n, e) or n.lower().endswith("-bot")
rows = {}
for c in load():
    if c["merge"] or not (Q0 <= c["cd"] < Q1): continue
    cr = [(c["an"], c["ae"], "a")] + [(n, e, "co") for _, n, e in trailers(c["body"], ["co-authored-by"])]
    for n, e, k in cr:
        if bot(n, e): continue
        r = rows.setdefault(who(n, e), {"a": 0, "co": 0, "ids": set(), "what": []})
        r[k] += 1; r["ids"].add("%s <%s>" % (n, e)); r["what"].append("%s: %s" % ("authored" if k == "a" else "co-authored", c["subject"]))
print("QUARTER 2026-07-01T07:00Z (= 00:00 PDT) .. 2026-10-01T07:00Z; commit date = committer date")
print("person | authored commits | co-authored credits | identities | work")
for p in sorted(rows):
    r = rows[p]
    print("%s | %d | %d | %s | %s" % (p, r["a"], r["co"], "; ".join(sorted(r["ids"])), " / ".join(r["what"])))
print("NOT ROWS: dependabot[bot], cjson-ci-bot (bots); GitHub (committer only); Dmitri Volkov (his only commit is 30 June 17:30 PDT = Q2)")
print("NOTES ONLY (reported/reviewed, not counted): Hugo Lemaire (Reported-by on the print_number fix), Sana Iqbal (Reviewed-by on it)")
print("NOT COUNTED: 2 merge commits (one authored by Sana)")
