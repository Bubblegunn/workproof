# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Caveat:** Git history shows *what* was committed and *when*. It cannot show hours worked. This note says whether the history is consistent with each line item. It does not confirm or dispute the hours.

| # | Invoice line | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep (code, tests, README), about 58 lines added, all within roughly 2 hours of commit timestamps. Merged to `main`. | **Work is real and delivered.** The size looks small next to 20 h, but time spent on design, investigation or review wouldn't appear in git. Worth asking Luka to explain. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18, 26 Sep) on the unmerged branch `feature/hreflang`. The 26 Sep commit is labelled "WIP" and adds 2 lines, one of them a comment. Nothing is on `main`. | **Only partly supported.** Work exists and was started, but it is unfinished and not delivered. The commits don't show 24 h of finished work. Ask for status and for what the 24 h covers. |
| 3 | Performance: cache generated sitemap | 12 | One commit (22 Sep, 40 lines) on `main`, authored by **Nora Fisher** (`nora@lp-dev.example`), not Luka. | **Work is real, but not by Luka in the history.** Nora uses the same company email domain, so she may be a colleague at LP Dev. Ask whether it is billable under this invoice and who did the work. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct 2025**. It changed one CI file (8 lines added, 52 removed). | **Outside the billing period.** The commit is dated after 30 Sep, so September history doesn't support it. It may have been worked on in September and committed late, so ask. |
| | Update dependencies (15 Sep, one lockfile) | not invoiced | Present in history, but not listed on the invoice. | Nothing to check. |

## Summary

- **Clearly supported:** item 1 (20 h) is real and merged. Even there, the history shows only about 2 hours of commit activity, so the hours are plausible but not proven.
- **Partly supported:** item 2 (24 h) is unfinished work on an unmerged branch.
- **Not supported as stated:** item 3 (12 h) was committed by a different person. Item 4 (6 h) was committed in October.
- That leaves 20 h clearly backed by delivered work, 24 h partly backed, and 18 h with an authorship or date question. None of this proves the hours are wrong.

## Suggested next steps

1. Ask Luka for a timesheet or time log per line item. Git can't confirm hours.
2. Ask who Nora Fisher is and whether her work belongs on this invoice.
3. Ask why the CI fix is dated October, and whether it should be on the October invoice instead.
4. Ask whether `feature/hreflang` is meant to be finished and merged, and whether payment for item 2 should wait until it is.

*Source: repository history on all branches, checked against docs/billing/INV-0042.txt. Dates are the commit timestamps recorded by the contractor's own machine, which can be set or rewritten by the committer. They are good evidence but not tamper-proof.*
