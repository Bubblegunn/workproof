I've written the note to `invoice-check.md`. The repo history doesn't back up the 62 hours as billed. It also can't prove or disprove hours either way, because it records what was saved and when, not time spent.

- **Sitemap exclusion flag (20 h):** The work is there, in three commits on 9 Sep. It's about 58 lines of change, so 20 h looks high, but there may be unrecorded work.
- **Multi-language support (24 h):** This is weakly supported. The main file is 15 near-identical placeholder functions (`x + 1`, `x + 2`, and so on). The last commit is labelled "WIP" and only adds a comment.
- **Cache the sitemap (12 h):** This commit was written by Nora Fisher, not Luka. Nora uses the same company email domain as Luka, so she may be a colleague or subcontractor.
- **Fix CI on Ruby 3.3 (6 h):** The commit is dated 3 Oct, outside the September billing period.

At most 44 h are visible under Luka's name in September, and that's a ceiling because the multi-language work looks unfinished. 12 h are Nora's and 6 h are from October.

The note ends with questions to put to Luka and a suggestion to hold payment on the last three items until he answers. It also flags that the CI commit deletes the old multi-version test setup instead of just adding Ruby 3.3.

I didn't test whether the code works.