I wrote `change-review-evidence.csv` with 12 rows, one for each non-merge commit that touched `lib/` with an author date in Q1. Only 3 of the 12 have a clean second-person `Reviewed-by` trailer, so expect the auditor to question the other 9.

**Clean (3):**
- `d21c30a`: reviewed by Ben Adeyemi.
- `fa7f9fc`: reviewed by Marta Kowal.
- `e37dd19`: reviewed by Chloe Park.

**Questions to expect:**
- **No review trailer (5):**
  - `2f7f724` (safelist cache) has no trailer.
  - `f70e6a8` (its revert) has no trailer.
  - `b07be54` (per-account limits) has no trailer.
  - `268e72a` (per-account limit docs hook) has no trailer.
  - `ad96886` (log throttled keys) has only `Acked-by: Ben Adeyemi`. That isn't a `Reviewed-by`, so I didn't count it.
- **Self-review only (2):** `9e9751f` (Ben) and `bc7e732` (Chloe). In each, the only `Reviewed-by` names the commit's own author. The extra self-trailer on `e37dd19` is ignored, because Chloe's trailer covers it.
- **Review mentioned only in prose (1):** the body of `8465169` (cache key format change) says Chloe agreed in the PR thread. It's written as running text, so git doesn't parse it as a trailer, and I left the reviewer blank. If the PR thread still exists, link it as evidence.

**Judgment calls:**
- **`b07be54` and `268e72a`:** Ben Adeyemi merged both through PR #212 (`dada197`). A merge isn't a review, but PR approvals on GitHub may exist. That is probably your best source of supporting evidence.
- **`fa7f9fc`:** the trailer is lowercase `reviewed-by`. Git parses it as a trailer, so I accepted it. A strict auditor might notice.
- **`a54659a`:** Ben authored it on 30 March, but the commit date is 2 April, so it was likely rebased or amended after the review. I included it by author date. The trailer names Marta, but check she reviewed the final version.
- **`192a8ba`:** it is dated 1 April, so I excluded it.
- **`dada197`:** I left out the merge commit itself, since the work in it is `b07be54` and `268e72a`.
- **`.mailmap`:** it maps `ben.a@laptop.invalid` to Ben. None of the Q1 `lib/` commits use that alias, so it doesn't change any rows.

I didn't commit the CSV.