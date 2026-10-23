# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fixed (8 Sep).** `import { red } from 'kleur/colors'` failed under native ESM. I reproduced it, added the missing exports-map entry, and added a regression test. The test passes.
- **NO_COLOR handling documented (9 Sep).** The docs now describe how `NO_COLOR` is handled.
- **FORCE_COLOR test coverage (11 Sep).** New tests cover `FORCE_COLOR=0`, `FORCE_COLOR=1` and unset. They confirm `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Dev dependencies bumped (12 Sep).**

## Investigated, not shipped

- **Lazy color escape table (10 Sep).** I tried this to reduce startup cost. It broke 3 of 14 tests because of enabled-state caching, so I judged it too risky and dropped it. No change was released.

## Open

- No blockers. If startup cost is still a priority, the lazy-table idea could be revisited with a safer approach to enabled-state caching.
