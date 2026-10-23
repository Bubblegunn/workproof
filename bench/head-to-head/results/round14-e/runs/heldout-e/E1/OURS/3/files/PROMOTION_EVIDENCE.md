# Promotion evidence: Priya Raman, 1 January to 30 June 2026

Prepared from the team's change history. The committee cannot see the code, so this describes outcomes in plain terms. Dates are the date each change was written (author date), not the date it was merged. The change history records what was changed, by whom and when. It does not record effort, difficulty, quality or business impact.

## Summary

- 12 authored non-merge commits in the window (identities: Priya's work address plus a second laptop-style name, see "Identity" below).
- Five pieces of user-visible work delivered, one piece built and then withdrawn, and two large additions that are not counted as authored work.
- Lines written: 462 added in the window, after removing a 30,002-line benchmark data file and a 1,800-line automatically generated dependency list. Of those 462, 120 belong to the withdrawn piece, so 342 added lines are in the product today. The raw figure before any exclusion is 32,264 lines added and 239 removed.
- Lines are a rough size indicator only. They say nothing about difficulty or value.

## What was delivered

1. **JSON export for tables** (12 January, fix on 20 January, tests on 14 March). A new way to export a table as JSON, a later fix so empty cells are handled correctly, and an automated test suite for the feature. About 155 lines added across the three changes.
2. **Export options** (10 and 12 March). Settings that let users control how exports are produced. About 47 lines added.
3. **Command-line switch for JSON export** (written 28 June, merged 3 July). Lets users request JSON export from the command line. About 45 lines added. It was written inside the window but merged just after it; it is counted by the date written.
4. **Documentation for pagination** (15 April). A user guide explaining how pagination works. About 40 lines added.
5. **Rewritten tests for stable sorting** (2 June). Replaced an existing sorting test file with a shorter one (55 lines added, 119 removed). The change history cannot show whether coverage went up or down. Please check this before presenting it as improved coverage.

## Built, then withdrawn

- **Pagination cache** (5 March, reverted the next day, 120 lines). The withdrawal note says it slowed small tables down. It stays in the line count above and is listed here as reverted. Catching a performance regression within a day can be presented honestly as a decision, not as delivered output.

## Not counted, with reasons

- A large sample data file for benchmarks (30,002 lines, 10 February). Dummy placeholder records, not hand-written work. A real record of effort would be setting up the benchmark, which this change does not show.
- A pinned list of software dependencies (1,800 lines, 11 February). Generated automatically by a tool.
- A merge on 11 May. Merges combine work and are not deliverables. It brought in a colleague's side experiment.
- Two small helper fixes written on 29 and 30 December 2025. They were applied to the repository on 8 and 9 January 2026, but they were written before the window, so they are outside it.
- A documentation note on 14 July. After the window.

## Work in the same period that is not Priya's

- Stable sorting for table rows (Lena Fischer, 3 February). The tests in item 5 relate to it, but the feature is Lena's.
- A CSV dialect option (Tomasz Varga, 4 May). The commit message thanks Priya for the review. The history holds no record of the review itself, so it is not counted. If it matters, ask Tomasz to confirm in writing.
- A pull request merged by Tomasz on 18 March that included Priya's export options work. The merge is his; the underlying changes are in item 2.

## How far the numbers can be trusted

- **Commit and line counts**: computed from the history with a counting tool and checked by hand. The 462 figure is a hand subtraction from the tool's raw 32,264, because the tool does not remove data files or generated files. The 342 figure removes the withdrawn piece.
- **Per-item line counts** (155, 47, 45, 40, 55, 120, and the 342 and 462 totals) are hand-read from the history for each change, not tool-computed totals. Only the commit count and the raw 32,264 and 239 line figures are tool-computed.
- **Withdrawal detection**: the tool found no reverts because the withdrawal message is not in the standard form. I found it by reading the history, and it is included above.
- **Whitespace and formatting**: none of the changes are whitespace-only; the figures are the same with whitespace ignored.
- **Third-party code**: none of the large added files carries a licence or source header. One of the seven large files was too big to inspect automatically; it is the benchmark data file, which is excluded anyway.
- **Dates**: no commit has a future date. One change was written in the window but merged after it, and two were written before and merged inside it. This document uses the written date throughout.
- **Identity**: a second name appears on three commits in the history: "priya", with a laptop-style address. I included the one inside the window (the 20 January fix) on the basis that the first name matches and the address is a personal machine. **Included: first name match plus laptop-style address, please confirm.** Without it the commit count is 11 and the added line count is 5 lower.
- **Limits**: nothing here shows time spent, reviews given, mentoring, design work, incidents handled, or the impact on users. For a senior-level case these are usually the strongest evidence, and they would have to come from other sources such as review comments, design documents, or statements from colleagues.
