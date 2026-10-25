#!/usr/bin/env python3
"""t5 ground truth: lines of own code added per person, 2025-11-01 .. 2026-10-24.

Conventions and why (purpose: a funder's data-management report on code the team wrote):
 * Window by AUTHOR date, UTC, from 2025-11-01 (Mia's legacy rules of June 2025 are before it).
 * Unit = lines added (git numstat) in files that are the team's own code. Lines added, not
   added+deleted: churn from reformatting is not effort.
 * Excluded paths, each for a reason the person stated or implied:
   - vendored: vendor/** (declared linguist-vendored in .gitattributes) - third-party code
   - generated: docs/_generated/** (linguist-generated in .gitattributes) and lab/gen/schema_pb2.py
     (not declared anywhere, but its first line says "Generated ... DO NOT EDIT")
   - data: data/** (csv, png, README of the dataset); binary files show '-' in numstat
   - lock files: *.lock (machine-resolved pins)
 * Excluded commits: the formatter commit "style: apply black" (every line rewritten, no new logic),
   pure renames (numstat shows 0 added), bot commits (dependabot).
 * Tests count as own code. Documentation text (README.rst) is shown in a separate column.
 * Identity = author name: Mia Rossi uses two e-mail addresses.
 * The shared lab PC identity "lab-pc-3" cannot be tied to one person by git; commit messages carry
   initials (PV, QY) but that is a convention of the messages, not an identity: reported separately.
"""
import subprocess, sys, collections, fnmatch
d = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", d] + list(a), capture_output=True, text=True, check=True).stdout
log = git("log", "--since=2025-11-01T00:00:00Z", "--until=2026-10-24T23:59:59Z", "--no-merges", "--format=%H%x1f%an%x1f%s").splitlines()
EXC = ["vendor/*", "docs/_generated/*", "data/*", "*.lock"]
code = collections.Counter(); docs = collections.Counter(); excluded = collections.Counter(); why = []
shared = collections.Counter(); shared_commits = 0; initials = collections.Counter()
for l in log:
    h, an, subj = l.split("\x1f")
    if "[bot]" in an: why.append("bot commit: " + subj); continue
    if subj.startswith("style:"): why.append("formatter commit: " + subj); continue
    ns = git("show", "--numstat", "--format=", h).splitlines()
    for r in ns:
        a, dl, p = r.split("\t")
        if a == "-": excluded["binary/data"] += 0; continue
        a = int(a)
        if any(fnmatch.fnmatch(p, g) for g in EXC): excluded[p.split("/")[0] if "/" in p else p] += a; continue
        head = git("show", "%s:%s" % (h, p)).splitlines()[:1] if "=>" not in p else []
        if head and ("DO NOT EDIT" in head[0] or head[0].startswith("# Generated")): excluded["generated header: " + p] += a; continue
        if "=>" in p and a == 0: continue
        if p.endswith(".rst") or p.endswith(".md"): docs[an.lower()] += a; continue
        if an == "lab-pc-3":
            import re
            shared[an] += a; m = re.search(r"\((\w\w)\)$", subj); initials[m.group(1) if m else '?'] += a
        else: code[an] += a
print("own code, lines added per person:")
for k, v in code.most_common(): print("  %-12s %4d   docs lines: %d" % (k, v, docs.get(k.lower(), 0)))
print("docs-only people:", {k: v for k, v in docs.items() if k.title() not in code})
print("shared account lab-pc-3 (not attributable):", sum(shared.values()), "lines; initials in messages:", dict(initials))
print("excluded line counts:", dict(excluded))
print("excluded commits:", why)
