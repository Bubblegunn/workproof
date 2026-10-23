# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fixed (8 Sep).** `import { red } from 'kleur/colors'` failed under native ESM. Fixed with an exports-map entry and a regression test, which passes.
- **NO_COLOR handling documented (9 Sep).** Added `docs/no-color.md`.
- **Node 22 added to the CI matrix (10 Sep).** Delivered by Kenji Mori.
- **FORCE_COLOR test coverage (11 Sep).** New tests cover `FORCE_COLOR=0`, `=1` and unset, confirming `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Dev dependencies bumped (12 Sep).**

## Open

- Nothing outstanding for this release.
- A lazy colour-table startup optimisation was prototyped and **not adopted**. Three of 14 tests failed because of enabled-state caching, and it was judged too risky. No change shipped.
