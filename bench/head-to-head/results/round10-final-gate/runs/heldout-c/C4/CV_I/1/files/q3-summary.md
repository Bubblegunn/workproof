# Q3 2025 summary (July to September)

Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (July).** Added support for hex strings that include alpha, such as `#ff000080`, after a customer reported washed-out colours. The full test suite passed (212 tests).
- **Alpha syntax documentation (September).** Documented the new alpha syntax in the readme so users can find and use it.
- **Node 22 in CI (August).** Added Node 22 to the CI test matrix.

## Tried and not shipped

- **TypeScript types for level detection (September).** Added the types, then reverted them within a week. They are not part of the current code.

## Notes for the reviewer

- Performance work on chained style lookups (August) was started but is not included. It was stashed before merge because the benchmark numbers looked unreliable.
