#!/usr/bin/env python3
import subprocess, sys, re
from datetime import datetime
D = sys.argv[1]; P = "config/policy.toml"
def git(*a):
    return subprocess.run(["git", "-C", D, *a], capture_output=True, text=True, check=True).stdout
# Purpose: find settings that were weakened/removed then restored, or strengthened/added then removed, by comparing the
# VALUE of each key across the file's history (key-level), because message wording ("revert") is unreliable both ways.
# Convention 1: a "back-out" is a commit after which a key has a value it already had earlier in the file's history (different
#   from the value just before the commit); "absent" counts as a value only for keys that were absent when the file was created.
# Convention 2: durations are measured between author dates of the two commits (history shows when a commit was recorded,
#   not when the setting took effect in production).
# Convention 3: strength: require_review/mfa true is stronger, allow_unsigned false is stronger, a lower max_age_days is stronger.
# Convention 4: window starts 2025-03-01 (the file was created after that, so the whole file history is in scope).
def parse(txt):
    sec, d = "", {}
    for l in txt.splitlines():
        l = l.strip()
        if not l or l.startswith("#"): continue
        m = re.match(r"\[(.+)\]$", l)
        if m: sec = m.group(1); continue
        k, _, v = l.partition("=")
        d[f"{sec}.{k.strip()}"] = v.strip()
    return d
def weaker(k, old, new):
    if old is None or new is None:  # presence of a control = stronger
        return new is None
    if k.endswith("max_age_days"): return int(new) > int(old)
    safe = "false" if k.endswith("allow_unsigned") else "true"
    return old == safe and new != safe
shas = git("log", "--reverse", "--no-merges", "--format=%H", "--", P).split()
hist = {}; prev = None; seen = {}; events = []; first = True
allkeys = set()
for h in shas:
    cur = parse(git("show", f"{h}:{P}"))
    allkeys |= set(cur)
    info = git("show", "-s", "--format=%an%x1f%aI%x1f%s", h).strip().split("\x1f")
    if first:
        for k in cur: seen[k] = [cur[k]]
        prev = cur; first = False; base = set(cur); continue
    for k in sorted(set(cur) | set(prev)):
        o, n = prev.get(k), cur.get(k)
        if o == n: continue
        if k not in seen: seen[k] = [None]   # key absent when the file was created
        back = n in seen[k]
        events.append((h, info, k, o, n, back, weaker(k, o, n)))
        seen[k].append(n)
    prev = cur
print("Key-level changes in", P, "(commit | author | date | key old->new | direction | back-out?)")
for h, (an, ai, s), k, o, n, back, wk in events:
    print(f"{h[:10]} | {an} | {ai[:10]} | {k} {o}->{n} | {'WEAKER' if wk else 'STRONGER'} | {'BACK-OUT of earlier value' if back else 'new value'} | msg: {s}")
print()
by_sha = {e[0]: e for e in events}
def d(a, b): return (datetime.fromisoformat(b) - datetime.fromisoformat(a)).days
def when(h): return git("show", "-s", "--format=%aI", h).strip()
ev = {(e[2], e[0][:10]): e for e in events}
# durations: pair each change away from a state with the next change of the same key
print("Durations (days between recorded commits):")
bykey = {}
for e in events: bykey.setdefault(e[2], []).append(e)
for k, es in bykey.items():
    for i, e in enumerate(es[:-1]):
        nxt = es[i+1]
        print(f"  {k}: state {e[4]} from {e[0][:10]} ({e[1][1][:10]}) to {nxt[0][:10]} ({nxt[1][1][:10]}): {d(e[1][1], nxt[1][1])} days")
    last = es[-1]; print(f"  {k}: state {last[4]} from {last[0][:10]} ({last[1][1][:10]}) to HEAD (still in force at HEAD)")
print()
print("Commits since 2025-03-01 whose message contains 'revert' (case-insensitive; two upstream 2023-24 reverts are before the window):")
for l in git("log", "--no-merges", "-i", "--since=2025-03-01", "--grep=revert", "--format=%h | %an | %aI | %s").strip().splitlines(): print("  " + l)
print("Of these, NOT a value back-out of policy.toml: the comment-wording commit (comments only, no key changed) and the README revert (different file).")
print("Back-outs that never use the word revert: the max_age_days 30->90 commit, the [signing] removal, and the final mfa false->true commit.")
print("Cannot be shown by history: whether the setting was enforced by anything outside this file; force-pushed or squashed intermediate states; real-world time the config was deployed.")
