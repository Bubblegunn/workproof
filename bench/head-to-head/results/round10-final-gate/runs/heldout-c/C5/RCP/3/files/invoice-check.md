# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repository history shows real work behind each line item, but it does not support the invoice as written. Two items have problems with dates or authorship, and one is unfinished. The history can't prove hours either way, because it records when changes were saved, not how long they took.

## Line by line

| # | Item | Billed | What the history shows |
|---|------|--------|------------------------|
| 1 | Sitemap exclusion flag | 20 h | **Supported.** Luka made 3 commits on 9 Sep 2025 (flag, tests, docs) on the main branch, all within about 2 hours of each other. That is a small amount of code, so 20 h is worth asking about. |
| 2 | Multi-language (hreflang) | 24 h | **Partly supported, not finished.** Luka made 3 commits (17, 18 and 26 Sep) on a side branch, `feature/hreflang`. They were never merged into the main code. The last one is labelled "WIP" (work in progress) and adds only 2 lines. Billing the full 24 h for a feature that isn't delivered needs an explanation. |
| 3 | Cache the sitemap | 12 h | **Not supported as Luka's work.** The only matching commit (22 Sep) was written by **Nora Fisher**, not Luka. Her email is on the same company domain (lp-dev.example), so she may be a colleague or subcontractor of Luka's. Ask whether this was agreed and who is being billed for it. |
| 4 | Fix CI on Ruby 3.3 | 6 h | **Work exists, but outside the billing period.** The commit is by Luka, dated **3 Oct 2025**, after the September invoice period ended. It should appear on October's invoice. |

## Other notes

- A "Update dependencies" commit by Luka (15 Sep) is not on the invoice. It does not offset anything, but it shows some other activity.
- Only item 1 (20 h) is cleanly supported. Items 2, 3 and 4 (42 h) are the ones to query.
- Commit dates can be set by the person committing, so they are indicative, not proof.

## Suggested questions for Luka

1. Who did the sitemap caching work, and is Nora covered by your agreement with us?
2. What is the status of hreflang support, and will it be finished? Is the 24 h for work done so far?
3. Please move the CI fix to the October invoice, or explain the date.
4. Can you give a time log or breakdown for the 20 h on the exclusion flag?

*Based on the git history in this repository as of the commit "Add contractor invoice INV-0042 for reference". I did not review the code quality or test whether the features work.*
