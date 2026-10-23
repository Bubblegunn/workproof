# Weekly update: 8–12 September 2025

## Delivered

- **ESM named exports for `kleur/colors` (8 Sep).** Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. This is fixed, and a regression test (`tests/esm-exports.mjs`) now guards it.
- **NO_COLOR documentation (9 Sep).** Added `docs/no-color.md`, which describes how the library handles `NO_COLOR`.
- **FORCE_COLOR=0 test coverage (11 Sep).** Added `tests/force-color.mjs`. It checks that `FORCE_COLOR=0` behaves like `NO_COLOR`, and it also covers `FORCE_COLOR=1` and the unset case.
- **Dev dependency bump (12 Sep).** Development dependencies updated.

## Open

- Nothing is blocking. No open items are recorded in the git history or session logs for this week.
