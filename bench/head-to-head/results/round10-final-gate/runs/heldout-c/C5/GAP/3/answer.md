I've written the note to `invoice-check.md`. The history shows that all four invoiced items exist in some form, but it can't confirm the 62 hours. Commit dates only show when work was saved, not how long it took. Only a timesheet can show that.

- **Exclusion flag (20 h):** This was delivered and is in the product. The history shows three small commits by Luka within about 2 hours on 9 Sep, so 20 h looks high.
- **Hreflang (24 h):** This is only partly supported. The work sits on an unmerged branch, and the last commit is labelled "WIP". It isn't in the product yet.
- **Sitemap cache (12 h):** This was delivered, but the commit was authored by Nora Fisher, not Luka. She has the same company email domain. The code also looks like filler (numbered placeholder functions), so a developer should check that it does real caching.
- **CI fix (6 h):** This was committed on 3 Oct, outside the September billing period. It also removed older test checks.

The note ends with suggested questions for Luka. I only read the commit history, and I didn't run or review the code.