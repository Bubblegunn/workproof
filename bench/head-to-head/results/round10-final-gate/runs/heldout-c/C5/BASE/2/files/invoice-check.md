# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows real work for items 1 and 2, but it does not back up the hours claimed, and items 3 and 4 don't match September work by Luka. Git records *what was saved and when*, not *how long it took*, so it can never prove or disprove hours directly. It can only show whether the claimed work exists and when it happened.

## Line by line

| # | Invoiced item | Hours | What the history shows | Verdict |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep 2025 (code, tests, README note), all within about 2 hours of each other (10:05–12:19). About 70 lines added. | Work exists and is dated correctly. 20 h looks high compared with the visible activity, but time spent outside commits (design, review, testing) wouldn't show. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep), about 100 lines. They are **only on a side branch (`feature/hreflang`), not merged into `main`**. The last commit just adds a comment ("WIP language fallback"), and the code is not finished. | Partly supported. Work was started but is unfinished and not delivered. Worth asking whether 24 h should be billed in full for an incomplete feature. |
| 3 | Performance work: cache generated sitemap | 12 | One commit, 22 Sep 2025, 40 lines. **The author is Nora Fisher (nora@lp-dev.example), not Luka.** | Work exists, but someone else did it. Nora appears to be at Luka's company, so this may be legitimate subcontracting. Confirm that is allowed and whether her time is what is being billed. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct 2025**, which is outside the invoice period (1–30 Sep). It also deleted most of the CI configuration (8 lines added, 52 removed), replacing it with a much shorter one. | Not a September item. Also worth a technical review, since it appears to have removed the previous test setup rather than only adding Ruby 3.3. |

## What the history does support
- Luka made commits on 5 separate days in September (9, 15, 17, 18 and 26 Sep), plus one on 3 Oct.
- Items 1 and 3 are present on `main`. Item 2 exists on a branch.
- The "Update dependencies" commit (15 Sep) is not on the invoice at all. It is a generated lockfile.

## What it does not support
- **The 62 hours total.** There is no time tracking in the repo. Commit counts and sizes are small for that many hours (about 8 commits from Luka in the whole period).
- **Item 2 being complete.**
- **Item 3 being Luka's own work.**
- **Item 4 belonging to September.** If billed, it belongs on an October invoice.

## Rough effect on the total
- Clearly questionable on the history alone: item 4 (6 h, wrong month) and item 2 (24 h, unfinished and unmerged).
- Needs a conversation: item 3 (12 h, authored by a colleague).
- Item 1 (20 h) is supported as work done, though the hours are unverified.

## Suggested next steps
1. Ask Luka for time logs or a breakdown of hours per item, since git cannot provide this.
2. Ask whether Nora Fisher is an approved subcontractor and whether item 3 hours are hers.
3. Ask Luka to confirm the status of the hreflang work and whether it will be merged.
4. Move item 4 to the October invoice, and ask a developer to check what happened to the CI configuration.

*Basis: `git log` across all branches. Commit dates are as recorded by the author's machine and could in principle be set to anything, so treat them as indicative rather than proof.*
