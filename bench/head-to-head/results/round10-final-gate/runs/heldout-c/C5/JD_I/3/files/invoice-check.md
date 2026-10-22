# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows real work for most line items, but it can't confirm the hours. Two items have caveats worth raising with the contractor before paying in full.

Commit history shows *that* work happened and roughly when. It does not record time spent, so none of these hour figures can be verified from it. This check only tests whether each line item has matching work.

| # | Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sept (code, tests, docs), about 2 hours apart, roughly 58 lines added in total. | **Work is there.** The output is small for 20 h, but time spent on design or investigation wouldn't show up in commits. Ask for a breakdown. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka on 17, 18 and 26 Sept, but only on a separate branch (`feature/hreflang`). It was never merged into `main`. The last commit is labelled "WIP" and is a 2-line change. | **Partly supported.** Work was started, but it's unfinished and not delivered in the main code. Ask whether the 24 h is meant to cover finished work, and what the status is. |
| 3 | Performance work: cache generated sitemap | 12 | One commit on 22 Sept, by **Nora Fisher**, not Luka. Her address is also at lp-dev.example, so she looks like someone at Luka's company. The file is 40 lines of repetitive placeholder-style functions (`cache_1`, `cache_2` and so on). | **Weak.** The work is attributed to someone else, and the content doesn't look like a real caching feature. Ask who did it and whether it works. A non-technical read can't judge the code; have an engineer review it. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka on **3 Oct 2025**, which is outside the invoice period (1–30 Sept). It changes one config file (8 lines added, 52 removed). | **Date mismatch.** The work exists but was done in October. Ask why it's billed in September. It could be billed in the October invoice instead. |

## Other observations

- A "Update dependencies" commit by Luka on 15 Sept (a 306-line lock file) doesn't match any invoice line. It's likely a routine automated change, so it isn't a concern by itself.
- 44 of the 62 hours (items 1 and 2) are tied to Luka's own September commits, though item 2 is unfinished. The other 18 hours (items 3 and 4) are attributed to someone else or dated outside September.
- All work activity in September falls on 9, 15, 17, 18, 22 and 26 Sept. That's a few days, which isn't inconsistent with 62 h but doesn't demonstrate it either.

## Suggested next steps

1. Ask Luka for a short time log or breakdown per item.
2. Ask about the status of the hreflang work (item 2) and whether it will be delivered.
3. Ask who Nora Fisher is, and whether subcontractor work is covered by the contract (item 3).
4. Ask for item 4 to be moved to the October invoice.
5. Consider having an engineer review the caching code (item 3).

*Prepared from the repository's git history and docs/billing/INV-0042.txt.*
