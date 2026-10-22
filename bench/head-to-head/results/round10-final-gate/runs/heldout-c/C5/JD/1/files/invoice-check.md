# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows real work for some line items but cannot confirm hours. Two items have caveats worth raising with Luka before paying in full.

The history only records *what changed and when*, not how long it took. It can support "this work happened". It can't prove "this took 20 hours".

| # | Invoice item | Billed | What the history shows |
|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | **Supported (work exists).** Luka made 4 commits on 9 Sep 2025 (10:05–12:19): the feature, tests and documentation. About 58 lines of new code, tests and docs. The commits span about 2 hours, so 20 h would mean most of the effort wasn't visible in the history. Ask Luka to explain. |
| 2 | Multi-language (hreflang) support | 24 h | **Partly supported, unfinished.** Luka's work (17–26 Sep) is on a separate branch, `feature/hreflang`, and was **never merged into the main codebase**. The last commit is labelled "WIP" and adds 2 lines. The feature is not delivered in the main product. Confirm with Luka whether it's finished and whether it should be billed in full. |
| 3 | Cache generated sitemap | 12 h | **Work exists, but not by Luka.** The only commit (22 Sep) was authored by **Nora Fisher**, who uses the same `lp-dev.example` email domain, so probably another LP Dev person. The invoice lists only Luka. The code is also placeholder-looking: 10 near-identical functions (`cache_1` … `cache_10`) that don't appear to do any real caching. Worth asking whether the work is real and who did it. |
| 4 | Fix CI on Ruby 3.3 | 6 h | **Work exists, but is dated outside the period.** Committed 3 Oct 2025, after the September billing period. It replaced the whole test setup (56 lines removed, 12 added), so it dropped older Ruby versions and the gem-build check rather than just adding 3.3 support. Check that this was intended. |

Another commit, "Update dependencies" (15 Sep), is not on the invoice. It's a single added lockfile, so it adds little evidence of effort.

## What we can and can't say

- **Supported:** Luka did commit work on the flag (item 1) and started hreflang (item 2) in September.
- **Not supported by history:** any of the hour counts. Total commits are few and small for 62 h, though much work (research, debugging, meetings) leaves no trace in the history.
- **Questionable:** item 3 (different author, placeholder-looking code), item 2 (unmerged), item 4 (October date).

## Suggested next steps

1. Ask Luka for time logs or a short breakdown behind each line item.
2. Ask who Nora Fisher is and whether item 3 should be billed under this invoice.
3. Ask whether the hreflang branch is complete and should be merged, or whether to pay only for finished work.
4. Ask about the October date and the reduced CI setup for item 4.

*Basis: git history of this repo, including the `feature/hreflang` branch, compared with docs/billing/INV-0042.txt. I haven't tested whether the code works.*
