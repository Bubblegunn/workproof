# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered
- **Hex colour strings with an alpha channel (July 15).** The library now accepts hex colours that include transparency, such as 8-digit values. This fixed washed-out colours that a customer had reported. The test suite passed in full (212 tests) before the change went in.
- **Node 22 in CI (August 12).** Added Node 22 to the automated test matrix, so we now catch compatibility problems on the newest runtime.
- **Documentation for the alpha syntax (September 30).** Added readme documentation for the new alpha colour syntax so users can find and use it.

## Explored but not shipped
- **Faster chained style lookups (August).** I prototyped an optimisation that measured about 2x faster on the chained-style benchmark. I held it back because the numbers looked off, and it was not merged. It needs a re-check of the benchmark before any further work.
- **TypeScript types for colour level detection (September).** I added the types, then reverted them within a week (Sept 19 added, Sept 24 reverted). They are not part of the current release.

## Notes
- Net result for the quarter: 3 changes in the codebase (1 feature, 1 CI improvement, 1 docs update), plus 2 pieces of exploratory work that were deliberately not shipped.
- A v6 migration guide draft was started in early October. That falls outside Q3 and is not committed, so I left it out.

---
*Sources: git history for July–September 2025 and Claude session exports. I left out personal side-project work and kept customer and environment details out because the repo is private.*
