I've written the note for finance to `invoice-check.md` in this folder. I didn't run the `/receipts` skill's miner, because it builds a report of Claude Code usage on this machine and says nothing about Luka's hours. I read the repo's git history directly instead.

The history shows some real work for each invoice item, but it can't confirm the 62 hours. Git records what was saved and when, not how long it took.

- **Sitemap exclusion flag (20 h):** The work is there and on the main branch. The three commits were all made on 9 September within about 2¼ hours, so 20 hours is hard to see from the history alone.
- **Multi-language hreflang support (24 h):** The work was only started. It sits on a side branch that was never merged, and the last commit is marked "WIP" and adds 2 lines.
- **Cache the sitemap (12 h):** The one commit was written by Nora Fisher, not Luka. She uses the same company email domain as Luka. The code is ten near-identical placeholder functions, not a working cache.
- **Fix CI on Ruby 3.3 (6 h):** The commit is dated 3 October, which is outside the September billing period. It also deleted most of the old test setup.

The note ends with four questions to put to Luka. These cover a time breakdown for the first two items, whether the hreflang work is finished, who Nora is, and why the CI commit is dated after the period.

The note covers only what the commit history shows. I didn't run or review the code, and commit dates can be edited, so they are indicative, not proof.