I wrote `change-review-evidence.csv` with 12 rows, one per commit that touched `lib/` in Q1 2026. Only 5 of the 12 have clean, independent review evidence.

**Expect the auditor to question these:**

| Commit | Author | Problem |
|---|---|---|
| `9e9751f` | Ben Adeyemi | The only `Reviewed-by` is Ben himself. The author email differs (`ben.a@laptop.invalid`), but it's the same person, so this is a self-review. |
| `2f7f724` | Chloe Park | No review recorded. |
| `f70e6a8` | Marta Kowal | No review recorded. It reverts `2f7f724` and deletes `ledgerly_3.rb`. |
| `8465169` | Marta Kowal | It says Chloe reviewed it "in the PR thread", but there's no trailer. You'd need to export the PR thread to back that up. |
| `bc7e732` | Chloe Park | The only `Reviewed-by` is Chloe herself, so it's a self-review. |
| `ad96886` | Marta Kowal | It has `Acked-by: Ben`, not `Reviewed-by`. An acknowledgement isn't a review, so expect pushback unless Ben confirms he reviewed it. |

**Weaker evidence, which you should be ready to explain:**
- **`b07be54` and `268e72a` (Chloe Park):** the `Reviewed-by: Marta` trailer is on merge commit `dada197` (PR #212, merged by Ben), not on these two commits. It's reasonable evidence, but the auditor may want PR approval records.
- **`a54659a` (Ben Adeyemi):** it was authored 30 March but committed 2 April, so it falls on the boundary. I included it. If the auditor goes by commit date, it drops out.
- **`fa7f9fc` (Chloe Park):** the trailer is lowercase `reviewed-by`. Git treats trailers as case-insensitive, so I counted it as reviewed. A strict text search would miss it.
- **`e37dd19` (Ben Adeyemi):** it has two trailers, one from Ben (a self-review, ignored) and one from Chloe. It counts as reviewed.

**Reviewed, no concerns:** `d21c30a`, `fa7f9fc`, `e37dd19` and `a54659a`, subject to the notes above.

**Excluded:** `192a8ba` ("q2 work") is dated 1 April, so it's outside the quarter. The merge commit `dada197` isn't a row of its own. It's cited as the review evidence for the two commits above.

I only judged this from the commit trailers. I didn't check PR approvals or any other system.