# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows real work for items 1 and 4, partial work for item 2, and item 3 was written by someone else. It cannot confirm the hours for any item. Git records what was saved and when. It doesn't record time spent, so it can't prove or disprove a number of hours.

## Item by item

| # | Invoice item | Billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 h | 9 Sep 2025: three commits by Luka, about 2 hours apart (10:05–12:19). They add the feature (32 lines), tests (20 lines) and a README note (6 lines). | Work is present and in September. 20 h looks high for about 58 lines of change, but there may be unrecorded work such as design, testing or review. Ask Luka. |
| 2 | Multi-language (hreflang) support | 24 h | 17–18 Sep and 26 Sep: three commits by Luka. The tests are 40 lines. The main file is 60 lines of repeated placeholder functions (`x + 1`, `x + 2`, … `x + 15`). These don't appear to do anything related to language links. The last commit, labelled "WIP", adds a comment line and nothing else. | **Weakly supported.** The history shows a started, unfinished feature, not finished "support". 24 h is the hardest figure to justify from the repo. Ask Luka what was delivered and what the 24 h covered. |
| 3 | Performance work: cache generated sitemap | 12 h | 22 Sep 2025: one commit, 40 lines, **authored by Nora Fisher** (nora@lp-dev.example), not Luka. | **Not Luka's work in the history.** Nora uses the same company email domain, so she may be a colleague or subcontractor of Luka's. Whether to pay for 12 h of her work depends on your contract. Ask Luka to explain. |
| 4 | Fix CI on Ruby 3.3 | 6 h | One commit by Luka, dated **3 Oct 2025**. It replaces the old test setup with a shorter one (8 lines added, 52 removed). | **Outside the billing period** (1–30 Sep). The work is real, but it belongs on an October invoice, not this one. It also removes the old multi-version test setup rather than just adding Ruby 3.3, which is worth a question to Luka. |

## Other points

- The 15 Sep "Update dependencies" commit (a generated lock file, 306 lines) isn't listed on the invoice. It's routine and not much work.
- The history has about 9 commits by Luka in September, concentrated on 9, 17–18 and 26 Sep, plus Nora's one commit.
- The history is not a timesheet. Commit times are when changes were saved, and commit dates can be set by the author. Meetings, research, debugging and review leave no trace.

## Hours by how well the history supports them

| Category | Hours |
|---|---|
| Work visible in September under Luka's name (item 1, and item 2 only in part) | up to 44 h |
| Authored by someone else (item 3) | 12 h |
| Dated outside September (item 4) | 6 h |

Even the 44 h is a ceiling. Item 2 appears to be unfinished and partly placeholder code.

## Suggested next steps

1. Ask Luka for a breakdown of hours per item (dates and what was done), and for any time tracking.
2. Ask who Nora Fisher is and whether her work is covered by your agreement.
3. Ask Luka to explain what the hreflang commits deliver, and whether the 24 h includes work that isn't in the repo.
4. Move the CI fix to the October invoice, or agree to accept it on this one.
5. Consider holding payment of items 2–4 (42 h) until these are answered. Item 1 looks reasonable to pay, though 20 h is on the high side.

*Based on the repository's commit history as of 22 Oct 2026. I haven't tested whether the code works.*
