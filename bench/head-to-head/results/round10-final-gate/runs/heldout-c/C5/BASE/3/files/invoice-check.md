# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows that some work was done in each area. It does not record hours, so it can't confirm 62 h. Two line items (hreflang, CI fix) have problems worth raising with Luka before payment. One more (caching) needs a question.

## What the history can and can't tell us
Git records *when changes were saved* and *who saved them*, not how long anyone worked. It can show that work exists. It can't show effort, and time spent on research, meetings or unsaved experiments leaves no trace. So the hour counts below are unverified either way.

## Line by line

| # | Invoiced | Hours | What the history shows | Assessment |
|---|----------|-------|------------------------|------------|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep (10:05 to 12:19, Japan time): the feature (32 lines), tests (20 lines) and a README note (6 lines). | **Work is real and on `main`.** It is small, and the commits span about 2¼ hours. Any time beyond that isn't visible. 20 h looks high for this, so ask Luka what the rest covered. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep), about 100 lines, only on a side branch `feature/hreflang`. The last commit is labelled "WIP" (work in progress). | **Not delivered.** It was never merged into `main`, so it isn't part of the product. It's partial work at best. Ask whether it's finished and whether we should pay in full for unfinished work. |
| 3 | Performance: cache generated sitemap | 12 | One commit on 22 Sep, 40 lines. It was made by **Nora Fisher** (a different person, though with the same `lp-dev.example` email domain), not Luka. The file is ten near-identical trivial functions (`cache_1`, `cache_2`...) and doesn't appear to do any actual caching. | **Questionable.** Check whether Nora's time is covered by this invoice, and have someone technical confirm the code does what's claimed. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka dated **3 Oct 2025**, which is after the invoice period. It replaces the whole test setup with a much shorter one. | **Outside September.** It also removed the older Ruby/Jekyll versions and the gem-build check from automated testing, so testing is narrower than before, not just "fixed". Worth asking about. |

## Not on the invoice
Luka also made an "Update dependencies" commit on 15 Sep. It is a 306-line lockfile change and isn't billed as its own item. The listed package names look like placeholders (`gem-1`, `gem-2`...), so a technical reviewer should look at it.

## Suggested questions for Luka
1. How were the 20 h for the exclude flag spent, given the small change and the commits all falling in one morning?
2. Is hreflang finished? Why is it unmerged and marked WIP?
3. Did Nora Fisher do the caching work, and is her time included here? What does that code actually do?
4. Why is the CI fix dated 3 Oct, and why was test coverage reduced?

## What the history does support
- Item 1 is the best-supported piece: the work is delivered and on `main`. Its hours are still unverified.
- The history doesn't contradict that work happened on items 2 and 3, but neither is clearly delivered and working.
- Item 4 was done outside the billing period.

*Based on commits in the repository (all branches) as of 22 Oct 2026. Hours aren't recorded anywhere in it.*
