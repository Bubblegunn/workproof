I wrote `change-review-evidence.csv` with 12 rows, one per commit that changed `lib/` in Q1 2026. Only 4 of the 12 have a valid second-person `Reviewed-by` trailer.

**How I counted:** I used author date for the window. I read the trailers with read-only git. A review only counts if the trailer names someone other than the author.

**Valid review (4):**
- `d21c30a`, reviewed by Ben Adeyemi.
- `fa7f9fc`, reviewed by Marta Kowal. The trailer is written lowercase (`reviewed-by`), so it's worth fixing in future even though it counts.
- `e37dd19`, reviewed by Chloe Park. It also carries a self-review trailer from Ben Adeyemi, the author. That trailer doesn't count, but it isn't harmful.
- `a54659a`, reviewed by Marta Kowal. It was authored 30 March but committed 2 April, after quarter end. I included it by author date, so the auditor may ask which date applies.

**Expect questions (8):**
- **Self-review only:**
  - `9e9751f` (Ben Adeyemi) and `bc7e732` (Chloe Park) each list their own author as reviewer.
  - Ben's commit also uses a different email, `ben.a@laptop.invalid`. I treated it as the same person because the name matches, so please confirm that.
- **No `Reviewed-by` trailer:** `2f7f724`, `f70e6a8`, `b07be54`, `268e72a`.
  - `f70e6a8` is a revert of the safelist cache commit `2f7f724`. Reverts still change `lib/`, so I kept it as a row.
- **Review mentioned but not recorded as a trailer:**
  - `8465169`: the commit text says Chloe Park agreed to the change in the PR thread. Prose isn't a trailer. If that thread exists, a link or screenshot would back it up.
  - `ad96886`: it has `Acked-by: Ben Adeyemi`, which isn't a review trailer.

**Left out of the CSV:**
- `192a8ba` (Ben Adeyemi, 1 April) is outside the quarter.
- The merge `dada197` (PR #212) only combines commits already listed. It has no review trailer of its own.

I didn't check whether reviews happened outside the commit messages, such as PR approvals. If those exist, they're the way to close the gaps, and you could add them to the CSV.