# Q3 2025 Summary (July–September) — Ines Kowalski

## Delivered

- **Hex colour strings with an alpha channel (July).** Added support for 8-digit hex colours (e.g. a colour plus transparency value). This came from a customer report of washed-out colours. The full test suite passed (212 tests) before the change was committed.
- **Node 22 in CI (August).** Added Node 22 to the automated test matrix so the project is verified against the new runtime.
- **Documentation for the alpha syntax (September).** Documented the new alpha-channel syntax in the readme so users can find and use the feature.

## Explored, not shipped

- **Chained style lookup performance (August).** Prototyped an optimisation that initially benchmarked at about 2x faster. I held it back before merging because the numbers looked suspicious, and it remains unmerged pending a closer look.
- **TypeScript types for level detection (September).** Added the types, then reverted them within a week, so there is no net change in the codebase.

## Notes

- Net shipped changes for the quarter: 3 (feature, CI, docs). Commit history shows 5 commits, including the add/revert pair.
- Work on a v6 migration guide began in early October and is outside this period.
