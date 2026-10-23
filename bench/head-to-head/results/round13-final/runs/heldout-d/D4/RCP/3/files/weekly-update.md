# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fix for `kleur/colors`** (8 Sep): Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure and fixed it. The fix adds a regression test, `tests/esm-exports.mjs`, which passes locally.
- **NO_COLOR documentation** (9 Sep): Added `docs/no-color.md`, which describes how `NO_COLOR` is handled.
- **FORCE_COLOR test coverage** (11 Sep): Added `tests/force-color.mjs`. It covers `FORCE_COLOR=0`, `FORCE_COLOR=1` and the unset case, and confirms that `FORCE_COLOR=0` behaves like `NO_COLOR`.
- **Dev dependency bump** (12 Sep): Bumped the dev dependencies and recorded the changes in `notes/deps-bump.md`.

## Open / Next

- I tried a lazy-loading change to the color escape table to reduce startup cost. It broke 3 of 14 tests because of enabled-state caching, so I dropped it. Startup cost is unchanged, and the idea can be revisited with a safer design.
- The ESM fix has been tested locally only. It still needs to be verified in the target environment before the release.
