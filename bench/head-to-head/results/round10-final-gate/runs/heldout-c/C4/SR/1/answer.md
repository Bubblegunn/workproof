I wrote the summary to `q3-summary.md`. It describes outcomes only and has no code.

**Shipped:**
- Hex colour strings with an alpha channel, in July, with all 212 tests passing.
- Node 22 added to CI, in August.
- Readme documentation for the alpha syntax, at the end of September.

**Explored but not shipped:**
- The chained-lookup speedup, which benchmarked about 2x faster. You held it back because the numbers looked off, and it's stashed.
- The TypeScript types for level detection, which were committed and then reverted.

**Left out on purpose:**
- **Credentials:** the July alpha session contains an AWS key and a production database URL with a password. I didn't copy them. You should rotate them, since they sit in plain text in the exports.
- **Customer name:** I described the customer-reported problem without naming the customer.
- **Personal project:** the August recipe-app session isn't work.
- **October session:** the migration-guide draft is dated Oct 2, which is outside Q3 and wasn't committed.
- **Duplicate file:** `2025-07-15-alpha (copy).jsonl` is identical to the original, so I counted that work once.

Check that you're comfortable including the two "not shipped" items in a manager-facing doc.