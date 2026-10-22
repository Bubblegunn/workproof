# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered

- **Alpha-channel hex color support (July).** Added support for hex color strings that include an alpha channel (e.g. 8-digit hex). This was prompted by a customer report of washed-out colours. The full test suite passed (212 tests).
- **Node 22 in CI (August).** Added Node 22 to the CI test matrix so the library is verified on the current Node release.
- **Documentation for alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can discover and use the feature.

## Explored but not shipped

- **TypeScript types for color level detection (September).** Implemented and then reverted within a few days, so it is not part of the released code. It remains open work.
- **Faster chained style lookups (August).** Prototyped a performance improvement. The benchmark numbers looked off on review, so I held it back instead of merging it. It still needs re-validation.

## Notes

- Five commits landed in the quarter: three delivered items, plus one addition and its revert.
- A v6 migration guide was drafted in early October, so it falls in Q4.
