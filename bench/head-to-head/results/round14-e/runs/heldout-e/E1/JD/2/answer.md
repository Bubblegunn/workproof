I've written `PROMOTION_EVIDENCE.md` in the repo folder. It covers 1 Jan to 30 Jun 2026 and is based on git history only. I didn't run any of the code.

**What you delivered (12 commits, about 290 hand-written lines added):**
- JSON export for tables, with the None-cell fix and tests.
- The export-options module, merged in PR #41.
- A CLI flag for JSON export.
- Pagination documentation.

**How far the numbers can be trusted:**
- **Line counts:** They don't measure impact. Much of the code is repetitive numbered one-liners, so I left out the 30,000-line dataset and the generated lockfile.
- **Sorting test rewrite (2 Jun):** It cut `tests/test_sorting.py` from 174 lines to 55. The 55 new lines are near-identical stubs that call `stable_sort_N([])` on an empty list. The old tests were real ones. I'd check that file before citing it. It reads as a drop in coverage, not an addition.
- **Paginate cache:** You reverted it the next day because it slowed small tables down. It nets to zero, and the file frames it as catching a regression.
- **Other people's work:** Lena wrote the stable sorting module, and Tomasz wrote the CSV dialect option. Git has no record of your review of Tomasz's work, so you'd need the PR thread or a statement from them.
- **Dates:**
  - The CLI flag was authored on 28 Jun but committed on 3 Jul. I included it by author date.
  - I left out two unit-helper commits authored in Dec 2025 and committed in Jan 2026.
  - I also left out the 14 Jul commit.
- **Identity:** A few commits use a `priya@priya-laptop.invalid` alias. I assumed they're yours.
- **Outcomes:** The history has nothing on users, adoption or performance gains. Any claim like that needs evidence from outside the repo.

The file ends with a suggested wording for the promotion case that avoids citing the sorting rewrite and the raw line totals.