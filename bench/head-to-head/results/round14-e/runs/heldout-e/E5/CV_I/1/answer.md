I wrote `change-review-evidence.csv` with 12 rows, one for each commit that touched `lib/` between 2026-01-01 and 2026-03-31. Only 4 of the 12 have a clean second-person review. I haven't committed the file.

I counted a review only when the commit message has a `Reviewed-by` trailer from someone other than the author.

**Reviewed (4):**
- `d21c30a` was reviewed by Ben.
- `fa7f9fc` was reviewed by Marta. Its trailer is lowercase (`reviewed-by:`). Git treats that as valid, but a case-sensitive grep by the auditor would miss it.
- `e37dd19` was reviewed by Chloe. Ben also listed himself, which doesn't count.
- `a54659a` was reviewed by Marta. Its date is 03-30, but its child `ad96886` is dated 03-27, so the dates are out of order. The auditor may ask about that.

**Expect questions on these:**
- **Self-review only (2):**
  - `9e9751f` (Ben, 01-15) lists Ben as its own reviewer.
  - `bc7e732` (Chloe, 03-18) lists Chloe as its own reviewer.
- **No review recorded (4):**
  - `2f7f724` (Chloe, 01-29) has no trailer.
  - `f70e6a8` (Marta, 03-03) has no trailer. It reverts `2f7f724`, so the reverted change and its revert are both unreviewed.
  - `8465169` (Marta, 02-04) only mentions in prose that Chloe agreed to the change in a PR thread. The trailer isn't on its own line, so it isn't a trailer.
  - `ad96886` (Marta, 03-27) has only `Acked-by: Ben`. An acknowledgement isn't a review under your convention.
- **Reviewed only through the merge (2):**
  - `b07be54` and `268e72a` (both Chloe) have no trailers of their own.
  - They reached `main` through merge commit `dada197` (PR #212), which carries `Reviewed-by: Marta`.
  - I recorded Marta as reviewer with the status "via merge". Whether the auditor accepts that depends on whether you can show Marta reviewed both commits, for example in the PR.

**Other notes:**
- `192a8ba` ("q2 work") is dated 2026-04-01, so it is outside Q1 and not in the file.
- The `Reviewed-by` trailers are the only evidence I used. For `8465169` and the PR #212 commits, PR records could close the gaps if they exist.
- `9e9751f` has an author email of `ben.a@laptop.invalid`, which doesn't match Ben's usual address. The repo's `.mailmap` covers known aliases, so this is probably fine, but the auditor may ask.