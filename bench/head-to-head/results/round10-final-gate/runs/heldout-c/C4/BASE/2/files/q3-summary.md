# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered
- **Hex colour strings with an alpha channel (July).** The library now accepts hex colours that include transparency, such as `#ff000080`. A customer had reported washed-out colours, and this addresses that. The full test suite passed (212 tests).
- **Node 22 in CI (August).** Added Node 22 to the automated test matrix so we find compatibility problems with the new runtime early.
- **Documentation for the alpha syntax (September).** Added usage notes to the readme so users can find and use the new alpha support.

## Explored but not shipped
- **TypeScript types for level detection (September).** Wrote and tested the types, then reverted them within a week (Sep 18 to Sep 24). Nothing from this is in the codebase, so it isn't a Q3 deliverable.
- **Faster chained style lookups (August).** Prototyped a change that benchmarked about 2x faster. I held it back before merging because the numbers looked off, and it is not in the codebase. It needs a re-measurement before it can count as a result.

## Notes
- The readme commit is timestamped 23:45 on Sep 30 in my local timezone (Oct 1 in UTC), so I've counted it in Q3.
- Work after Sep 30 is left out. That includes a draft v6 migration guide, started Oct 2 and not committed.
- Total: 4 commits that stayed in the codebase, plus 1 that was reverted.
