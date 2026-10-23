I wrote `change-review-evidence.csv` with 12 rows. These are all the commits that touched `lib/` between 2026-01-01 and 2026-03-31, and I included the PR #212 merge commit.

**Clean (4 rows):**
- `d21c30a`: reviewed by Ben Adeyemi.
- `fa7f9fc`: reviewed by Marta Kowal. The trailer is written lowercase (`reviewed-by`), which git accepts, but you may want to mention it.
- `e37dd19`: reviewed by Chloe Park. The commit also has a Reviewed-by line from its author Ben, which doesn't count.
- `dada197`: the merge of PR #212, reviewed by Marta Kowal.

**Expect the auditor to question these:**
- **No review recorded:**
  - `2f7f724` (safelist cache, Chloe Park).
  - `f70e6a8` (Marta Kowal's revert of `2f7f724`). Reverts are still changes to `lib/`.
  - `ad96886` (Marta Kowal) has only an `Acked-by` from Ben Adeyemi. That is not a Reviewed-by trailer, so you'd have to argue it counts as a review.
- **Self-review only:**
  - `9e9751f` (Ben Adeyemi): the Reviewed-by names Ben himself. The commit email is also `ben.a@laptop.invalid`, which doesn't match his usual address.
  - `bc7e732` (Chloe Park): the Reviewed-by names Chloe herself.
- **Claimed in prose, not as a trailer:** `8465169` (Marta Kowal, cache key format change). The message says Chloe Park agreed in the PR thread, but there's no trailer. You'd need to produce the PR thread itself.
- **Indirect only:** `b07be54` and `268e72a` (both Chloe Park). Neither has a trailer. They arrived through PR #212, whose merge commit carries Marta Kowal's Reviewed-by. I listed Marta as reviewer, but the evidence is on the merge rather than on each commit, so the auditor may want the PR approval record.

The repo can't show whether anyone actually reviewed the unflagged-as-clean commits. A Reviewed-by trailer is only a claim, so for the questioned rows your best evidence is the PR approvals on the hosting platform.