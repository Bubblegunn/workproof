# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows that work happened on all four invoice items. It does not show how many hours it took. It can't confirm or refute the 62 h. Several items need a question put to Luka before we pay in full.

A note on method: the history records *when* changes were saved and *how big* they were. It has no timesheet. Commit dates give a rough floor for elapsed time, but they say nothing about research, meetings, or work that was never saved.

| # | Invoice item | Billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | 3 commits by Luka, all on 9 Sep between 10:05 and 12:19 (about 2 h 15 min apart). About 58 lines added (code, tests, docs). | Work is real and on the main codebase. The commits cover roughly 2 hours, against 20 billed. Ask what the other time was spent on. |
| 2 | Multi-language (hreflang) support | 24 h | 3 commits by Luka (17, 18 and 26 Sep), about 100 lines. They are only on a side branch, `feature/hreflang`, and **not in the main codebase**. The last one is labelled "WIP" (work in progress). | Work started but is **unfinished and not delivered**. Billing the full 24 h for a complete feature isn't supported. |
| 3 | Cache the sitemap | 12 h | 1 commit, 22 Sep, about 40 lines. It was made by **Nora Fisher**, not Luka (same company email domain, `lp-dev.example`). | Work exists, but someone else did it. Ask whether Nora is a subcontractor and whether our contract allows that. A reviewer should also check that the code does what the title says. |
| 4 | Fix CI on Ruby 3.3 | 6 h | 1 commit by Luka, dated **3 Oct**, which is outside the September billing period. It is a small edit that mostly **deletes** the old test setup (net 44 lines removed). | Outside the stated period. The change also removes the earlier tests on older Ruby versions, so it needs a technical check that nothing was lost. |

## Other things we noticed
- A 15 Sep commit, "Update dependencies" (Luka), isn't on the invoice. It is one generated file of about 300 lines, so it likely took little effort. It doesn't explain the gaps above.
- The only commits by Luka in September are on 9, 15, 17, 18 and 26 Sep. Nothing in the history shows the amount of work per day.
- The invoice itself was added to the repo by Maya Chen on 6 Oct, for reference only.

## Suggested next steps
1. Ask Luka for a timesheet or a breakdown of hours per item, especially item 1 (20 h) and item 2 (24 h).
2. Ask whether Nora Fisher worked on this under the contract (item 3).
3. Ask whether item 4 (3 Oct) should be billed in September or moved to the next invoice.
4. Ask whether hreflang is finished. If not, consider paying only for completed work or holding that line.
5. If wanted, have a developer review the code quality for items 3 and 4.

*Based only on the repository's git history as of 22 Oct 2026. No time-tracking records were available.*
