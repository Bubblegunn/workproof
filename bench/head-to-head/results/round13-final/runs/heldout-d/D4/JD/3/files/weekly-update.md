# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fix (8 Sep):** Named imports from `kleur/colors` (e.g. `import { red } from 'kleur/colors'`) were failing under native ESM. Fixed, with a regression test added.
- **NO_COLOR documentation (9 Sep):** Added documentation describing how `NO_COLOR` is handled.
- **CI: Node 22 added to the test matrix (10 Sep):** Contributed by Kenji Mori.
- **FORCE_COLOR=0 test coverage (11 Sep):** Added tests confirming `FORCE_COLOR=0` behaves like `NO_COLOR`, along with the `FORCE_COLOR=1` and unset cases.
- **Dev dependency bump (12 Sep):** Updated development dependencies.

## Open / Not Delivered

- **Lazy color escape table (startup-cost optimization):** Prototyped on 10 Sep but not adopted. It caused 3 of 14 tests to fail because of enabled-state caching, and was judged too risky. No change shipped. It could be revisited with a safer approach if startup cost remains a concern.
