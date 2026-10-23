# Weekly Update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **ESM named exports fixed for `kleur/colors`** (8 Sep): named imports such as `import { red } from 'kleur/colors'` failed under native ESM. Fixed by adding an exports map entry, with a regression test (`tests/esm-exports.mjs`).
- **NO_COLOR handling documented** (9 Sep): new page `docs/no-color.md`.
- **FORCE_COLOR test coverage** (11 Sep): new tests for `FORCE_COLOR=0`, `=1` and unset, confirming `FORCE_COLOR=0` behaves like `NO_COLOR` (`tests/force-color.mjs`).
- **Dev dependencies bumped** (12 Sep): recorded in `notes/deps-bump.md`.

## Open

- No open items for this period.
