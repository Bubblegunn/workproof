# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (July).** Added support for hex colour values that include transparency (for example, 8-digit hex). A customer had reported washed-out colours, and this fixes that. The full test suite passed before the change was committed.
- **Node 22 in CI (August).** Added Node 22 to the automated test matrix, so we now catch compatibility problems on the newest runtime.
- **Documentation for the alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use the feature.

## Investigated, not shipped

- **Faster chained style lookups (August).** Prototyped a performance optimisation. An early benchmark looked promising, but I held it back before merging because the numbers looked suspect. It needs more validation before it goes in.
- **TypeScript types for level detection (September).** Added type definitions, then reverted them about a week later. The types are not in the codebase and the work would need to be redone.

## Themes

- Customer-driven fix with accompanying documentation (alpha channel).
- Maintaining build and runtime compatibility (Node 22).
- Caution on quality: held back or rolled back two changes that weren't ready.
