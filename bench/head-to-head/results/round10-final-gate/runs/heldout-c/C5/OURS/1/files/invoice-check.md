# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows real work behind every line item, but it can't confirm the hours. Two items have clear gaps (hreflang is unfinished and unmerged; the caching work was committed by someone else). One item was committed in October. Treat this as "work exists, hours unverified" and ask Luka a few questions before paying in full.

Note: commit history records *when and what* was saved, not how long it took. Even in the best case it can only show that work happened, not that it took the billed hours.

| # | Invoice item | Billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | 3 commits by Luka on 9 Sep (feature, tests, docs), about 2 hours apart from first to last. About 58 lines added in total. | Work is real and merged. 20 h looks high for what is visible, though time spent before the first commit wouldn't show. |
| 2 | Multi-language (hreflang) | 24 h | 3 commits by Luka on 17, 18 and 26 Sep, **only on a side branch (`feature/hreflang`), not merged into `main`**. The last commit is labelled "WIP" (work in progress). About 100 lines. | Started, not delivered. Not part of the working product. |
| 3 | Cache generated sitemap | 12 h | 1 commit (40 lines) on 22 Sep, **authored by Nora Fisher**, not Luka. Her email is on the same company domain (lp-dev.example). | Work is real, but Luka didn't commit it. Ask whether Nora is a subcontractor and whether her time is meant to be on Luka's invoice. |
| 4 | Fix CI on Ruby 3.3 | 6 h | 1 commit by Luka dated **3 Oct 2025**, which is outside the September billing period. | Work is real but dated after the period. Should be on October's invoice, or Luka should explain the date. |

**Not on the invoice:** Luka also made a "Update dependencies" commit on 15 Sep (a generated lockfile). It's routine, and it doesn't correspond to any line item.

## Suggested questions for Luka
1. Hreflang: is it finished? If so, where is the code, and can it be merged? If not, should the 24 h be billed in full?
2. Sitemap caching: who did the work, and is Nora covered by this contract?
3. CI fix: why is it dated 3 Oct, and should it move to the October invoice?
4. Exclusion flag: can Luka explain the 20 h given what's visible in the repo (about 2 h of commits)?

## What I could not check
- Actual time spent (meetings, research, design and debugging leave no commits).
- Commit dates and authors are set by the person committing, so they're good evidence but not proof.
- I looked only at this repo's history, including the `feature/hreflang` branch. Work kept elsewhere wouldn't appear.
