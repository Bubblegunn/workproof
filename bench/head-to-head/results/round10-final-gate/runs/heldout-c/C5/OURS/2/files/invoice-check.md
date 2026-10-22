# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows that *some* work happened, but it does not support the 62 hours as billed. Version history records what was committed and when. It does not record hours worked. So it can confirm that work exists, but it can never confirm hours. Several line items also have specific problems, listed below.

| # | Invoice item | Hours billed | What the history shows | Verdict |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | 4 commits by Luka on 9 Sep (10:05 to 12:19), about 60 lines of code, tests and docs. | Work is real and delivered. Commits span about 2 hours; 20 h is not visible, though planning or review time wouldn't show. Ask Luka. |
| 2 | Multi-language (hreflang) support | 24 | 3 commits by Luka (17, 18 and 26 Sep) on a side branch, `feature/hreflang`. It was **never merged into the main code**. The last commit is labelled "WIP" and adds 2 lines. | Started but not delivered. Not in the product. Questionable to bill 24 h as complete. |
| 3 | Performance work: cache generated sitemap | 12 | One commit on 22 Sep, 40 lines. It was written by **Nora Fisher** (also a lp-dev.example address), not Luka. The code in it looks like placeholder functions (`cache_1`, `cache_2`... each just adding a number), not a working cache. | Not Luka's commit, and doesn't appear to do what the item says. Needs explanation. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct**, which is outside the September billing period. It replaced the test setup with a much shorter one. It dropped the older Ruby versions, the Jekyll 3.x test and the gem-build check, and tests now run on every push rather than only the main branch. | Wrong period. Also a reduction in test coverage rather than a plain fix. |

**Other observations**
- A "Update dependencies" commit by Luka on 15 Sep (a lockfile, 306 lines) is not an invoice line. It is minor work and doesn't change the picture.
- Luka authored 8 commits in total: 3 for the exclude flag, 1 dependency update, 3 unmerged hreflang commits and the 3 Oct CI commit. Commit counts say nothing about hours, so none of this confirms or refutes the 62 h.

**Suggested next steps**
1. Ask Luka for time records (timesheet or tracker) for each item. The commit history can't substitute for them.
2. Ask why the hreflang work was not merged and whether it is finished.
3. Ask who Nora Fisher is, and why her cache commit is billed under Luka. Ask for a technical review of that code.
4. Query the 6 h for CI, since it was done in October, and confirm whether removing the test coverage was agreed.
5. Consider holding payment on items 2 to 4 (42 h) until answered. Item 1 (20 h) is supported as work, with the hours still to be confirmed.

*Basis: git history of this repository, including the `feature/hreflang` branch. Dates are commit timestamps, which the committer can set themselves, so they are indicative rather than proof.*
