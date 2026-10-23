# Weekly Update: 8–12 September 2025

## Delivered

- **ESM named exports fix for `kleur/colors`** (8 Sep): Named imports such as `import { red } from 'kleur/colors'` failed under native ESM. This is fixed, with a regression test (`tests/esm-exports.mjs`) added. It is ready ahead of the client's Friday release.
- **NO_COLOR documentation** (9 Sep): Added `docs/no-color.md`, which describes how `NO_COLOR` is handled.
- **FORCE_COLOR test coverage** (11 Sep): Added tests for `FORCE_COLOR=0`, `=1` and unset. `FORCE_COLOR=0` is checked to behave like `NO_COLOR`.
- **Node 22 CI matrix** (10 Sep, Kenji Mori): Added Node 22 to the CI test matrix.
- **Dev dependency bump** (12 Sep): Updated dev dependencies and recorded the changes in the notes.

## Evaluated, not adopted

- **Lazy color escape table** (10 Sep): We tried this to reduce startup cost. It caused 3 of 14 tests to fail because of enabled-state caching. We judged it too risky and dropped it, so nothing changed in the codebase.

## Open

- Revisit the startup-cost idea with an approach that doesn't break enabled-state caching, if it is still a priority.
- Follow-up items are tracked in the next-week notes (`notes/later.md`).
