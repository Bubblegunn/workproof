# Q3 2025 Summary (July–September) — Ines Kowalski

## Delivered
- **Hex colour strings with an alpha channel (July 15).** Added support for 8-digit hex colours (e.g. `#ff000080`) in our chalk fork, in response to a customer report of washed-out colours. The full test suite passed (212 tests).
- **Node 22 in CI (August 12).** Added a CI workflow so the library is tested on Node 22.
- **Documentation for alpha syntax (September 30).** Documented the new alpha colour syntax in the readme so users can discover the feature.

## Explored, not shipped
- **TypeScript types for level detection (September 18–24).** Wrote and merged type definitions, then reverted them a few days later. Net effect on the codebase this quarter is none; the work may be revisited.
- **Chained style lookup performance (August 4).** Prototyped an optimisation that benchmarked about 2x faster on the chain benchmark. I held it back before merging because the numbers looked off, and it is not in the codebase.

## Notes
- Commits by Ines in the quarter: 5, covering one feature, one CI change, one docs change, and one add/revert pair.
- Work outside Q3 is excluded: a v6 migration guide draft (October 2, uncommitted).
