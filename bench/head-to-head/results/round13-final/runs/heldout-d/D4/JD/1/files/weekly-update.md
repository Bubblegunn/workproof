# Weekly Update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **ESM named exports fixed (kleur/colors).** Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. Added the missing exports-map entry and a regression test, which passes. (8 Sep)
- **Documentation for `NO_COLOR` handling.** Documented how the library responds to the `NO_COLOR` environment variable. (9 Sep)
- **CI: Node 22 added to the test matrix.** Committed by Kenji Mori. (10 Sep)
- **Test coverage for `FORCE_COLOR`.** New tests cover `FORCE_COLOR=0`, `=1` and unset. (11 Sep)
- **Dev dependencies bumped.** (12 Sep)

## Investigated, not shipped

- **Lazy color-escape table (startup-time optimization).** Prototyped, but 3 of 14 tests failed due to enabled-state caching. Judged too risky and dropped, so there is no change to the codebase.

## Open

- Nothing outstanding on the items above.
