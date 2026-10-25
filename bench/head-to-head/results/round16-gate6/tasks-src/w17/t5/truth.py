#!/usr/bin/env python3
import subprocess, sys, re
from collections import Counter, defaultdict
D = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", D, *a], capture_output=True, text=True, check=True).stdout
# Purpose: "who is responsible for the code that is in the module today" => line ownership at HEAD (blame), not raw commit share.
# Convention 1: ownership = git blame with -w (ignore whitespace) and -M (moved lines), so the 4-space reindent commit and the
#   access/ -> authz/ rename (100% similarity) take no credit; blame follows the rename on its own.
# Convention 2: scope = authz/ at HEAD, excluding authz/vendor/ (vendored third-party) and *.generated.rb (bot-generated).
#   authz/permissions_test.rb is module code and is included.
# Convention 3: identity = .mailmap first (iris.moreau@example.net -> iris@example.com); then the same display name with two
#   addresses (Nora Kessler: nora@example.com / nora@example.org) is merged, since the repo has no .mailmap entry but the
#   name is identical; this is stated, not hidden.
# Convention 4: commit count = non-merge commits since 2025-07-01 touching access/ or authz/ (path history before the rename
#   included), attributed to the commit's author; the rename and reformat commits are counted as touches but listed as
#   excluded from line attribution; a Co-authored-by trailer is mentioned, not counted as authorship.
def canon(name, email):
    out = git("check-mailmap", f"{name} <{email}>").strip()
    n = out[:out.index("<")].strip()
    return n
files = [f for f in git("ls-tree", "-r", "--name-only", "HEAD", "authz").split()
         if f.endswith(".rb") and "/vendor/" not in f and not f.endswith(".generated.rb")]
lines = Counter()
for f in files:
    cur = None
    for l in git("blame", "-w", "-M", "--line-porcelain", "HEAD", "--", f).split("\n"):
        m = re.match(r"author (.*)$", l)
        if m: nm = m.group(1)
        m = re.match(r"author-mail <(.*)>$", l)
        if m: em = m.group(1)
        if l.startswith("\t"): lines[canon(nm, em)] += 1
print("Files in scope at HEAD:", ", ".join(files))
print("Lines owned at HEAD (blame -w -M):", dict(sorted(lines.items())), "total", sum(lines.values()))
commits = git("log", "--no-merges", "--since=2025-07-01T00:00:00+00:00", "--format=%h|%an|%ae|%aI|%s", "--", "access", "authz").strip().splitlines()
cnt = Counter(); 
print("Commits touching access/ or authz/ since 2025-07-01:", len(commits))
for l in commits:
    h, an, ae, ai, s = l.split("|")
    cnt[canon(an, ae)] += 1
    print("  ", h, ai[:10], canon(an, ae), "-", s)
print("Commit counts by person:", dict(sorted(cnt.items())))
print("Left out of line attribution:")
print("   Rename access->authz (Jonas Weber, 2025-09-15): 100% rename, no content change")
print("   Reindent to 4 spaces (Nora Kessler, 2025-10-06): whitespace only; blame -w gives the lines back to their writers")
print("   Vendor jwt helper (Nora Kessler, 2025-09-02): vendored third-party file, authz/vendor/")
print("   Regenerate authz schema (github-actions[bot], 2025-12-12): generated file")
print("   Add audit hook (#31): lines credited to the author Jonas Weber; Iris Moreau appears only as Co-authored-by")
print("Outside the module: Kofi Mensah's README commit (empty change to the module path set, not counted).")
print("Limits: blame shows who last changed each line, not who designed it or reviewed it.")
