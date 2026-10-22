# Invoice check: INV-0042 (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows that some work happened, but it can't confirm the 62 hours. It also doesn't fully support two of the four line items. I'd ask Luka a few questions before paying in full.

The repo records what was saved and when. It doesn't record time spent, so it can never prove hours either way. I compared each line item with the commits in the repo.

| # | Invoiced item | Hours | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 | 3 commits by Luka on 9 Sep, between 10:05 and 12:19 (code, tests, README note). About 100 lines in total. | Work is there. The commits span about 2 hours, so 20 h needs an explanation (e.g. work not saved to the repo). |
| 2 | Multi-language (hreflang) | 24 | 3 commits by Luka (17, 18 and 26 Sep). The last is labelled "WIP" (work in progress). **It sits on a separate branch (`feature/hreflang`) and was never merged into the main code.** | Partly supported. The work looks unfinished and isn't part of the product. Ask whether it was delivered and accepted. |
| 3 | Cache the sitemap | 12 | One commit on 22 Sep, **written by Nora Fisher, not Luka.** Her email is at the same company as Luka's (lp-dev.example). | Not supported as Luka's own work. Ask whether Nora billed it separately or whether Luka is billing for a colleague's time. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka, dated **3 Oct 2025**, which is outside the September billing period. It replaces the whole test setup with a much shorter one, so it removes tests on older Ruby versions and a packaging check. | Wrong period. Also bigger than a "fix", so ask whether the removed checks were meant to go. |

**Other observations**
- Luka's last September commit is 26 Sep. Nothing from Luka is dated 27–30 Sep.
- There was a 15 Sep "Update dependencies" commit that isn't on the invoice. It isn't a problem, but it shows the invoice doesn't map neatly to the history.
- The code in the new files (exclusion flag, hreflang, cache) looks very simple. It's mostly small repeated functions rather than obvious sitemap logic. I can't judge quality as a non-engineer would need, so someone technical should look at it before accepting the work as delivered.

**Rough view of the hours**
- Clearly supported by the history: none of the 62 h can be confirmed. Item 1 is the best supported.
- Questionable: item 3 (12 h, someone else's commit) and item 4 (6 h, outside the period). That's 18 h.
- Needs explanation: items 1 and 2 (44 h) against a small amount of visible work.

**Suggested questions for Luka**
1. Do you have time logs or a tracker export backing the hours on each item?
2. Was the hreflang work finished and delivered? Why isn't it merged?
3. Did Nora Fisher do the caching work, and is she billed under this invoice or separately?
4. Why is the CI fix dated October, and why were the older test setups removed?

*Source: the git history of this repo (all branches). I didn't contact anyone or see any time records.*
