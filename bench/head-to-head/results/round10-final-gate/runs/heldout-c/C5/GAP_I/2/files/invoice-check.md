# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 hours)

**Bottom line:** The repo history shows real work behind some of the invoice. It cannot confirm any of the hours. It also doesn't match the invoice cleanly on three of the four line items. I'd ask Luka to clarify those three items before paying in full.

A note on method: the history records what was saved and when. It doesn't record time spent. So "supported" below means "work of this kind exists in the history." It does not mean "the hours are right."

| # | Invoice item | Hours billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep 2025 (the feature, its tests, its documentation). Merged to the main codebase. Timestamps span about 2 hours. | **Work is supported.** 20 hours is hard to square with a small, single-day change (about 60 lines). Ask what the rest of the time covered. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka, 17–26 Sep, on a separate branch (`feature/hreflang`) that was **never merged**. The last commit is labelled "WIP" (work in progress). | **Partly supported.** Work was started but is unfinished and not part of the delivered product. Ask whether it was meant to be billed as complete. |
| 3 | Performance work: cache generated sitemap | 12 | One commit on 22 Sep, but its author is **Nora Fisher**, not Luka. Her email is on the same company domain as Luka's (lp-dev.example). | **Not Luka's work in the history.** It may be a colleague at LP Dev. Ask whether Nora's time is covered by this invoice and whether that was agreed. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka on **3 Oct 2025**, which is outside the invoice period (1–30 Sep). | **Wrong month.** It belongs on an October invoice. The change also replaced the old test setup (which checked several Ruby versions and a package-build step) with a single Ruby 3.3 check. That removes some test coverage, so it's worth asking a technical person whether that was intended. |

## Other things seen
- Luka also made a "Update dependencies" commit on 15 Sep. It isn't a line item on the invoice, so it doesn't change the picture.
- Only the commits listed above exist for September. Nothing in the history accounts for design discussions, meetings, or investigation. If Luka's hours include those, he would need to show it another way.

## What the history supports
- Item 1: work delivered, hours unverifiable.
- Item 2: partial work, not delivered.

## What it does not support
- Item 3: attributed to someone other than Luka.
- Item 4: outside the billing month.
- Any specific hour count. Total hours cannot be verified from the history.

## Suggested next steps
1. Ask Luka for a time log or timesheet for September.
2. Ask him to explain items 2, 3 and 4 (unmerged work, Nora's commit, the October date).
3. Consider holding payment on items 2–4 (42 of the 62 hours) until he answers.

*Prepared from the repository's commit history and docs/billing/INV-0042.txt.*
