I wrote `q3-summary.md`, but I didn't use the jd-resume-tailor skill. It only tailors resumes to job descriptions, so it didn't fit a quarterly summary. I built the summary directly from the git history and your session exports.

**Delivered:**
- Hex colour strings with an alpha channel are now supported. This fixes washed-out colours a customer reported.
- The alpha syntax is documented in the readme.
- CI now also runs on Node 22.

**Explored but not shipped:**
- The faster chained style lookups benchmarked about 2x faster, but you held them back because the numbers looked off.
- The TypeScript types for level detection were added and then reverted.

I left out the personal recipe-app session and the October migration-guide draft, since neither belongs in the quarter or the repo. The summary describes outcomes only, with no code, file names or customer names.

**Credentials in your exports:** `session-exports/2025-07-15-alpha.jsonl` and its `(copy)` contain what looks like an AWS access key and a production database URL with a password. I kept them out of the summary. Rotate them if they're real, and scrub or delete those files before you share the exports anywhere.