# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows real work behind each of the four line items. It cannot confirm the hours, because a commit records what changed and when, not how long it took. Two items don't match the invoice as written, and one is incomplete. We suggest asking Luka about those before paying in full.

## Line by line

| # | Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits on 9 Sep, 10:05–12:19: the feature (32 lines), tests (20 lines) and a README note (6 lines). All of it is merged to `main`. | **Work is real, but the hours look high.** The commits span about 2h15m in one morning. About 58 lines of code and tests in total. Luka may have worked outside those commits (design, investigation), so ask. |
| 2 | Multi-language (hreflang) support | 24 | Three commits on 17, 18 and 26 Sep, all on the side branch `feature/hreflang`. They are **not merged to `main`**. They add about 100 lines. The last commit is labelled "WIP" and adds 2 lines. | **Partly supported, unfinished.** There is a start and some tests, but the feature isn't delivered. The `main` branch contains no hreflang code. 24 h for this much visible output is hard to confirm. |
| 3 | Performance work: cache generated sitemap | 12 | One commit on 22 Sep (40 lines), authored by **Nora Fisher** (an `@lp-dev.example` address), not Luka. | **Work is real, but not by Luka.** Ask whether Nora's time is meant to be billed under Luka's invoice, and whether that was agreed. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct 2025**. | **Outside the invoice period** (1–30 Sep). It belongs on an October invoice. The commit also replaces the whole CI configuration (about 50 lines removed, 8 added) instead of adding Ruby 3.3, so it is worth a technical check that testing coverage wasn't reduced. |

Not on the invoice: a 15 Sep "Update dependencies" commit (a generated lockfile). It's minor and consistent with some unbilled housekeeping.

## What the history can and cannot tell us

- **Supports:** Luka was active on 9, 15, 17, 18 and 26 Sep, and the features described exist in some form.
- **Does not support:** the 62 total hours. Commit timestamps give no measure of effort. Nothing here shows time spent on meetings, research or debugging.
- **Overall pattern:** There were 7 commits by Luka in September, on 5 separate days, plus Nora's one. Even allowing generously for work not captured in commits, that is light for 62 h. The historical record for the last two weeks of September is thin (one WIP commit on the 26th).
- Commit dates can be set by the author, so they are indicative rather than proof.

## Suggested questions for Luka

1. Can you provide a time log or breakdown behind the 20 h and 24 h entries?
2. Is the hreflang work finished? If so, where is it? It's on a side branch and is not in `main`.
3. Was Nora Fisher's cache work meant to be billed on your invoice, and was she approved to work on our project?
4. Should the Ruby 3.3 CI fix (3 Oct) move to the October invoice?

## Suggested handling

- Items 1 and 3: pay once Luka explains the hours (and, for item 3, who did the work).
- Item 2: hold until we know whether the feature is complete and merged, or agree a reduced amount for work delivered.
- Item 4: move to October.
- The items in question total 42 h (items 2, 3 and 4 at 24 + 12 + 6 h). Item 1 (20 h) is a query, not a dispute.

*Source: git history of this repository, compared against `docs/billing/INV-0042.txt`. This is a review of the records, not an audit of the hours worked.*
