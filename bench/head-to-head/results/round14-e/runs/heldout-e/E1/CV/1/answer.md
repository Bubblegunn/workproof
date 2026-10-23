I've written `PROMOTION_EVIDENCE.md`. I only read the git history and didn't run any of the code.

In the 1 January to 30 June 2026 window, you authored about 240 lines of real content in 6 commits:
- **JSON export:** the new module plus `None`-cell handling.
- **Export options:** two commits, merged through PR #41 by Tomasz.
- **Tests:** a 90-line JSON export test file.
- **Docs:** a 40-line pagination page.

The raw totals are much larger, but I wouldn't cite them. A 30,002-line dataset and a generated 1,800-line lockfile make up almost all of the difference.

**Weak spots in the evidence**
- **Sorting tests:** `test_sorting.py` (2 June, "cover stable sorting") is a net −64 lines. It deleted 6 real tests and replaced them with 55 placeholder asserts like `assert stable_sort_N([])`, which probably fail. I didn't count it as a delivery. Fix or explain it before you submit.
- **JSON export tests:** the 90 lines are trivial asserts on helper functions in the same file, so they don't show real coverage.
- **Pagination cache:** it was added on 5 March and reverted the next day, so it nets to zero.
- **Other people's work:** I didn't claim stable sorting (Lena Fischer) or the CSV dialect (Tomasz Varga). Git's only trace of your review work is the "thanks Priya for the review" in Tomasz's commit message.

**Things for you to check**
- **Second identity:** commit `0b92a08` (5 lines) is authored as `priya@priya-laptop.invalid`. I assumed it's you, so please confirm.
- **Boundary commits:** I excluded the two unit-helper commits, authored in December 2025 and committed in January. I also excluded the CLI flag commit, authored 28 June but committed 3 July. Including the CLI flag would raise the total to about 287 lines. Tell me which date convention you want and I'll adjust.