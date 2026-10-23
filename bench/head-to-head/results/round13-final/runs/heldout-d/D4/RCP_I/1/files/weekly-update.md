# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fixed for `kleur/colors`** (Mon 8 Sep). Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure, fixed it, and added a regression test (`tests/esm-exports.mjs`).
- **NO_COLOR handling documented** (Tue 9 Sep). New `docs/no-color.md` describes how the library behaves when `NO_COLOR` is set.
- **FORCE_COLOR test coverage** (Thu 11 Sep). New `tests/force-color.mjs` checks that `FORCE_COLOR=0` behaves like `NO_COLOR`. It also covers `FORCE_COLOR=1` and the unset case.
- **Dev dependency bump notes** (Fri 12 Sep). I recorded the dev dependency bump in `notes/deps-bump.md`.

## Evaluated, not pursued

- **Lazy color escape table** (startup-cost experiment). A prototype made 3 of 14 tests fail because of enabled-state caching. I judged it too risky and dropped it. Nothing from it was merged.

## Still open

- Nothing is blocked. If startup cost is still a priority, the lazy-table idea would need a redesign of how the enabled state is cached before it is worth retrying.
