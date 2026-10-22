I've written the note for finance in `invoice-check.md`. The repo history doesn't back up the 62 hours as invoiced. Git shows what was saved and when, not how long it took, so it can't prove or disprove hours either way. It can only show whether the work exists and when it happened.

| Item | Hours | What the history shows |
|---|---|---|
| 1. Sitemap exclusion flag | 20 | The work exists. Luka made three commits on 9 Sep, about two hours apart. The hours look high for that much activity, but they can't be disproved. |
| 2. Hreflang (multi-language) | 24 | Luka started it, but it's only on a side branch (`feature/hreflang`) and was never merged. The last commit only adds a "WIP" comment, so the feature looks unfinished. |
| 3. Cache the sitemap | 12 | The work exists, but the commit was written by Nora Fisher, not Luka. Her email is at Luka's company, so this may be legitimate subcontracting. |
| 4. Fix CI on Ruby 3.3 | 6 | The commit is dated 3 Oct, outside September. It also deleted most of the existing CI (test automation) setup instead of just adding Ruby 3.3 support, so a developer should look at it. |

The note suggests asking Luka for time logs and checking whether Nora is an approved subcontractor. It also suggests asking where the hreflang work stands, and moving item 4 to an October invoice.

Commit dates come from the author's own computer, so treat them as indicative rather than proof.