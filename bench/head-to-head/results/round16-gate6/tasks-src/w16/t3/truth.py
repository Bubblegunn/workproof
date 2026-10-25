#!/usr/bin/env python3
"""t3 ground truth: who joined / left the project between Q2 2026 and Q3 2026. Usage: truth.py <fixture-dir>"""
import subprocess, sys, re
from datetime import datetime, timezone
repo = sys.argv[1]
def git(*a): return subprocess.run(["git", "-C", repo, *a], check=True, capture_output=True, text=True).stdout
U = timezone.utc
Q2 = (datetime(2026, 4, 1, tzinfo=U), datetime(2026, 7, 1, tzinfo=U)); Q3 = (datetime(2026, 7, 1, tzinfo=U), datetime(2026, 10, 1, tzinfo=U))
# CONVENTION 1: a person is an identity by DISPLAY NAME, not e-mail: Iris Moreau and Mei Tanaka changed address in Q3
# (left an old employer's domain). Counting e-mails would report Mei as one leaver plus one joiner. No .mailmap exists.
# CONVENTION 2: bots are not people: dependabot[bot]'s first commit in Q3 is not a joiner.
# CONVENTION 3: "active" = authored at least one non-merge commit in the quarter (author date, UTC).
# CONVENTION 4: "joined" = active in Q3 and NEVER authored anything before Q3 under any address (whole history, including
# the pre-2025 upstream history). "Returning" = active in Q3, authored earlier, nothing in Q2: not a new joiner.
# CONVENTION 5: "left" = active in Q2, not active in Q3. Evidence of later activity (after 2026-09-30) is reported next to it
# because a person who commits again in October has paused, not left. Co-authored-by trailers are not authorship: people who
# only appear in trailers are reported separately (participated, never authored).
SEP = "\x1e"
out = git("log", "--no-merges", f"--format={SEP}%aN|%aE|%aI|%B")
people = {}; trailers = {}
for blk in out.split(SEP)[1:]:
    head, _, body = blk.partition("\n")
    n, e, d, first = head.split("|", 3)
    d = datetime.fromisoformat(d)
    if n.endswith("[bot]"):
        people.setdefault("BOT:" + n, []).append(d); continue
    people.setdefault(n.casefold(), []).append(d)
    if not (Q3[0] <= d < Q3[1]): continue
    for m in re.finditer(r"^Co-authored-by:\s*(.+?)\s*<", blk, re.M):
        trailers.setdefault(m.group(1).casefold(), []).append(d)
def act(ds, q): return any(q[0] <= x < q[1] for x in ds)
real = {k: v for k, v in people.items() if not k.startswith("BOT:")}
names = {}
for blk in out.split(SEP)[1:]:
    n = blk.split("|", 1)[0]; names[n.casefold()] = n
print("Q2 2026 active:", sorted(names[k] for k, v in real.items() if act(v, Q2)))
print("Q3 2026 active:", sorted(names[k] for k, v in real.items() if act(v, Q3)))
print("JOINED in Q3 (first ever authored commit in Q3):", sorted(names[k] for k, v in real.items() if act(v, Q3) and min(v) >= Q3[0]))
print("RETURNING in Q3 (older commits, none in Q2):", sorted(names[k] for k, v in real.items() if act(v, Q3) and min(v) < Q3[0] and not act(v, Q2)))
left = [k for k, v in real.items() if act(v, Q2) and not act(v, Q3)]
print("LEFT / inactive in Q3 (active in Q2):")
for k in sorted(left):
    later = [x for x in real[k] if x >= Q3[1]]
    print("  ", names[k], "last commit", max(real[k]).date(), "| active again after Q3:", bool(later))
print("CONTINUING (active in both):", sorted(names[k] for k, v in real.items() if act(v, Q2) and act(v, Q3)))
print("CO-AUTHOR ONLY in Q3 (trailer, never authored):", sorted(k.title() for k in trailers if k not in real))
print("BOTS (not people):", sorted(k[4:] for k in people if k.startswith("BOT:")))
print("NOT joiners although new addresses appear in Q3: Iris Moreau (iris.moreau@example.com), Mei Tanaka (mei.tanaka@example.com)")
