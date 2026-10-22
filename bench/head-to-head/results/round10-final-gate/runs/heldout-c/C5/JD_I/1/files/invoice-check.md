# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows real work for items 1 and 2 (partly), but it does not support the full 62 hours. Two line items don't match the history as invoiced, and the history can't confirm hours at all.

## What the history can and can't tell us
Git records *what* was changed and *when*. It does not record time spent. So it can show that work happened, not that it took 62 hours. Any hours figure needs Luka's timesheet or notes.

## Line by line

| # | Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 | Three commits by Luka on 9 Sept (flag, tests, docs), about 58 lines added, all within roughly 2 hours of commit times. | **Work is real. 20 h looks high** for what was delivered. Needs explanation. |
| 2 | Multi-language (hreflang) | 24 | Three commits by Luka on 17, 18 and 26 Sept (about 100 lines). The last is marked "WIP" and adds only a comment. All of it sits on a side branch (`feature/hreflang`) and was **never merged into main**. | **Partly supported.** Work started but is unfinished and not delivered. Ask whether 24 h should be billed for incomplete work. |
| 3 | Cache generated sitemap | 12 | The one commit was written by **Nora Fisher** (also an `@lp-dev.example` address), not Luka, on 22 Sept. | **Not Luka's work in the record.** Ask whether Nora's time is being billed under Luka's invoice, and whether that was agreed. |
| 4 | Fix CI on Ruby 3.3 | 6 | Commit is dated **3 Oct 2025**, outside the September billing period. | **Outside the period.** It may belong on the October invoice. |

## Other observations
- A 15 Sept "Update dependencies" commit (an auto-generated lockfile, 306 lines) isn't on the invoice. It also doesn't justify extra hours.
- Of the 62 hours, only item 1 (20 h) is clearly Luka's finished September work in the history. Items 2 to 4 (42 h) are unfinished, someone else's, or dated outside September.

## Suggested next steps
1. Ask Luka for the timesheet or time-tracking records behind each line.
2. Ask about item 3 (Nora's authorship) and item 4 (October date).
3. Ask whether the hreflang work is complete, and if so, where it is. It isn't on main.
4. Hold payment on the disputed lines until answered. These are questions, not an accusation: there may be an innocent explanation, such as work done outside the repo, pair work, or a commit made later than the work.

*Based on the git history of this repository and docs/billing/INV-0042.txt, checked 22 Oct 2026.*
