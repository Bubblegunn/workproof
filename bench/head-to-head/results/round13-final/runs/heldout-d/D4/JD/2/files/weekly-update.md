# Weekly Update: 8–12 September 2025

Author: Sora Tanaka

## Delivered

- **ESM named exports fixed for `kleur/colors`** (8 Sep). Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. I added the missing exports map entry and a regression test, and the test passes.
- **`NO_COLOR` handling documented** (9 Sep).
- **Test coverage for `FORCE_COLOR`** (11 Sep). New tests cover `FORCE_COLOR=0`, `=1` and unset, confirming that `0` behaves like `NO_COLOR`.
- **Dev dependencies bumped** (12 Sep).

## Open / Not Delivered

- **Lazy color escape table:** I tried it to cut startup cost, but it caused 3 of 14 tests to fail because of enabled-state caching. I judged it too risky and dropped it. Nothing shipped, and it's not currently planned.
