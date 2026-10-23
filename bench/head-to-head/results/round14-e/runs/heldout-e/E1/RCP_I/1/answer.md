I wrote `PROMOTION_EVIDENCE.md` in this folder. It's based on the git history only, so I didn't run the `/receipts` transcript miner. That tool reports Claude Code session activity over a rolling window ending today, not repo contributions between two fixed dates, so it couldn't give you a 1 Jan–30 Jun report.

**What it says**
- You authored 7 substantive commits in the period, adding about 340 lines of source, tests and docs.
  - JSON export, plus its options and tests.
  - A CLI flag for JSON export.
  - Pagination docs.
  - Tests for sorting.
- The raw git total is about 32,000 added lines. Roughly 31,800 of those are a 30,000-line sample dataset and a 1,800-line generated lockfile. I excluded both.

**Left out, with the reasons in the file**
- The paginate-cache commit and its revert cancel out, so I counted nothing for them.
- The merge commit, the 14 Jul docs commit (after your window), and the two "unit helper" commits are out. Those two have author dates of 29–30 Dec 2025.
- Lena Fischer wrote the stable-sorting feature. You only added its tests.
- Tomasz Varga wrote the CSV dialect option. His commit message thanks you for a review, but the repo has no review record.

**Two things for you to do before submitting**
- Commit `0b92a08` (20 Jan, +5 lines) is authored as `priya@priya-laptop.invalid`, not your usual identity. I counted it as probably yours but flagged it, because git can't prove it. Please confirm it's yours.
- The file can't show impact, only what was built. Add links to PR #41 and the review threads, plus one or two real outcomes, such as who uses JSON export.