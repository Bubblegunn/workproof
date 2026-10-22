I wrote the summary to `q3-summary.md`. It's built from the git history and the session exports, and it describes what got done without showing code.

**Receipts skill:** I didn't use its miner. It only takes a trailing day count and reads `~/.claude/projects`, so it can't cover a fixed July–September window or `session-exports/`. I read the five commits and the exports directly instead. As a result there's no HTML receipt or spend-share table.

**What's in it:**
- **Shipped:** hex colours with an alpha channel (July), Node 22 added to CI (August), and the alpha syntax documented in the readme (September).
- **Not shipped:** the August speed-up, which you held back because the numbers looked off. Also the TypeScript types, which were reverted after five days.

**What I left out, and why:**
- **Leaked credentials:** the 15 July session export contains what look like an AWS key and a production database connection string with a password. Those are in your exports, not in the summary. Consider rotating them, and scrub the files before sharing the folder. The same session names a customer, a hospital, and I kept that out of the summary too.
- **Personal project:** the recipe-app session wasn't work for this repo, so it isn't in the summary.
- **Out of period:** the 2 October migration-guide session falls outside Q3.
- **Duplicate export:** `2025-07-15-alpha (copy).jsonl` is identical to the original, so I counted that session once.

I didn't add any hours-saved or time-saved figures, because nothing in the data supports one. If you have a concrete win to add by hand, such as the customer fix landing, it would strengthen the review doc.