# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (July).** Added support for 8-digit hex colours such as `#ff000080`. This fixed washed-out colours that a customer had reported. The full test suite passed (212 tests).
- **Node 22 in CI (August).** Added Node 22 to the CI test matrix so we find compatibility problems with the new runtime early.
- **Documentation for alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use the feature.

## Explored, not shipped

- **Chained style lookup performance (August).** Tried an optimisation that benchmarked about 2x faster. I held it back before merging because the numbers looked off, and it is stashed pending a closer look.
- **TypeScript types for level detection (September).** Added the types, then reverted them a few days later. The work is not in the codebase.

## Notes

- The commit history for the quarter has 5 commits, 3 of them with lasting effect: the alpha feature, the CI change and the readme update.
- Left out on purpose: a personal side project, and a v6 migration guide draft from early October (outside the quarter and not committed).
