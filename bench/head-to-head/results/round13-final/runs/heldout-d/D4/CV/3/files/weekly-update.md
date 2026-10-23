# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fixed for `kleur/colors`** (8 Sep). Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. The exports map is corrected, and a regression test (`tests/esm-exports.mjs`) now covers it.
- **NO_COLOR handling documented** (9 Sep). New page `docs/no-color.md` describes how color output is disabled.
- **CI: Node 22 added to the test matrix** (10 Sep, Kenji Mori).
- **Test coverage for `FORCE_COLOR=0`** (11 Sep). New `tests/force-color.mjs` checks that `FORCE_COLOR=0` behaves like `NO_COLOR`. It also covers `FORCE_COLOR=1` and the unset case.
- **Dev dependencies bumped** (12 Sep). The change is recorded in `notes/deps-bump.md`.

## Still open

- Startup-cost optimization (lazy color escape table) was tried and abandoned. It broke 3 of 14 tests, so it was judged too risky and never merged. Nothing is pending, but it can be revisited with a safer approach if startup time matters.
