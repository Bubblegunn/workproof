# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history supports the *existence* of work on all four line items, but not the hours. Two items have problems worth raising with Luka before paying in full.

Note: the repo history records when changes were saved, not how long they took. It can show that work happened, but it can never confirm a number of hours. Hours would need timesheets or similar from Luka.

## Line by line

| # | Invoice item | Hours billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 | Three commits by Luka on 9 Sep 2025 (10:05–12:19): the feature (32 lines), tests (20 lines), and a README note (6 lines). | **Work is present and in the right month.** All of it was committed within about 2 hours of the first commit, which is a lot less than 20 h. Ask what the rest of the time covered. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka, 17–26 Sep: initial code (60 lines), tests (40 lines), and a final commit labelled "WIP" (work in progress, 2 lines, only a comment). | **Partly supported, and not finished.** The work is only on a side branch (`feature/hreflang`) and has **not** been merged into the main codebase. The last commit says it is still in progress. Confirm with Luka whether it is complete and delivered. |
| 3 | Cache generated sitemap | 12 | One commit on 22 Sep (40 lines), **authored by Nora Fisher** (nora@lp-dev.example), not Luka. | **Questionable as billed by Luka.** The work is real and in September, but someone else wrote it. Ask whether Nora is a subcontractor and whether her time is meant to be on Luka's invoice at his rate. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka on **3 Oct 2025** (8 lines added, 52 removed). | **Outside the invoice period** (1–30 Sep). The work looks real but was done in October. It also deleted most of the previous test setup (older Ruby versions, gem-build check), so the client may want to ask whether that was intended. |

## Other observations

- Luka's September history is 8 commits over about 4 working days (9, 15, 17, 18, 22 and 26 Sep). A "Update dependencies" commit on 15 Sep (a generated file of 306 lines) is not an invoiced line item.
- The code is quite small overall (roughly 250 lines in total across all items), and some of the code files contain very repetitive placeholder-style functions (for example `hreflang_1`, `hreflang_2`, ...). I'm not a substitute for a developer review, but a technical reviewer should confirm the code does something useful.
- The invoice file itself was added to the repo on 6 Oct 2025 by Maya Chen, so it is not evidence of work.

## Suggested next steps

1. Ask Luka for timesheets or a breakdown supporting the 62 h, especially item 1 (20 h) against roughly 2 h of visible activity.
2. Ask about item 2's status and have it merged or reviewed if it's meant to be delivered.
3. Ask who Nora Fisher is and whether item 3 should be billed under Luka's name.
4. Move item 4 (6 h) to October's invoice, or get agreement to include it in September.

If items 3 and 4 were removed, the supportable total would be at most 44 h (20 + 24), before the questions above on hours.
