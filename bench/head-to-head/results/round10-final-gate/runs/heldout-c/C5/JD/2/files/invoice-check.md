# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows that work happened on three of the four invoiced items. It cannot confirm the hours. One item (multi-language support, 24 h) is not finished or delivered. One item (caching, 12 h) was committed by someone else.

## What the history shows, item by item

| # | Invoiced item | Hours | What the history shows | Verdict |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 | Three commits by Luka on 9 Sep (feature, tests, README note), 10:05–12:19. The feature is on the main branch. | Work is present. About 2 h of commit activity against 20 h billed. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep). The last one is labelled "WIP". They are on a side branch (`feature/hreflang`) and were never merged into main. | Not delivered. Started, but unfinished and not in the product. |
| 3 | Cache generated sitemap | 12 | One commit on 22 Sep, authored by **Nora Fisher** (nora@lp-dev.example), not Luka. It is on main. | Work is present, but not by Luka. Ask whether Nora's time is part of Luka's firm's billing. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka on 3 Oct, which is **after** the invoice period (1–30 Sep). It replaces the whole CI setup with a much shorter one. It drops the older Ruby versions and the "build the package" check that were tested before. | Work is present, but dated outside September. It also removed existing test coverage, which is worth asking about. |

## What the history cannot show

- **Hours.** Git records when a change was saved, not how long it took. Reading and planning, meetings and debugging leave no trace. The history neither proves nor disproves 62 h.
- **Quality.** The code in these commits looks like placeholder content (short repeated stub functions). I did not run or assess it. Someone technical should check that the features work.
- **Unbilled work.** A "Update dependencies" commit (15 Sep) is not an invoice line. It may be covered elsewhere or inside another item.

## Suggested questions for Luka

1. Item 2: Is hreflang support finished? If not, what is the status, and should the 24 h be billed in full or held until it is merged?
2. Item 3: Nora Fisher made this change. Is she part of LP Dev, and is her time included in the 62 h?
3. Item 4: Why is it dated 3 Oct, and should it be billed in October's invoice? Why were the older Ruby versions and the package-build check removed?
4. Item 1: 20 h is a lot for a change that shows about 2 h of commit activity. Can Luka describe the other time?
5. Can Luka provide time logs or notes behind the hours?

## Bottom line

On the history alone, about **6 h (CI) look out of period**, **24 h (hreflang) look undelivered**, and **12 h (caching) were done by a different person**. Only the 20 h exclusion-flag item is cleanly Luka's and in the product, and even its hours are unverified. I would not pay in full until the questions above are answered.
