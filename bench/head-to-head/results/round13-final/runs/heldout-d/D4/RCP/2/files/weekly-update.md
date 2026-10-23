# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports for `kleur/colors` (Mon 8 Sep):** Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. This is fixed, with a regression test (`tests/esm-exports.mjs`) that passes locally. It was needed ahead of the client's Friday release.
- **NO_COLOR documentation (Tue 9 Sep):** Added `docs/no-color.md`, which describes how `NO_COLOR` is handled.
- **FORCE_COLOR=0 test coverage (Thu 11 Sep):** Added `tests/force-color.mjs`. It covers `FORCE_COLOR=0`, `=1` and unset, and confirms that `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Dev dependency bump (Fri 12 Sep):** Updated dev dependencies and recorded the changes in `notes/deps-bump.md`.

## Investigated, not shipped

- **Lazy color escape table (10 Sep):** Tried this to reduce startup cost. It caused 3 of 14 tests to fail because of enabled-state caching, so we dropped it as too risky. Nothing was merged.

## Still open

- Nothing is blocking. The lazy-table startup optimisation could be revisited later with a different approach to enabled-state caching.
