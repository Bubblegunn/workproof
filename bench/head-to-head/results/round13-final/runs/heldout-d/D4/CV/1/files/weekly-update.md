# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fix for `kleur/colors`** (8 Sep): Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. This is fixed, with a regression test (`tests/esm-exports.mjs`) added so it stays fixed.
- **NO_COLOR documentation** (9 Sep): Added `docs/no-color.md`, which describes how the library handles the `NO_COLOR` setting.
- **FORCE_COLOR test coverage** (11 Sep): Added tests (`tests/force-color.mjs`) for `FORCE_COLOR=0`, `=1` and unset. They confirm that `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Dev dependency bump** (12 Sep): Updated development dependencies and recorded the changes in `notes/deps-bump.md`.

## Still open / not delivered

- **Lazy color escape table (startup-time optimization):** Evaluated and not adopted. The prototype broke 3 of 14 tests because of enabled-state caching, so it was rolled back as too risky. No change shipped. It can be revisited later with a safer approach to caching.
