# Promotion evidence: Priya Raman, 1 Jan – 30 Jun 2026

Source: git history of one repository (a Python table-formatting library), read on 2026-10-23. No code is quoted. Everything below is self-reported from commit metadata and has not been checked against reviews, tickets or CI.

## Summary

In this window Priya authored 10 substantive commits (one of them a revert) across four areas: a JSON export feature, export options, a CLI export flag, and tests and docs for them. The work is roughly **340 hand-written lines kept** (about 460 if one reverted experiment is counted), spread across the window from 12 Jan to 28 Jun. Substantive commits fall in January, March, April and June only (nothing in February beyond generated/data files, and only a merge in May), on 10 separate days. The sections below say which numbers are solid and which are not.

## What was delivered

| Date | Delivered | Size (approx.) |
|---|---|---|
| 12 Jan | JSON export for tables (new feature) | ~60 lines |
| 20 Jan | Bug fix: missing values in JSON export | ~5 lines (see caveats, identity) |
| 5–6 Mar | Pagination cache, then **reverted the next day** | ~120 lines added, 120 removed, net 0 |
| 10 and 12 Mar | Export options (two commits) | ~45 lines total |
| 14 Mar | Automated tests for JSON export | ~90 lines |
| 18 Mar | The export work above was merged via PR #41 (merged by a colleague, Tomasz Varga) | – |
| 15 Apr | Documentation explaining pagination | ~40 lines |
| 2 Jun | Rewrite of an existing sorting test file | +55 / −119 lines (net reduction) |
| 28 Jun | Command-line flag for JSON export | ~45 lines |

Totals (rounded): **~340 lines of hand-written code, tests and docs kept**; ~460 gross if the reverted experiment is counted; ~220 net of the test-file rewrite's deletions. Roughly half of the kept lines are tests (~145) and ~40 are docs; the rest is feature code (~150).

## How far to trust the numbers

**Reasonably solid**
- Commit dates, authorship by the `Priya Raman` identity, and per-commit line counts come straight from git.
- The list of features above is a plain reading of commit messages and file names.

**Deliberately excluded (would inflate the figures)**
- Two Feb 2026 commits by Priya added a ~30,000-line sample dataset and a ~1,800-line dependency lock file (the latter's message says it was generated). Counting these would swamp everything else (they are ~70× the rest combined). They are excluded; the dataset is data, not authored code.
- The merge commit on 11 May (a merge is integration, not authorship; the content merged was a colleague's).
- Her pagination cache commit and its revert cancel out. Treat it as a tried-and-dropped experiment, not output.

**Things that are not hers, despite being nearby in the history**
- Stable sorting for table rows (3 Feb) was written by Lena Fischer. Priya's June commit only revised its tests.
- The CSV dialect option (4 May) and the PR #41 merge were Tomasz Varga's. The CSV commit message thanks Priya "for the review". That is a code review, which git cannot measure, so it is not counted but is worth citing by hand if reviewers can confirm it.
- Commits from Priya after 30 Jun (a docs note on 14 Jul) are outside the window and left out.

**Uncertain**
- *Second identity.* Three commits are under `priya` with a laptop address, not her company one. One (the 20 Jan bug fix) falls in the window and is included at ~5 lines on the assumption it is hers. The other two (unit helpers, ~50 lines) were authored on 29–30 Dec 2025 and only committed on 8–9 Jan 2026, probably after a rebase. I excluded them as authored before the window. Counting them adds ~50 lines; excluding the 20 Jan fix removes 5.
- *Lines are not value.* They count added lines per commit. A line of test, doc or feature counts the same, and revisiting a region counts again. Use them for rough scale only, never as a ranking.
- *Impact is invisible here.* Git does not show whether the export feature was used, how hard it was, whether bugs followed, or what the design/review effort was.
- *PR #41 is the only PR evidenced in history.* It was merged by someone else, so I cannot confirm who opened it.

**Claude Code data**
The receipts tool found no Claude Code sessions for this repo on this machine in the window, so nothing here is based on Claude Code usage. All figures are git-only. This is a limit of the data on this laptop, not evidence about her working practice.

## Suggested framing

Lead with the shipped feature set (JSON export, export options, CLI flag, with tests and docs) and with the fact that she wrote tests and docs alongside code rather than leaving them for later. Present the line figures as rough scale. Add by hand what git cannot show: who used the export feature, any reviews given (the CSV dialect thanks), why the pagination cache was reverted, and any design or mentoring work. A committee will weigh scope and judgement far more than ~340 lines, and a short story on those will be stronger than any of the numbers above.
