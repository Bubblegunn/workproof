# Weekly Update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **Fixed ESM named exports for `kleur/colors`** (8 Sep). Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure, added the missing exports-map entry, and added a regression test. The test passes locally.
- **Documented `NO_COLOR` handling** (9 Sep). The docs now describe how the library behaves when `NO_COLOR` is set.
- **Added tests for `FORCE_COLOR=0`** (11 Sep). The new tests cover `FORCE_COLOR=0`, `FORCE_COLOR=1` and unset, and confirm that `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Bumped dev dependencies** (12 Sep).

## Investigated, not shipped

- **Lazy color escape table** (10 Sep). I tried this to cut startup cost. It broke 3 of 14 tests because of enabled-state caching, so we judged it too risky and dropped it. Nothing from this attempt was merged.

## Open

- No open items from this week's work.
