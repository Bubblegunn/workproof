#!/usr/bin/env python3
"""Ground truth for t5: contributors Jan-Sep 2026 (UTC), split into new vs returning.

Conventions (and why):
* Period = [2026-01-01T00:00Z, 2026-10-01T00:00Z), judged on the UTC instant, so 2025-12-31 20:30 -0500 is IN
  and 2026-10-01 00:30 +0200 is IN.
* Effective commit date = min(author date, committer date): a commit cannot be authored after it was committed,
  so Pia's author date of 2027-03-04 (committed 2026-05-15) is a clock error and the commit belongs to May 2026.
  For rebased/applied commits the author date is earlier than the committer date and wins, as usual.
* Identity = one person per e-mail address compared case-insensitively (Sam.Rivera@Example.com == sam.rivera@...);
  Jordan Lee and Jordan Okafor share an address (a name change); tariq.aziz@example.net is folded into
  tariq@example.com because that commit's message says so.
* "New" = no commit under any of the person's identities with effective date before 2026-01-01. Everyone else
  active in the period is "returning". People active only before or only after the period are not counted.
* Merge commits and bots are excluded; counts are authored non-merge commits.
"""
import subprocess, sys, calendar, collections
repo = sys.argv[1]
ENV = {"GIT_CONFIG_GLOBAL": "/dev/null", "GIT_CONFIG_SYSTEM": "/dev/null", "TZ": "UTC", "LC_ALL": "C",
       "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"}
def git(*a): return subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, env=ENV, check=True).stdout
lo = calendar.timegm((2026, 1, 1, 0, 0, 0)); hi = calendar.timegm((2026, 10, 1, 0, 0, 0))
alias = {"tariq.aziz@example.net": "tariq@example.com"}
def key(e): e = e.lower(); return alias.get(e, e)
people = collections.defaultdict(lambda: {"names": [], "times": [], "subj": []})
for rec in git("log", "--no-merges", "--format=%an%x1f%ae%x1f%at%x1f%ct%x1f%s%x1e").split("\x1e"):
    rec = rec.strip("\n")
    if not rec: continue
    an, ae, at, ct, s = rec.split("\x1f")
    if an.endswith("[bot]"): continue
    p = people[key(ae)]
    if an not in p["names"]: p["names"].append(an)
    p["times"].append(min(int(at), int(ct))); p["subj"].append((min(int(at), int(ct)), s))
new, ret = [], []
for k, p in people.items():
    inwin = [s for t, s in p["subj"] if lo <= t < hi]
    if not inwin: continue
    nm = " / ".join(p["names"])
    (new if min(p["times"]) >= lo else ret).append((nm, len(inwin), inwin))
print("TASK t5 TRUTH (period 2026-01-01..2026-09-30 UTC; authored non-merge commits; bots excluded)")
for title, grp in (("NEW contributors", new), ("RETURNING contributors", ret)):
    print(f"{title}: {len(grp)}")
    for nm, n, subs in sorted(grp, key=lambda x: (-x[1], x[0])):
        print(f"  {nm}: {n} commits")
        for s in subs: print(f"      - {s}")
print(f"TOTAL distinct contributors: {len(new) + len(ret)}; total commits: {sum(n for _, n, _ in new + ret)}")
print("Not counted: Kofi Mensah (2025 and Oct 2026 only), Zed Hartmann (Oct 2026), bots")
