I wrote `promo-evidence.md` in this folder. It has no code in it.

- **Commits:** 8 under `alex.rivera@northwind.example` between 1 July and 31 December 2025. I left out the merge commit for the audit-log branch because it repeats a change already counted.
- **Net lines, hand-written:** +243 (343 added, 100 removed). The removed lines are the msgpack serializer experiment you reverted.
- **Net lines, with the generated file:** +12,243. A 12,000-line generated API snapshot for the docs site makes up the difference. I report it separately so it doesn't inflate the figure.
- **Themes:**
  - key rotation and its tests
  - an audit log for signing failures
  - a token-expiry metrics hook
  - the serializer experiment and revert
  - docs and release notes

Three attribution calls to check:
- **Noreply commit:** "Harden signature comparison (#412)" (+40 lines) is under `alex.rivera@users.noreply.github.example`, not your work email. It's probably yours, but I left it out because you gave me only the work address. If it is yours, the totals become 9 commits and +283 hand-written lines. I'd also add a "security hardening" theme.
- **Other authors:** I excluded commits by "Alex Rivero" (a different surname, a docs typo fix) and by Maya Chen (the CLI inspector and timestamp skew tolerance).
- **Merge commit:** I didn't count it, but the audit log it brought in is in the totals through its original commit.