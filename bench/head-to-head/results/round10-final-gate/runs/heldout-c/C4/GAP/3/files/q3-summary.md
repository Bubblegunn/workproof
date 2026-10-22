# Q3 2025 Summary (July–September) — Ines Kowalski

## Delivered
- **Hex colour strings with alpha channel (July 15).** Added support for hex colour values that include an alpha channel (e.g. 8-digit hex), fixing washed-out colours that a customer had reported. The full test suite passed (212 tests).
- **Node 22 in CI (August 12).** Added Node 22 to the CI test matrix so we're validated against the current runtime.
- **Documentation for alpha syntax (September 30).** Documented the new alpha-channel syntax in the readme so users can discover and use the feature.

## Explored, not shipped
- **Chained style lookup performance (August 4).** Prototyped a speedup (about 2x on the chain benchmark). I held off merging because the numbers looked suspicious, and the work is stashed pending re-verification.
- **TypeScript types for level detection (September 18–24).** Added type definitions, then reverted them a few days later, so there's no net change in the codebase.

## Summary
Net shipped in Q3: one user-facing feature (alpha hex support) driven by a customer report, one CI improvement, and the docs to go with the feature. Two other efforts (performance, TypeScript types) were deliberately not landed, and could be picked up next quarter.
