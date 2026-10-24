#!/usr/bin/env python3
"""Ground truth for t2: lines of hand-written Go code contributed per person in calendar 2026.

Conventions (and why):
* Metric = lines added / lines deleted in hand-written .go files, from `git show --numstat -M`.
  -M (rename detection) because a pure rename must not count as the renamer writing the file again.
* Excluded as not authored work: bots (dependabot); anything under vendor/ (third-party copy);
  generated files (first lines contain "Code generated ... DO NOT EDIT"); non-.go files (go.sum, go.mod,
  vendor/modules.txt); commits whose diff is empty under `git diff -w` (mechanical re-indent, no code change).
* A commit and the explicit revert of it ("This reverts commit X") cancel: neither side is credited,
  because the reverted code does not exist in the product (credit would be inflated on one side and the
  deletion would be wrongly credited as 'work' on the other).
* Window: author date in 2026 (all dates here are far from the edges); the 2025-12-18 commit is outside.
* Identity: one person per e-mail address (no aliases in this fixture).
"""
import subprocess, sys, collections, re, calendar
repo = sys.argv[1]
ENV = {"GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null", "TZ": "UTC", "LC_ALL": "C",
       "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"}
def git(*a, check=True):
    r = subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, env=ENV)
    if check and r.returncode: raise SystemExit(r.stderr)
    return r
lo = calendar.timegm((2026, 1, 1, 0, 0, 0)); hi = calendar.timegm((2027, 1, 1, 0, 0, 0))
log = git("log", "--no-merges", "--format=%H%x1f%an%x1f%ae%x1f%at%x1f%s%x1f%B%x1e").stdout.split("\x1e")
commits = []
for rec in log:
    rec = rec.strip("\n")
    if not rec: continue
    h, an, ae, at, s, body = rec.split("\x1f")
    commits.append((h, an, ae, int(at), s, body))
reverted = set(); revert_commits = set()
for h, an, ae, at, s, body in commits:
    m = re.search(r"This reverts commit ([0-9a-f]{40})", body)
    if m: reverted.add(m.group(1)); revert_commits.add(h)
def is_generated(commit, path):
    r = git("show", f"{commit}:{path}", check=False)
    return r.returncode == 0 and any("Code generated" in l and "DO NOT EDIT" in l for l in r.stdout.splitlines()[:5])
add = collections.Counter(); dele = collections.Counter(); notes = []
for h, an, ae, at, s, body in commits:
    if not (lo <= at < hi): notes.append(f"outside window: {an}: {s}"); continue
    if an.endswith("[bot]"): notes.append(f"bot: {an}: {s}"); continue
    if h in reverted or h in revert_commits: notes.append(f"reverted pair: {an}: {s}"); continue
    if git("diff", "-w", "--quiet", f"{h}^", h, check=False).returncode == 0:
        notes.append(f"mechanical (empty under -w): {an}: {s}"); continue
    for line in git("show", "--numstat", "--format=", "-M", h).stdout.splitlines():
        a, d, p = line.split("\t")
        if a == "-": continue
        if "=>" in p:
            p = re.sub(r"\{[^}]* => ([^}]*)\}", r"\1", p) if "{" in p else p.split(" => ")[1]
        if not p.endswith(".go") or p.startswith("vendor/") or is_generated(h, p):
            notes.append(f"file excluded: {an}: {p} (+{a}/-{d})"); continue
        add[ae] += int(a); dele[ae] += int(d)
names = {}
for h, an, ae, *_ in commits: names[ae] = an
print("TASK t2 TRUTH (hand-written .go lines in calendar 2026: added / deleted)")
for ae in sorted(add, key=lambda k: -add[k]):
    print(f"{names[ae]}: +{add[ae]} / -{dele[ae]}")
print(f"TOTAL: +{sum(add.values())} / -{sum(dele.values())}")
print("Excluded and why:")
for n in notes: print("  " + n)
