# Weekly update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **ESM named exports for `kleur/colors` (Mon 8 Sep).** Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I reproduced the failure, fixed it, and added a regression test (`tests/esm-exports.mjs`). The test passes locally. This was needed ahead of the client's Friday release.
- **`NO_COLOR` documentation (Tue 9 Sep).** Added `docs/no-color.md` describing how `NO_COLOR` is handled.
- **`FORCE_COLOR=0` test coverage (Thu 11 Sep).** Added `tests/force-color.mjs`. It covers `FORCE_COLOR=0`, `=1` and unset, and checks that `=0` behaves like `NO_COLOR`.
- **Dev dependency bump (Fri 12 Sep).** Updated dev dependencies and recorded the changes in `notes/deps-bump.md`.
- **CI: Node 22 added to the test matrix (Wed 10 Sep, Kenji Mori).**

## Still open

- **Lazy color escape table (not shipping).** I tried making the escape table lazy to cut startup cost. 3 of 14 tests failed because of enabled-state caching. I judged it too risky and dropped it, so the code is not in the repository. The startup-cost idea could be revisited with a safer approach if it is still wanted.
- **Fix on a separate project, not yet committed.** A limit-check bug on another project is patched and has a test, but it isn't committed or reviewed yet. I'll commit it next week.
- **Release confirmation.** The ESM fix is committed. I haven't confirmed that it has been published or picked up for the Friday release, so that needs a check.
