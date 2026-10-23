I've written `promo-evidence.md` in this folder. It has no code in it.

- **Commits:** 9 under alex.rivera@northwind.example for 1 July to 31 December 2025. That is 8 substantive commits plus 1 merge commit.
- **Net lines:** +243 hand-written (343 added, 100 removed).
- **Themes:** key rotation and its tests, an audit log for signing failures, a token-expiry metrics hook, a serializer experiment that was tried and reverted, and the docs-site snapshot and release notes.

Four judgement calls change the numbers, so check them before you hand it over:
1. **Generated file:** I left out a 12,000-line generated API snapshot you imported, because it isn't authored work. Including it makes the net +12,243. The file says this openly.
2. **Merge commit:** I left it out of the line counts, because it repeats the lines from the audit-log commit it merged.
3. **No-reply commit:** "Harden signature comparison" (October, +40 lines) is under a GitHub no-reply address, so it isn't in the totals. If it's yours, the totals become 10 commits and +283. The file mentions this as a note.
4. **Typo-fix commit:** "Fix typos in docs" is under alex.rivero@, not alex.rivera@. It looks like a different person, so I excluded it.

The CLI inspector and the timestamp skew tolerance work belong to a colleague, so they aren't counted.