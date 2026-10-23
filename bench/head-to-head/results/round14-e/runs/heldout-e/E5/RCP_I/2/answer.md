I wrote `change-review-evidence.csv` in this folder. It has 13 rows: the 12 commits that touched `lib/` between 1 January and 31 March 2026, plus the PR #212 merge commit. I left out `192a8ba` ("q2 work") because it is dated 1 April. I took everything from `git log`. The PR threads aren't in git, so I couldn't check them.

Only 4 of the 13 are cleanly reviewed. The auditor is likely to question the other 9.

**No review recorded**
- `2f7f724` (Chloe, 29 Jan, safelist cache) has no review trailer.
- `f70e6a8` (Marta, 3 Mar) is the revert of `2f7f724` and has no review trailer either.
- `ad96886` (Marta, 27 Mar) only has `Acked-by: Ben Adeyemi`. That is an acknowledgement, not a review.

**Review mentioned only in prose**
- `8465169` (Marta, 4 Feb, cache key format change) says in its message body that Chloe reviewed it "in the PR thread". It has no trailer. This is a cache key change, so I'd expect the auditor to ask for the PR thread as evidence.

**Self-review only**
- `bc7e732` (Chloe, 18 Mar) has `Reviewed-by: Chloe Park`, which is the author reviewing their own change.
- `9e9751f` (Ben, 15 Jan) has `Reviewed-by: Ben Adeyemi`. The commit was made under `ben.a@laptop.invalid`, and `.mailmap` maps that to Ben's work address, so it is also the author's own review.

**Indirect evidence only**
- `b07be54` and `268e72a` (Chloe, 6 and 8 Mar) have no trailer on the commits themselves. Their only evidence is the PR #212 merge `dada1979`, which carries `Reviewed-by: Marta Kowal`. The auditor may accept that if you explain it, but it isn't a per-commit record.

**Fine, with minor notes**
- `fa7f9fc` has a lowercase `reviewed-by:` trailer. Git reads trailers case-insensitively, but a strict script might miss it.
- `e37dd19` lists both Ben, its author, and Chloe. Chloe is the valid second reviewer.
- The other cleanly reviewed commits are `d21c30a`, `a54659a` and the merge `dada1979`.

Before the audit, I'd gather the PR approvals for `2f7f724`, `8465169`, `f70e6a8`, `ad96886`, `bc7e732` and `9e9751f`. Where someone has since reviewed a commit, record it in a note, because rewriting history to add trailers would undermine the evidence.