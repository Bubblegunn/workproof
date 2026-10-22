# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (15 Jul).** Added support for 8-digit hex colours such as `#ff000080`. This fixed washed-out colours that a customer had reported. The full test suite passed (212 tests).
- **Node 22 in CI (12 Aug).** Added a CI workflow that runs the project on Node 22, so we find compatibility problems early.
- **Documentation for the alpha syntax (30 Sep).** Updated the readme so users can find and use the new alpha colour support.

## Explored but not shipped

- **Faster chained style lookups (4 Aug).** I prototyped a change that benchmarked about 2x faster. I stopped it before merging because the numbers looked off, and I stashed it. It needs a re-check before it goes any further.
- **TypeScript types for level detection (18–24 Sep).** I implemented the types and tests passed. I reverted them on 24 Sep, so they are not in the codebase. I can add the reason for the revert if you want it in the doc.

## Notes

- There were 5 commits in the quarter. 3 are net deliverables, and the types commit and its revert cancel each other out.
- Work on a v6 migration guide began on 2 Oct, so it falls in Q4. It is uncommitted.
