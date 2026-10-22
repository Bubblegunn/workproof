# Q3 2025 Summary (July–September)

**Ines Kowalski**

## Delivered

- **Hex colour strings with an alpha channel (July).** Added support for hex colour values that include transparency (e.g. 8-digit hex). This fixed a customer-reported problem where colours rendered washed out. Tests passed in full before merge.
- **Node 22 in CI (August).** Added Node 22 to the automated test matrix, so we now verify the library against the newest Node release.
- **Documentation for the alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use the feature.

## Explored but not shipped

- **Chained style lookup performance (August).** Prototyped an optimisation that benchmarked about 2x faster. I held it back before merging because the numbers looked suspicious, and it still needs re-validation.
- **TypeScript types for level detection (September).** Added type definitions, then reverted them a few days later. This is not part of the current release.

## Notes

- Work was in the team's fork of the library. All shipped items are in the main branch history.
- A v6 migration guide was started in early October. That falls in Q4, so it is not counted here.
