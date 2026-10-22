# Invoice INV-0042 check: Luka Petrovic, September 2025 (62 h)

**Short version:** The repo history shows that real work was done on some items. It cannot confirm the hours, and it does not support the invoice as written for two of the four items. I'd suggest asking Luka for an explanation before paying in full.

A note on method: the history records *what* was saved and *when*. It does not record time spent. Even in the best case it can only show that work happened, not that it took 20 hours or 62. Hours need Luka's timesheets or other records.

| # | Invoice item | Billed | What the history shows | Verdict |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | Three commits by Luka on 9 Sep, 10:05–12:19 (Japan time): the feature (32 lines), tests (20 lines) and a README note (6 lines). A small, complete piece of work on `main`. | Work is real and finished. 20 h looks high for roughly 58 lines, and the commits cover about 2¼ hours. |
| 2 | Multi-language (hreflang) support | 24 h | Three commits by Luka (17, 18 and 26 Sep) exist only on a side branch, `feature/hreflang`. They were never merged into `main`. The last commit is labelled "WIP" (work in progress). | Started but **not finished or delivered**. Billing it as a completed item isn't supported. |
| 3 | Performance: cache generated sitemap | 12 h | One commit on 22 Sep, 40 lines, authored by **Nora Fisher** (same company email domain), not Luka. The file contains only ten near-identical placeholder functions (`cache_1`, `cache_2`, …) and doesn't look like a working cache. | Not Luka's commit, and the content doesn't look like real caching. Needs explanation. |
| 4 | Fix CI on Ruby 3.3 | 6 h | One commit by Luka on **3 Oct**, which is outside the September billing period. It replaced the whole test-automation file with a much shorter one. Earlier tests on Ruby 2.5–3.0 and Jekyll 3.9, and the gem-build check, were removed. | Dated October, not September. It also removed existing test coverage rather than just adding Ruby 3.3, which we may want to check. |

## Other observations

- A 15 Sep "Update dependencies" commit by Luka (a 306-line lockfile) isn't an invoice line. It may be folded into one of the items.
- Luka's 8 commits in total are spread over only 5 working days: 9, 15, 17, 18 and 26 Sep (plus 3 Oct). Nothing in the history shows continuous work across the month. Work that leaves no commits, such as meetings, research or review, wouldn't show up either, so that alone isn't proof of over-billing.
- Dates and times are the ones Luka's computer recorded. They can be set to anything, so treat them as indicative.

## Suggested next steps

1. Ask Luka for timesheets or a breakdown supporting the 62 hours.
2. Ask whether the hreflang work (24 h) is finished. If so, where is it? If not, it shouldn't be billed as complete.
3. Ask why the caching commit is under Nora Fisher's name and why it contains placeholder functions. Also ask whether Nora is a separate billable person.
4. Ask why the CI fix is dated 3 Oct and why earlier test coverage was removed. It could be billed in October instead.
5. Consider paying only the part that is supported until these are answered. Item 1 is clearly delivered, but the number of hours is still unverified.

*Prepared from the git history of this repository (commits up to 6 Oct 2025). I haven't run the code or tested whether any feature works.*
