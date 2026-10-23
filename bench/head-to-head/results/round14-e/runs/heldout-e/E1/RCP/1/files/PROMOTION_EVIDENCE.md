# Promotion evidence: Priya Raman, 1 Jan – 30 Jun 2026

Source: git history of this repo only (`git log`, diffs). No code is quoted. Nothing here comes from review comments, tickets, CI or production data, so it says what was committed, not what impact it had.

## Summary

In the window, Priya authored 7 substantive commits under her main identity. These cover a JSON export feature and its tests, export options, a pagination doc page, a CLI flag for JSON export, and a rewrite of the sorting tests. About 340 lines were added across 6 files.

The history supports "steady contributor across several areas of one feature family". It does not on its own show scale, complexity or cross-team leadership. Several line counts are inflated or misleading (see Trust).

## What was delivered

| Date (author) | Work | Added / removed lines |
|---|---|---|
| 12 Jan | JSON export for tables (`jsonexport.py`) | +60 |
| 10 Mar | Export options (`exportopts.py`) | +35 |
| 12 Mar | More export options (same file) | +12 |
| 14 Mar | Tests for JSON export (`test_jsonexport.py`) | +90 |
| 15 Apr | Pagination documentation (`docs/pagination.md`) | +40 |
| 2 Jun | "Cover stable sorting" (`tests/test_sorting.py`) | +55 / −119 |
| 28 Jun | CLI flag for JSON export (`cli_export.py`) | +45 |

Further commits are probably hers but depend on an identity check (see Needs confirmation): None-cell handling in JSON export on 20 Jan (+5), and two unit-helper commits (+50) authored in Dec 2025 and committed on 8–9 Jan 2026.

Roughly 340 lines were added by commits clearly under her name. With the unconfirmed commits it is about 395.

## Not credited, and why

- **Paginate cache, 5 Mar (+120), reverted 6 Mar (−120).** The net effect is zero. It is a real attempt, but delivered nothing. If you mention it, frame it as an experiment rolled back deliberately. The history doesn't say why it was reverted.
- **`vendor/datasets/cities.json` (+30,002) and `requirements-lock.txt` (+1,800).** A sample dataset and a pip-compile output. These are not authored work, so I left them out of the totals. Counting them would multiply the apparent output by about 80×.
- **Merge of `side`, 11 May.** A merge commit with no authored content. The merged work (`csv_dialect.py`, `side.py`) is Tomasz Varga's. His commit message thanks Priya for a review, but the history can't show how substantial that review was.
- **Stable sorting feature (`sorting.py`, +50, 3 Feb).** Written by Lena Fischer, not Priya. Priya's 2 Jun commit only touches the tests.
- **Commits after 30 Jun.** The 14 Jul "docs: later note" is out of range. See the CLI-flag date issue below.

## How far the numbers can be trusted

1. **Line counts are weak evidence of effort.** The source and test files I sampled are mostly repetitive one-line functions, such as numbered `export_row_N`, `opt_N`, `unit_N` and `test_export_N` entries. Lines inflate relative to the real work, and the pagination doc is largely the same sentence repeated with different numbers. Use commit counts and feature descriptions rather than line totals. I haven't evaluated whether the code is correct or well designed.
2. **The sorting-test commit is a net deletion of real coverage.** The 2 Jun commit replaced a 119-line suite of substantive sorting tests (sort per column, reverse sort, sort key and so on, as I saw in the diff) with 55 short stub tests of the form "stable_sort_N([]) is truthy". If a committee member or reviewer ever sees the diff, this will not read as "improved test coverage". Check whether the replacement was intended. I would not claim it as a coverage improvement without that. If the original tests were moved elsewhere, the history I examined doesn't show it.
3. **Several tests are shallow in the same way.** The JSON export tests I sampled only assert that each helper returns something truthy. They show the code was exercised, not that behaviour was verified.
4. **Dates are ambiguous for three commits.**
   - CLI flag for JSON export: authored 28 Jun, committed 3 Jul. I counted it because the author date is in range. Under a commit-date rule it falls outside.
   - The two unit-helper commits were authored in Dec 2025 and committed on 8–9 Jan 2026, probably after a rebase. Under an author-date rule they are outside the window, so I did not count them in the headline numbers.
5. **Three identities.** Most commits use `Priya Raman <priya.raman@acme-corp.example>`. Three others use `priya <priya@priya-laptop.invalid>` (a local laptop git config). I treated the laptop commits as "probably hers" because the name matches, but git can't prove it. That's the main reason I split them out.
6. **History is rewritable.** Dates and authorship can change on rebase or amend, as seen above. Treat all figures as "as recorded in the repo today".
7. **Repo context.** The repo is a fork or copy of the open-source PrettyTable library with hundreds of upstream commits by others. Only the window above is attributed to Priya.

## Needs confirmation from you

- Are the `priya@priya-laptop.invalid` commits yours (+55 lines, 3 commits)?
- Which date rule should apply to the CLI flag and unit-helper commits, author or commit date?
- Was the sorting-test replacement intentional, and where did the original tests go?
- Why was the cache work reverted?

## What the history can't show, and what to add

The repo can't show review quality, design decisions, mentoring, incident work, adoption or user impact. For a senior-level case these usually matter more than commits. Pair this document with links to design docs, PR discussions (for example PR #41 on export options, merged 18 Mar by Tomasz Varga), reviews you gave and any usage data.
