# Weekly update: 8–12 September 2025

## Delivered

- **ESM named exports fixed for `kleur/colors`** (8 Sep). `import { red } from 'kleur/colors'` failed under native ESM. I reproduced it, added an exports map entry and a regression test. The test passes locally. This was needed ahead of the client's Friday release.
- **`NO_COLOR` handling documented** (9 Sep).
- **Test coverage for `FORCE_COLOR`** (11 Sep). New tests cover `FORCE_COLOR=0`, `=1` and unset, confirming `0` behaves like `NO_COLOR`.
- **Dev dependencies bumped** (12 Sep).
- **Node 22 added to the CI matrix** (10 Sep, by Kenji Mori).

## Evaluated, not shipped

- Making the color escape table lazy, to cut startup cost. It broke 3 of 14 tests because of enabled-state caching. The change was too risky, so I dropped it. No change to the released behavior.

## Still open

- Nothing is blocking. The lazy-table startup optimization could be revisited later, but it would need a different approach to enabled-state caching.
