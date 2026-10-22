# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered

- **Alpha-channel hex colour support (shipped mid-July).** Hex colour strings that include an alpha channel are now supported. This was prompted by a customer report of washed-out colours. The full test suite passed (212 tests).
- **Alpha syntax documented (end of September).** The readme now describes the new alpha syntax, so users can find the feature.
- **Node 22 added to CI (mid-August).** Automated tests now also run on Node 22, which keeps us ahead of runtime upgrades.

## Attempted, not shipped

- **TypeScript types for level detection.** I added them in mid-September and reverted them about a week later (24 Sept). The work is not part of the current codebase and would need to be redone if we still want it.
- **Faster chained style lookups.** In early August I prototyped an optimisation that showed a 2x benchmark gain. I held it back before merging because the numbers looked suspicious. It is not in the codebase. It needs a re-check of the benchmark before any further work.

## Notes

- A v6 migration guide was drafted in early October. That is Q4 work and it is uncommitted, so it is not counted here.
- Sources: git history for the repo (5 commits in the quarter) and my exported Claude sessions. I left out a personal side project that appears in the sessions.
