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

# ---- conventions (purpose: credit people for what they wrote since the 1.0.25 release, split into code / docs / tests) ----
# C1 window = commits AFTER the release commit in history (R..HEAD), not a date filter.
#    Why: dates lie. Anya wrote her patch on 2026-01-15 (before the release date) but it landed after the release;
#    Tariq's overflow fix landed BEFORE the release but carries an author date of 2026-02-01 (clock ahead).
R = git("log", "--format=%H", "--grep=^Release 1.0.25$", "HEAD").split()[0]
rng = [c for c in load(R + "..HEAD") if not c["merge"]]
# C2 what counts as the person's own writing:
#    - paths under vendor/ or generated files (an "@generated" marker in the first line) earn no code credit (vendored/generated, not written by them);
#    - a whitespace-only commit (git diff -w is empty) is mechanical formatting, not authorship of the code it touches;
#    - a .rs change in which every changed line is a /// or //! doc comment is documentation, whatever the path;
#    - tests/ => tests; *.md / docs/ => docs; remaining src/, build.rs, Cargo.toml => code.
# C3 Co-authored-by trailers share the commit's classification; bots are not credited.
def first_line(sha, path):
    try: return git("show", "%s:%s" % (sha, path)).split("\n")[0]
    except Exception: return ""
def classify(c):
    fs = files(c["sha"])
    if git("diff", "-w", "--stat", c["sha"] + "~1", c["sha"]).strip() == "" and fs:
        return {"mechanical-format"}
    out = set()
    for f in fs:
        if f.startswith("vendor/") or "@generated" in first_line(c["sha"], f):
            out.add("vendored-or-generated"); continue
        if f.startswith("tests/"): out.add("tests"); continue
        if f.endswith(".md") or f.startswith("docs/"): out.add("docs"); continue
        if f.endswith(".rs"):
            ch = [l for l in git("show", "-U0", "--format=", c["sha"], "--", f).split("\n")
                  if l and l[0] in "+-" and not l.startswith(("+++", "---"))]
            if ch and all(re.match(r"^[+-]\s*//[/!]", l) for l in ch): out.add("docs"); continue
        out.add("code")
    return out
res = {}
for c in rng:
    kinds = classify(c)
    cr = [(c["an"], c["ae"], "author")] + [(n, e, "co-author") for _, n, e in trailers(c["body"], ["co-authored-by"])]
    for n, e, role in cr:
        if isbot(n, e): continue
        res.setdefault(n, []).append((c["cd"].date().isoformat(), c["subject"], role, "+".join(sorted(kinds))))
print("WINDOW: commits after 'Release 1.0.25' in history (%d non-merge commits); dates are not used" % len(rng))
credit = {}
for n, items in res.items():
    ks = sorted({k for it in items for k in it[3].split("+")} & {"code", "docs", "tests"})
    credit[n] = ks
print("CREDIT BY AREA:")
for n in sorted(res):
    print("- %s | credited areas: %s" % (n, ", ".join(credit[n]) or "none (see notes)"))
    for it in res[n]: print("    %s %s: %s  -> %s" % (it[0], it[2], it[1], it[3]))
print("NOT IN WINDOW: Kai Nakamura (before release), Tariq Aziz's 'Fix overflow in prerelease parsing' (landed before the release; author date 2026-02-01 is a wrong clock)")
print("NO CODE CREDIT: Tomas Rey (vendored tables only), Lena Fischer (whitespace-only reformat; at most 'formatting'), github-actions[bot]")
