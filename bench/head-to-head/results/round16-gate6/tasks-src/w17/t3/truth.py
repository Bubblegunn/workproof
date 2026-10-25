#!/usr/bin/env python3
import subprocess, sys
D = sys.argv[1]
def git(*a):
    return subprocess.run(["git", "-C", D, *a], capture_output=True, text=True, check=True).stdout
# Approved list from the prompt. Compare e-mail case-insensitively (domains are case-insensitive and local parts
# are case-insensitive in practice at every mainstream host), so Lena@Example.COM is the approved Lena.
APPROVED = {"sofia@example.com": "Sofia Alvarez", "s.alvarez@example.org": "Sofia Alvarez",
            "omar@example.com": "Omar Haddad", "lena@example.com": "Lena Fischer"}
NAMES = set(APPROVED.values())
def ident_status(name, email):
    e = email.lower()
    if e in APPROVED and APPROVED[e] == name: return "ok"
    if e == "noreply@github.com" and name == "GitHub": return "ok"                  # accepted: web-merge committer
    if name == "dependabot[bot]" and e.endswith("@users.noreply.github.com"): return "ok"  # accepted bot, GitHub-issued address
    if name in NAMES: return "NAME-MATCHES-APPROVED-BUT-ADDRESS-UNKNOWN"
    if name == "dependabot[bot]": return "BOT-NAME-WITHOUT-GITHUB-ADDRESS"
    return "UNLISTED-PERSON"
# Window: committer date >= 2025-01-01 (landed since). Every commit in the repo after the pin is in range anyway.
# Merge commits are included: their author/committer identities are identities that acted on the repository.
# Co-authored-by trailers are NOT commit identities; they are reported separately as unverified mentions.
fmt = "%H%x1f%an%x1f%ae%x1f%cn%x1f%ce%x1f%cI%x1f%s%x1f%b"
flag = []; ok = 0; trailers = []
for rec in git("log", "--since=2025-01-01T00:00:00+00:00", "--format=" + fmt + "%x1e").split("\x1e"):
    rec = rec.strip("\n")
    if not rec: continue
    h, an, ae, cn, ce, cd, s, body = rec.split("\x1f")
    sa, sc = ident_status(an, ae), ident_status(cn, ce)
    for line in body.splitlines():
        if line.lower().startswith("co-authored-by:"): trailers.append((h[:10], s, line))
    if sa == "ok" and sc == "ok": ok += 1; continue
    r = []
    if sa != "ok": r.append(f"author {an} <{ae}>: {sa}")
    if sc != "ok": r.append(f"committer {cn} <{ce}>: {sc}")
    flag.append((h[:10], cd[:10], s, "; ".join(r)))
print("Commits since 2025-01-01:", ok + len(flag), " fully approved:", ok, " flagged:", len(flag))
for f in sorted(flag, key=lambda x: x[1]): print(" | ".join(f))
print("Co-authored-by mentions (not identities, unverified):")
for t in trailers: print("  ", *t)
print("Cannot be explained by history alone: every flagged commit; history shows the identity, never whether the person behind it was authorised.")
print("Plausibly explained but unproven: merge d526442 brought Priya's commit in (merged by approved Omar via GitHub); Kai Brandt re-committed Lena's commit.")
