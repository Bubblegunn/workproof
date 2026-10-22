# Q3 2025 Summary (July–September) — Ines Kowalski

## Shipped

- **Hex colour strings with an alpha channel (July).** Added support for 8-digit hex colours such as `#ff000080`, fixing washed-out colours that a customer had reported. The full test suite passed (212 tests) before the change was committed.
- **Node 22 in CI (August).** Added Node 22 to the CI test matrix so we find compatibility problems with the new runtime early.
- **Documentation for alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use the feature.

## Explored, not shipped

- **Chained style lookup performance (August).** Prototyped an optimisation that benchmarked about 2x faster. I held it back before merging because the numbers looked off, and it is shelved until the results are verified.
- **TypeScript types for level detection (September).** Added the types, then reverted them a few days later. I'd welcome input on whether to revisit them.

## Summary

Three changes shipped: one user-facing feature, one CI improvement, and the docs for the feature. Two other pieces of work were deliberately held back or rolled back.
