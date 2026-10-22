# Q3 2025 Summary (July–September): Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (July).** Added support for 8-digit hex colours such as `#ff000080`. A customer had reported washed-out colours, and this fixes that. The full test suite passed (212 tests) before the change was committed.
- **Node 22 in CI (August).** Added Node 22 to the CI matrix so the library is tested on the current Node release.
- **Documentation for the alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use the feature.

## Attempted, not shipped

- **TypeScript types for level detection (September).** I added the types, and tests passed. I reverted them on Sep 24, less than a week later, so nothing from this work is live.

## Not included

- A chained-style lookup performance experiment (August) was stashed and not merged. My first benchmark numbers looked off, so I'm not claiming any speedup.
- A v6 migration guide was drafted on Oct 2. That is outside Q3, and it is not committed yet.

## Summary

Three changes shipped this quarter: alpha-channel hex colour support, Node 22 CI coverage, and the readme documentation for the alpha syntax. One further piece of work, the TypeScript types, was reverted.
