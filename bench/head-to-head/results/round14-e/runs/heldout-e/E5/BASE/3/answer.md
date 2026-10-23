I wrote `change-review-evidence.csv` with 11 rows, one for each non-merge commit that touched `lib/` between 2026-01-01 and 2026-03-31. Only 3 of the 11 have an independent reviewer on record.

**Reviewed (3):**
- `d21c30a`: Marta's change, reviewed by Ben.
- `fa7f9fc`: Chloe's change, reviewed by Marta. The trailer is written lower-case (`reviewed-by`). Git reads it as a valid trailer, but the auditor may notice the casing.
- `e37dd19`: Ben's change, reviewed by Chloe. Ben also listed himself as a reviewer, and I ignored that line.

**Expect questions on these 8:**
- **No review recorded (5):**
  - `2f7f724`: Chloe's "safelist cache".
  - `f70e6a8`: Marta's revert of that safelist cache. It's a revert, but it still changes `lib/`.
  - `b07be54` and `268e72a`: Chloe's per-account limits commits. They were merged through PR #212 (merge `dada197`, by Ben), and a PR approval may exist, but nothing in git records it.
  - `ad96886`: Marta's "log throttled keys". Its trailer is `Acked-by: Ben`, which is not a `Reviewed-by`.
- **Self-review only (2):**
  - `9e9751f`: Ben reviewed his own change. Its author email is `ben.a@laptop.invalid`, which differs from his usual address.
  - `bc7e732`: Chloe reviewed her own change.
- **Review mentioned but not recorded (1):** `8465169` is Marta's cache key format change. The message says Chloe reviewed it "in the PR thread", but that text is prose, not a trailer. Chloe's PR comment would settle it.

**Scope:**
- I left out merge `dada197`. It adds nothing of its own, and its two commits are already in the list.
- `192a8ba` ("q2 work") is dated 2026-04-01, so it falls outside the quarter.

For the five commits with no review recorded and `8465169`, the PR approvals, if they exist, would be the best supporting evidence.