I wrote `change-review-evidence.csv` with 12 rows, one per commit that changed `lib/` in Q1 2026. Only 4 of the 12 have a valid second-person review.

I dated each change by its author date. That puts `a54659a` in Q1: it was authored on 30 March but committed on 2 April. `192a8ba` ("q2 work", 1 April) is out of the window.

**Reviewed (4):** `d21c30a`, `fa7f9fc`, `e37dd19` and `a54659a`.

**Expect the auditor to question these (8):**
- **Self-review only:**
  - `9e9751f` (Ben Adeyemi, 15 Jan) lists Ben Adeyemi as its only reviewer. Its author email differs (`ben.a@laptop.invalid`), but the name matches. I treated them as the same person, so please confirm that.
  - `bc7e732` (Chloe Park, 18 Mar) was "reviewed" by Chloe Park.
- **No review trailer:**
  - `2f7f724` (Chloe Park, 29 Jan, safelist cache).
  - `b07be54` (Chloe Park, 6 Mar, per-account limits).
  - `268e72a` (Chloe Park, 8 Mar, per-account limit docs hook).
- **No trailer, but something that looks like evidence:**
  - `8465169` (Marta Kowal, 4 Feb) mentions in its message text that Chloe reviewed it in a PR thread. It has no actual trailer, so the PR thread would need to be produced.
  - `ad96886` (Marta Kowal, 27 Mar) has an `Acked-by` from Ben Adeyemi. An acknowledgement is not a `Reviewed-by`, so it won't count unless you can show it was a review.
- **Revert:** `f70e6a8` (Marta Kowal, 3 Mar) reverts the safelist cache and has no review. The auditor may accept a revert without one, but it is still a change to `lib/`.

**Judgement calls:**
- `fa7f9fc` uses a lowercase `reviewed-by:`. Git reads trailers case-insensitively, so I counted it, but a strict text match would miss it.
- `e37dd19` lists two reviewers, Ben Adeyemi and Chloe Park. Ben is the author, so only Chloe counts, and the CSV shows her as the reviewer.

The trailers only show who is named as reviewer. They don't show that a review took place or when, so for the 8 gaps the PR records are your fallback evidence.