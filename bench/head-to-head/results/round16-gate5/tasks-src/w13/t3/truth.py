#!/usr/bin/env python3
"""t3 ground truth: who contributed most to the library in calendar 2025. usage: truth.py <fixture-dir>"""
import subprocess, sys, collections, fnmatch
from datetime import datetime, timezone
repo = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, errors="replace", check=True).stdout

# Convention 1 (identity): the repository ships a .mailmap; it is the project's own statement of who is who
# (Jordan has two addresses; "Samuel Okoye" is "Sam Okoye"). Resolve through git check-mailmap. Bots are not people.
_cache = {}
def person(name, mail):
    k = (name, mail)
    if k not in _cache:
        r = git("check-mailmap", "%s <%s>" % (name, mail)).strip()
        _cache[k] = r.split(" <")[0] if "[bot]" not in name else "bot"
    return _cache[k]
# Convention 2 (what counts): the person wants what people wrote. Vendored copies, build output and the generated
# lockfile are not written by anyone in the project, so they are excluded; a pure reformat commit is excluded too
# (it rewrites lines without authoring them).
EXCL = ("vendor/*", "dist/*", "npm-shrinkwrap.json")
def counted(path): return not any(fnmatch.fnmatch(path, p) for p in EXCL)
REFORMAT = git("log", "-1", "--format=%H", "--grep=^style: apply prettier").strip()
# Convention 3 (window): calendar 2025 in UTC (no zone was stated, UTC is the neutral default); author date.
LO = datetime(2025, 1, 1, tzinfo=timezone.utc); HI = datetime(2026, 1, 1, tzinfo=timezone.utc)
def inwin(d): return LO <= d.astimezone(timezone.utc) < HI
raw_commits = collections.Counter(); raw_lines = collections.Counter(); good_commits = collections.Counter()
for blk in git("log", "--no-merges", "--format=@@%H|%an|%ae|%aI", "--numstat").split("@@")[1:]:
    head, *rest = blk.strip().splitlines()
    h, an, ae, ad = head.split("|"); d = datetime.fromisoformat(ad)
    if not inwin(d): continue
    p = person(an, ae)
    raw_commits[p] += 1
    files = [l.split("\t") for l in rest if l.strip()]
    raw_lines[p] += sum(int(a) + int(b) for a, b, f in files if a != "-")
    if p != "bot" and h != REFORMAT and any(counted(f) for a, b, f in files):
        good_commits[p] += 1
print("2025 (UTC), as git counts it before any filter - commits:", dict(raw_commits))
print("2025 (UTC), lines added+deleted before any filter:", dict(raw_lines))
print("2025 (UTC), substantive commits (no bot, no reformat, touches at least one non-vendored/non-generated file):", dict(good_commits))
# surviving lines: blame at HEAD, reformat skipped, only counted files, only lines written in 2025
surv = collections.Counter()
for f in git("ls-tree", "-r", "--name-only", "HEAD").split("\n"):
    if not f or not counted(f) or f.endswith(".png"): continue  # binary files have no lines to attribute
    out = git("blame", "--line-porcelain", "--ignore-rev", REFORMAT, "HEAD", "--", f).split("\n")
    i = 0
    while i < len(out) - 1:
        info = {}; j = i + 1
        while not out[j].startswith("\t"):
            k, _, v = out[j].partition(" "); info[k] = v; j += 1
        d = datetime.fromtimestamp(int(info["author-time"]), timezone.utc)
        if inwin(d.replace(tzinfo=timezone.utc)):
            surv[person(info["author"], info["author-mail"].strip("<>"))] += 1
        i = j + 1
print("surviving lines at HEAD written in 2025 (reformat skipped, vendored/generated excluded):", dict(surv))
rank = sorted(surv, key=lambda k: -surv[k]); rc = sorted(good_commits, key=lambda k: -good_commits[k])
print("ranking by surviving lines:", [(k, surv[k]) for k in rank if k != "bot"])
print("ranking by substantive commits:", [(k, good_commits[k]) for k in rc])
# edge: Jordan's 2025-12-31T21:00-08:00 commit is 2026-01-01 05:00 UTC
loc = [l for l in git("log", "--format=%an|%aI|%s", "--grep=strip fast path").splitlines()]
print("edge commit:", loc, "-> counted in a local (-08:00) 2025, not in UTC 2025; Jordan would have 3 substantive commits and 75 lines, still not first")
print("outside the window: Jordan's 2026 commits (vendor update 1500 lines, benchmark) are not 2025 work")
print("verdict basis: raw lines/commits make Jordan look first (vendored copy 4000 + lockfile 2500 + dist 1200 + reformat); on what people wrote Sam Okoye is first by both measures, Jordan second by lines and last or tied by commits.")
