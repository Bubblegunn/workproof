# Invoice INV-0042 (Luka Petrovic, September 2025): check against repo history

**Invoice:** 62 hours across four items. **Source checked:** the git history of this repo (all branches).

**Important limit:** commit history shows what code was saved and when. It does not record time spent. It can show whether the billed work exists. It cannot confirm or refute the hours. Hours would need timesheets or similar.

## Item by item

| # | Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Feature, tests and README note committed by Luka on 9 Sep (3 commits within about 2 hours, about 58 lines). Merged into `main`. | **Work exists.** The commits cover roughly 2 hours of activity. Whether it took 20 hours is not shown. Worth asking about. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep, about 100 lines). The last is labelled "WIP". They sit only on the side branch `feature/hreflang`. They are **not in `main`**, and the file is not in the delivered code. | **Partly supported, not delivered.** It is unfinished work that has not been merged. Ask whether it is complete before paying in full. |
| 3 | Performance work: cache generated sitemap | 12 | One commit (22 Sep, 40 lines), authored by **Nora Fisher**, not Luka. Her email is at the same company as Luka (`lp-dev.example`). | **Work exists, but someone else wrote it.** It may be a colleague at Luka's firm, which would be legitimate if it is permitted under the contract. Ask Luka to confirm. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct 2025**, which is outside the invoice period (1–30 Sep). It replaces the CI configuration with a much shorter one (8 lines added, 52 removed). | **Outside the billing period.** It also removes most of the existing test setup. It does not obviously add Ruby 3.3, which is worth a technical look. |

## Other points

- Luka also made a "Update dependencies" commit on 15 Sep (an automatically generated lock file). It is not on the invoice.
- Luka's commits are dated 9 Sep and 15–26 Sep. There is nothing between 27 and 30 Sep, and nothing on 1–8 Sep.
- Total commit activity from Luka and Nora in September is small: 8 commits, about 570 lines, most of them a generated lock file.

## Summary for finance

- **Supported by history (work exists):** item 1 (20 h) and, with a caveat about who wrote it, item 3 (12 h).
- **Partly supported:** item 2 (24 h). The work is unfinished and not merged.
- **Not supported as billed for September:** item 4 (6 h). It is dated October.
- **Hours:** none of the hour figures can be verified from history. The visible commit activity looks small for 62 hours, but people also spend time on design, review and testing that leaves no commits.

## Suggested next steps

1. Ask Luka for timesheets or a breakdown of the hours for items 1 and 2.
2. Ask whether Nora Fisher worked on item 3 under this contract.
3. Ask whether item 2 is finished and when it will be merged.
4. Move item 4 to the October invoice, or confirm why it was billed for September.
5. Ask someone technical to look at the CI change in item 4.
