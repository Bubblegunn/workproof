# Weekly update: 8–12 September 2025

## Delivered

- **ESM named exports for `kleur/colors` fixed (8 Sep).** Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. The fix is committed and includes a regression test, `tests/esm-exports.mjs`, which passes locally.
- **NO_COLOR handling documented (9 Sep).** Added `docs/no-color.md`.
- **FORCE_COLOR=0 test coverage (11 Sep).** Added `tests/force-color.mjs`. It covers `FORCE_COLOR=0`, `FORCE_COLOR=1` and unset, and checks that `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Dev dependencies bumped (12 Sep).**

## Open

- The ESM fix has only been verified locally. It still needs to be confirmed in a staging environment.
