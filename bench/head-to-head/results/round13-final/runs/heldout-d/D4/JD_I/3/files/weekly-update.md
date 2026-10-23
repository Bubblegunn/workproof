# Weekly Update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **ESM fix for `kleur/colors` (8 Sep):** Named exports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure, added the missing exports-map entry and added a regression test. The test passes locally.
- **NO_COLOR documentation (9 Sep):** Documented how NO_COLOR is handled.
- **FORCE_COLOR test coverage (11 Sep):** Added tests for `FORCE_COLOR=0`, `=1` and unset, confirming that `FORCE_COLOR=0` behaves like NO_COLOR.
- **Dev dependency bump (12 Sep):** Updated development dependencies.

## Still open

- Nothing is blocking. The ESM fix has only been verified locally, so it should get a CI run and a release before consumers see it.
