# Check of Invoice INV-0042 (Luka Petrovic, September 2025, 62 h) against repo history

**Bottom line:** The history shows real work for each of the four invoice items. It can't confirm the hours. Git records when changes were saved, not how long they took. Three items also have issues worth raising with Luka before paying in full.

| # | Invoice item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 | 3 commits by Luka on 9 Sep (10:05–12:19): the feature (32 lines), tests (20 lines), README note (6 lines). Merged to main. | Work is present and small. The commits span about 2 hours of clock time. 20 h is not obviously supported, though there may be unrecorded work (design, testing, meetings). **Ask for an explanation.** |
| 2 | Multi-language (hreflang) | 24 | 3 commits by Luka (17, 18 and 26 Sep) on a separate branch, `feature/hreflang`. **Not merged into main.** The last commit is labelled "WIP" (work in progress), and the feature file is about 60 lines. | Work started but unfinished and not delivered. Billing the full 24 h for a feature that isn't in the product is questionable. **Ask for status and whether it is complete.** |
| 3 | Cache generated sitemap | 12 | One commit on 22 Sep, authored by **Nora Fisher** (a different person, though with an @lp-dev.example address). The code is 40 lines of placeholder-looking functions (`cache_1`, `cache_2`, … that just add numbers). It doesn't appear to do any real caching. | Not Luka's commit, and the content doesn't look like a working cache. **Ask who did the work, whether Nora is covered by the contract and rate, and what the code actually does.** |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka on **3 Oct 2025**, which is **outside the invoice period** (1–30 Sep). It changes the automated-test setup file (8 lines added, 52 removed). | Work is real, but dated after September. It belongs on an October invoice, or Luka should explain the date. |

## Other observations
- A commit on 15 Sep ("Update dependencies", 306 lines) is **not on the invoice**. It is an automatically generated file, so it likely took little time.
- In total, 8 commits are dated within September (5 on main, 3 on the unmerged hreflang branch), plus the 3 Oct one. All are small.
- Commit dates and authors come from the contractor's own computer and can be edited, so they are indicative rather than proof.

## What the history can and can't support
- **Supports:** work on all four topics took place, mostly in September, with the exclusion flag finished and merged.
- **Doesn't support:** the 62 hours total. Nothing records time spent. Visible clock time on the commits is far below 62 h, though that is normal since much work isn't committed.
- **Contradicts or complicates:** item 2 is unfinished and unmerged, item 3 was authored by someone else, and item 4 is dated October.

## Suggested next step
Before approving, ask Luka for: (a) time logs or a breakdown behind each line, (b) the status of the hreflang work, (c) who Nora Fisher is and who wrote the cache, and (d) why the 3 Oct work is on the September invoice. Hours for items 2–4 (42 h) are the ones most in question; item 1 (20 h) is also higher than the visible work suggests.
