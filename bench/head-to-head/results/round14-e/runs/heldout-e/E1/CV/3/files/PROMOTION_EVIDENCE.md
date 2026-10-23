# Promotion evidence: Priya Raman, 1 Jan – 30 Jun 2026

Source: git history of this repo only (`git log`, diffs). No code is quoted. No PR, review, issue or CI data was available, so nothing here is confirmed by those sources.

## Summary

In the window there are 13 commits attributed to Priya Raman, plus 2 under a second identity, `priya <priya@priya-laptop.invalid>`. They add JSON export, export options, a CLI flag for JSON export, pagination docs, a benchmark dataset and a dependency lock file. Two items need care. The sorting test commit removed more than it added. The pagination cache was reverted the day after it landed. Details below.

## What was delivered

| Date | Item | Commit | Size (lines) |
|---|---|---|---|
| 12 Jan | JSON export for tables (new module) | 2449bc2 | +60 |
| 20 Jan | Fix: handle None cells in JSON export | 0b92a08 | +5 |
| 10 Mar | Export options (new module) | 80c7dba | +35 |
| 12 Mar | More export options | bf435d7 | +12 |
| 14 Mar | JSON export tests (merged as PR #41 by Tomasz Varga, 18 Mar) | 2aa6909 | +90 |
| 15 Apr | Pagination documentation | 3462950 | +40 |
| 28 Jun | CLI flag for JSON export (authored 28 Jun, committed 3 Jul) | 2468e12 | +45 |
| 2 Jun | "Cover stable sorting" tests | 16de668 | +55 / −119 |
| 10–11 Feb | Benchmark dataset and pip-compile lock file | 02e743b, d9924c3 | +30,002 / +1,800 (generated or vendored) |
| 5–6 Mar | Pagination cache, then reverted | 2b9c209, 24fb23e | +120 / −120 (net 0) |
| 11 May | Merge of Tomasz Varga's `side` branch | 9307f24 | Merge only, no code of hers |

Hand-written additions with lasting effect, counting only the first seven rows: about **287 lines** across 7 commits. Treat that as an upper bound (see below).

## How far the numbers can be trusted

**Lines of code are weak evidence.**
- About 32,000 of the added lines are a vendored dataset and a generated lock file. Don't count them as engineering output.
- The JSON export, export options, CLI and test files are made of many near-identical one-line functions or tests. They have numbered names and trivial bodies. The line counts overstate the work.
- I didn't judge whether the code works. `python` isn't available in this environment, so I didn't run the tests.

**The sorting test commit is a risk.**
- 16de668 is titled "cover stable sorting" but deleted 119 lines and added 55. The deleted lines were real tests (sort per column, reverse sort, custom sort key).
- The 55 added tests call placeholder functions with an empty list.
- As the history stands, this reduces coverage. Don't present it as a coverage improvement. Check it before the committee sees it.

**The pagination cache was reverted.** It was added on 5 Mar and reverted on 6 Mar, so net 0. The pagination docs (15 Apr) remain. The history doesn't say why it was reverted.

**Attribution gaps.**
- `priya <priya@priya-laptop.invalid>` is a different identity. I included its in-window commit (0b92a08, a 5-line fix) on the assumption it's yours. Please confirm. Its other two commits are from December 2025, which is out of range.
- Commit 2468e12 was authored 28 Jun but committed 3 Jul. I counted it by author date. If the committee goes by commit or merge date, it falls outside the window.
- Not yours, so excluded: stable sorting (Lena Fischer, 3 Feb), CSV dialect option (Tomasz Varga, 4 May), and a README typo fix.
- The CSV dialect commit message thanks you for a review. That is the only trace of review work in the history. I can't quantify it. GitHub review records would be better evidence.
- Excluded as out of window: "docs: later note" (14 Jul).

## What this history can't show

Design decisions, review and mentoring work, incident response, impact on users, and whether any of this shipped. For a senior-level case you'll need that from other sources, such as PR threads, design docs, and the reasoning behind the cache revert.

## Suggested next steps

1. Confirm that the `priya@priya-laptop.invalid` identity is yours. Consider adding a `.mailmap` entry.
2. Look at 16de668 and decide whether to restore the deleted sorting tests.
3. Pull your PR review history to cover the review work that git can't show.
