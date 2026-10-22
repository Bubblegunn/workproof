I've written the note for finance in `invoice-check.md`. The history shows real work on all four invoice items, but it can't confirm the 62 hours. Git records when changes were saved, not how long they took. Several lines also have problems.

- **Sitemap exclusion flag (20 h):** Luka made three small commits on 9 Sep, about 2 hours apart from first to last. They are merged. 20 h looks high for the visible work, so the note suggests asking for a breakdown.
- **Multi-language support (24 h):** The work sits on a separate branch, `feature/hreflang`, and was never merged. The last commit is marked "WIP" (work in progress), so the feature looks unfinished and isn't in the product.
- **Sitemap caching (12 h):** The one commit was written by Nora Fisher, not Luka. She uses an @lp-dev.example address but isn't the invoicing contractor. The code is placeholder-looking functions (`cache_1`, `cache_2`, …) that just add numbers, so it doesn't appear to cache anything.
- **CI fix (6 h):** The commit is dated 3 Oct 2025, outside the September billing period.

The note also recommends asking Luka for time logs and for the status of the hreflang work. It suggests asking who Nora is and who actually wrote the cache. It also suggests asking why October work is on the September invoice.

Commit dates and authors are set on the contractor's own computer and can be edited, so treat them as indicative rather than proof.