# Weekly update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **Fix: ESM named exports for `kleur/colors`** (8 Sep). Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure, fixed it, and added a regression test (`tests/esm-exports.mjs`). The test passes locally.
- **Docs: `NO_COLOR` handling** (9 Sep). Added `docs/no-color.md`, which describes how the library handles the `NO_COLOR` environment variable.
- **Test: `FORCE_COLOR=0`** (11 Sep). Added `tests/force-color.mjs`. It checks that `FORCE_COLOR=0` behaves like `NO_COLOR`, and also covers `FORCE_COLOR=1` and the unset case.
- **Chore: dev dependency bump** (12 Sep). Updated dev dependencies and recorded the changes in `notes/deps-bump.md`.

## Investigated, not shipped

- I tried making the color escape table lazy to cut startup cost. It broke 3 of 14 tests because of enabled-state caching, so I judged it too risky and dropped it. Nothing from it is in the codebase.

## Open

- Confirm the ESM fix works in the downstream staging check.
- Revisit startup-cost reduction later, using an approach that does not cache the enabled state.
