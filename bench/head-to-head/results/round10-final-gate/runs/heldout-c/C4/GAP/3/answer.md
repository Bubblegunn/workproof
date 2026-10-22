I wrote the summary to `q3-summary.md`. It covers what got done without showing any code.

**Shipped:**
- Alpha-channel hex colour support (July 15). It fixed a customer-reported colour issue, and all 212 tests passed.
- Node 22 added to CI (August 12).
- Readme documentation for the alpha syntax (September 30).

**Explored but not landed:**
- A speedup for chained style lookups (August 4). You held off merging it because the numbers looked off, and it's stashed.
- TypeScript types for level detection. They were added on September 19 and reverted on September 24, so there's no net change.

**Left out on purpose:**
- **Personal project:** the recipe-app parser session.
- **Outside Q3:** the October 2 migration-guide draft, which is also uncommitted.
- **Sensitive details:** the July 15 session contained an AWS key and a production database URL with a password, and it named the customer. None of that is in the summary, and the customer appears only as "a customer".
- **Credentials:** since that session export holds live-looking credentials, you may want to rotate them and scrub the files in `session-exports/`.
- **Duplicate export:** `2025-07-15-alpha (copy).jsonl` is identical to the original, so I counted it once.

I haven't committed `q3-summary.md`.