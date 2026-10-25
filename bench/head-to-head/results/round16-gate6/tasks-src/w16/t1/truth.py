#!/usr/bin/env python3
"""t1 ground truth: per-person delivery for Q3 2026 in Pacific/Auckland. Usage: truth.py <fixture-dir>"""
import subprocess, sys, re
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

repo = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout

NZ = ZoneInfo("Pacific/Auckland")
# CONVENTION 1: the quarter is cut in the REPORTING time zone (Auckland), not UTC: the review is read there,
# and 2026-09-30T11:30Z is already 1 October in NZDT (+13, DST began 2026-09-27).
START = datetime(2026, 7, 1, tzinfo=NZ); END = datetime(2026, 10, 1, tzinfo=NZ)
# CONVENTION 2: "delivered" = landed on main -> COMMITTER date is primary (a rebased commit authored 24 June but
# landed 9 July is July delivery). Author-date variant is printed as the defensible alternative.
# CONVENTION 3: identities merged by .mailmap (git --use-mailmap) and then by identical display name
# (Ana Ruiz used a third address that .mailmap does not list).
# CONVENTION 4: bots excluded (name ends [bot] or contains the word Bot); merge commits are not delivery
# (the merge only joins other people's commits, which are counted under their authors).
# CONVENTION 5: generated files (.gitattributes linguist-generated) excluded from line counts; lines = added/deleted.
gen_pat = [l.split()[0] for l in open(f"{repo}/.gitattributes") if "linguist-generated" in l and not l.startswith("#")]
def generated(p): return any(p.startswith(g.rstrip("*")) for g in gen_pat)

SEP = "\x1e"
out = git("log", "--use-mailmap", "--no-merges", f"--format={SEP}%H|%aN|%aE|%aI|%cI|%s", "--numstat")
rows = []
for blk in out.split(SEP)[1:]:
    head, *stats = blk.strip("\n").split("\n")
    h, an, ae, ad, cd, subj = head.split("|", 5)
    add = dele = 0; skipped = 0
    for s in stats:
        if not s.strip(): continue
        a, d, p = s.split("\t", 2)
        if generated(p) or a == "-": skipped += (int(a) if a != "-" else 0) + (int(d) if d != "-" else 0); continue
        add += int(a); dele += int(d)
    rows.append(dict(h=h[:7], name=an, email=ae, ad=datetime.fromisoformat(ad), cd=datetime.fromisoformat(cd), subj=subj, add=add, dele=dele, gen=skipped))
def is_bot(n): return n.endswith("[bot]") or re.search(r"\bbot\b", n, re.I) is not None

def report(label, key):
    print(f"== {label}")
    people = {}
    for r in rows:
        if not (START <= r[key].astimezone(NZ) < END): continue
        if is_bot(r["name"]): print(f"  (bot excluded) {r['name']}: {r['subj']}"); continue
        p = people.setdefault(r["name"].casefold(), dict(name=r["name"], c=0, a=0, d=0, gen=0, subjects=[], emails=set()))
        p["c"] += 1; p["a"] += r["add"]; p["d"] += r["dele"]; p["gen"] += r["gen"]; p["subjects"].append(r["subj"]); p["emails"].add(r["email"])
    for p in sorted(people.values(), key=lambda x: x["name"]):
        print(f"  {p['name']}: commits={p['c']} added={p['a']} deleted={p['d']} (generated lines excluded: {p['gen']})")
        for s in p["subjects"]: print(f"      - {s}")
    print(f"  total commits={sum(p['c'] for p in people.values())} added={sum(p['a'] for p in people.values())} deleted={sum(p['d'] for p in people.values())}")
report("PRIMARY: landing (committer) date, Auckland quarter", "cd")
report("ALTERNATE (defensible if stated): author date, Auckland quarter", "ad")
print("== boundary facts")
for r in rows:
    if r["subj"] in ("Add Turkish transliteration table", "Add normalise option", "Fix off-by-one in counter", "Support custom separators"):
        print(f"  {r['subj']}: author {r['ad'].astimezone(NZ).isoformat()} committer {r['cd'].astimezone(NZ).isoformat()} UTC-author {r['ad'].astimezone(timezone.utc).isoformat()}")
