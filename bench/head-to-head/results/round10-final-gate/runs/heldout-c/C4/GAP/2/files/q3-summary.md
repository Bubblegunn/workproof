# Q3 2025 Summary (July–September)

**Ines Kowalski**, work on our chalk fork

## Delivered

- **Alpha-channel hex colour support (July).** Hex colour strings that include an alpha channel (e.g. 8-digit hex) are now supported. This came from a customer report of washed-out colours. The full test suite passed (212 tests) before the change was committed.
- **Node 22 in CI (August).** Added Node 22 to the CI test matrix, so we now test against the current Node release.
- **Documentation for the alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use it.

## Explored but not shipped

- **Performance of chained style lookups (August).** Prototyped an optimisation that showed about 2x on the chain benchmark. I held it back because the numbers looked suspicious, and it was not merged. It needs a re-check before any further work.
- **TypeScript types for level detection (September).** Added types, then reverted them a few days later. The work is not part of the current codebase.

## Summary

One user-facing feature shipped with its documentation, plus a CI coverage improvement. Two other efforts were deliberately stopped before release.
