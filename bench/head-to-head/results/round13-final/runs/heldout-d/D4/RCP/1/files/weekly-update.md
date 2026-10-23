# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fix for `kleur/colors`** (8 Sep): Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. This is fixed, and a regression test (`tests/esm-exports.mjs`) now covers it.
- **NO_COLOR documentation** (9 Sep): Added `docs/no-color.md`, which describes how the library handles the `NO_COLOR` environment variable.
- **FORCE_COLOR=0 test coverage** (11 Sep): Added `tests/force-color.mjs`. It checks that `FORCE_COLOR=0`, `FORCE_COLOR=1` and an unset variable behave as expected, with `FORCE_COLOR=0` acting like `NO_COLOR`.
- **Dev dependency updates** (12 Sep): Bumped development dependencies and recorded the changes in `notes/deps-bump.md`.

## Evaluated, not adopted

- **Lazy color escape table** (10 Sep): Tried this to reduce startup cost. 3 of 14 tests failed because of enabled-state caching, so the change was judged too risky and dropped. The code was not kept.

## Open / next

- Nothing blocking.
- If startup cost is still a goal, the lazy-table idea could be revisited with the enabled-state caching issue solved first.
