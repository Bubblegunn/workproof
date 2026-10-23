# Weekly update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **Fixed ESM named exports for `kleur/colors`** (8 Sep). Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure, fixed it, and added a regression test (`tests/esm-exports.mjs`).
- **Documented `NO_COLOR` handling** (9 Sep). Added `docs/no-color.md`.
- **Added test coverage for `FORCE_COLOR=0`** (11 Sep). New `tests/force-color.mjs` checks `FORCE_COLOR=0`, `=1` and unset, and confirms that `0` behaves like `NO_COLOR`.
- **Bumped dev dependencies** (12 Sep).

## Still open

- **Lazy color-escape table.** I tried it to reduce startup cost. It broke 3 of 14 tests because of enabled-state caching, so I judged it too risky and dropped it. Nothing from it was merged. If startup cost matters, it needs a different approach that handles that caching.
