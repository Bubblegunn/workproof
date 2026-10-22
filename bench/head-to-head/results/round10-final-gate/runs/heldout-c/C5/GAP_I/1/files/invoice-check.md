# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 hours)

**Bottom line:** The repo history shows that some work was done for each line item. It does not show how long any of it took, and it doesn't confirm the 62 hours. Two of the four items have problems you should raise with Luka before paying in full.

The history records what was saved and when. It has no timers, so hours can't be proven or disproven from it. Time spent on research, meetings or work that was never saved won't show up. Treat the points below as questions to ask, not as findings of overbilling.

## Line by line

| # | Invoice item | Billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 h | Three commits by Luka on 9 Sep, between 10:05 and 12:19 (about 2 h 15 min apart). They add the feature, its tests and a README note, about 58 lines in total. | Work is real and in the main code. The visible activity is far smaller than 20 h. Ask what else took the time. |
| 2 | Multi-language (hreflang) support | 24 h | Three commits by Luka (17, 18 and 26 Sep), about 100 lines. They sit only on a side branch, `feature/hreflang`, and are **not in the main code**. The last commit is labelled "WIP" (work in progress). | Started but not finished or delivered. Billing 24 h for a complete feature is not supported. Ask for the status and whether it will be completed. |
| 3 | Performance work: cache generated sitemap | 12 h | One commit on 22 Sep, about 40 lines. It was made by **Nora Fisher**, not Luka. Her email is on the same company domain as Luka's (lp-dev.example). | Work exists, but Luka did not author it. She may be a colleague at LP Dev. That is fine if the contract allows subcontracting. Ask Luka to confirm who did the work and whether 12 h are Luka's hours or hers. |
| 4 | Fix CI on Ruby 3.3 | 6 h | One commit by Luka on **3 Oct**, which is outside the September billing period. It is a small change that cut the automated test setup from 56 lines to 12. | Dated October, so it should not be on a September invoice. It also removed checks that previously ran on older Ruby versions and the test of building the package. Ask whether that was intended. |

## Other observations

- Luka also committed a dependency update on 15 Sep (a generated file of about 300 lines). It is not on the invoice, so it is not a billing issue.
- Across all four items, the recorded commits add up to roughly 200 lines of changes for 62 billed hours. Line counts are a weak measure, and a few of the code files I opened contain very short, repetitive placeholder-style code. I only looked at the start of two of them, so I'm not drawing a conclusion from this. A technical reviewer could look at it properly.
- Commit times are recorded in Japan time (+0900). I didn't check that against the contract. Dates near month-end could shift by a day.

## Suggested next steps

1. Ask Luka for a time log or notes showing how the 62 hours were spent.
2. Ask about the hreflang status, and whether it will be merged and delivered.
3. Ask who Nora Fisher is and whether her work is included in the hours.
4. Ask for item 4 to be moved to the October invoice, or get an explanation.
5. Consider holding payment on items 2 and 4 (30 h) until these are answered.

*Based on the repository's commit history as of 22 Oct 2026 and the invoice at docs/billing/INV-0042.txt.*
