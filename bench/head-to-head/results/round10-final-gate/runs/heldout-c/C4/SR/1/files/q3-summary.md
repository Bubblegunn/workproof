# Q3 2025 Summary (July–September) — Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (mid-July).** Added support for 8-digit hex colours (e.g. a red with 50% opacity), addressing a customer-reported problem with washed-out colours. Implemented as a new, self-contained module; the full test suite passed (212 tests).
- **Node 22 in CI (August).** Added Node 22 to the continuous-integration matrix so the library is verified against the new runtime.
- **Documentation for alpha syntax (end of September).** Documented the new alpha-channel hex syntax in the readme so users can discover the feature.

## Explored but not shipped

- **Faster chained style lookups (early August).** Prototyped an optimisation that benchmarked about 2x faster, but I held it back before merging because the numbers looked suspicious. It is stashed pending a re-check of the benchmark.
- **TypeScript types for level detection (September).** Implemented and tested, committed on Sept 19, then reverted on Sept 24. Net effect on the codebase for the quarter: none.

## Summary

Three changes shipped: one user-facing feature (with its documentation) and one CI improvement. Two other efforts were deliberately not shipped: a performance change pending validation and a typings change that was rolled back.
