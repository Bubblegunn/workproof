#!/usr/bin/env python3
"""t2 ground truth: Q3 2026 (UTC calendar quarter) effort split feature / fix / maintenance. Usage: truth.py <fixture-dir>"""
import subprocess, sys
from datetime import datetime, timezone
repo = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
START = datetime(2026, 7, 1, tzinfo=timezone.utc); END = datetime(2026, 10, 1, tzinfo=timezone.utc)
# CONVENTION 1: class comes from what the change DOES (executives want real effort), not from the message prefix.
# Two prefixes lie: "fix: add dumps_many helper" is a new public helper (feature); "chore: handle None payload" is a bug fix.
# Maintenance = docs, CI/test-matrix, README, refactors with no behaviour change, dependency/tooling upkeep.
CLASS = {
 "feat: add max_age to URLSafeSerializer.loads": "feature",
 "Add support for key rotation": "feature",
 "fix: add dumps_many helper for batches": "feature",
 "Fix signature timing comparison": "fix",
 "chore: handle None payload": "fix",
 "Update README badges": "maintenance",
 "Refactor legacy signer into smaller pieces": "maintenance",
 "docs: document key rotation": "maintenance",
 "Fix loads() raising the wrong exception type": "fix",
 "Add Python 3.14 to the test matrix": "maintenance",
 "feat: configurable salt length": "feature",
}
# CONVENTION 2: measured in lines changed (added + deleted), which is the effort proxy an executive summary can use; commit counts printed as an alternative.
# CONVENTION 3: excluded from the headline split and listed separately:
#   - reformat-only commit (verified: empty diff under `git diff -w --ignore-blank-lines`)
#   - vendored code (third_party/)
#   - a reverted change and its revert (net effect zero; counting both would inflate "feature" by 100 lines)
#   - bot commits (dependabot, pre-commit-ci): upkeep not done by the team, shown separately
#   - merge commits (carry no work of their own)
SEP = "\x1e"
out = git("log", "--no-merges", f"--format={SEP}%H|%aN|%aI|%s", "--numstat")
rows = []
for blk in out.split(SEP)[1:]:
    head, *st = blk.strip("\n").split("\n")
    h, n, d, s = head.split("|", 3)
    num = lambda v: 0 if v == "-" else int(v)
    ent = [x.split("\t", 2) for x in st if x.strip()]
    lines = sum(num(a) + num(b) for a, b, p in ent if not p.startswith("third_party/"))
    vend = sum(num(a) + num(b) for a, b, p in ent if p.startswith("third_party/"))
    rows.append(dict(h=h, name=n, date=datetime.fromisoformat(d), subj=s, lines=lines, vend=vend))
tot = {"feature": [0, 0], "fix": [0, 0], "maintenance": [0, 0]}
excl = []; bots = []
for r in rows:
    if not (START <= r["date"] < END): continue
    s = r["subj"]
    if r["name"].endswith("[bot]"): bots.append((r["name"], s, r["lines"])); continue
    if s.startswith("style: apply formatter"):
        assert git("diff", "-w", "--ignore-blank-lines", "--stat", r["h"] + "^", r["h"]).strip() == ""
        excl.append(("reformat-only", s, r["lines"])); continue
    if s.startswith("Vendor "): excl.append(("vendored", s, r["vend"])); continue
    if s == "Add experimental msgpack serializer" or s.startswith("Revert "): excl.append(("reverted pair", s, r["lines"])); continue
    c = CLASS[s]; tot[c][0] += r["lines"]; tot[c][1] += 1
L = sum(v[0] for v in tot.values()); C = sum(v[1] for v in tot.values())
print("HEADLINE (human, lines added+deleted, Q3 2026 UTC)")
for k, v in tot.items(): print(f"  {k}: lines={v[0]} ({100*v[0]/L:.1f}%)  commits={v[1]} ({100*v[1]/C:.1f}%)")
print(f"  total lines={L} commits={C}")
print("EXCLUDED FROM SPLIT (must be mentioned, with size)")
for e in excl: print("  ", e)
print("BOTS (listed separately)")
for b in bots: print("  ", b)
print("OUTSIDE WINDOW (must not appear): 'Fix stale cache key' (2026-06-29), 'feat: add after-quarter helper' (2026-10-02)")
