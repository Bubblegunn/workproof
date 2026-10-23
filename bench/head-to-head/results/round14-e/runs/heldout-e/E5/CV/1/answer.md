I wrote `change-review-evidence.csv` with 11 rows, one for each commit that touched `lib/` between 2026-01-01 and 2026-03-31. I counted a trailer as evidence only if it names someone other than the author.

**The auditor will likely question these:**

| Commit | Problem |
|---|---|
| `2f7f724` (safelist cache, Chloe, 29 Jan) | No review recorded. |
| `f70e6a8` (revert of safelist cache, Marta, 3 Mar) | No review recorded. This undoes `2f7f724`, so the two will be questioned together. |
| `9e9751f` (blocklist reason codes, Ben, 15 Jan) | The only Reviewed-by is Ben's own. The commit's author email (`ben.a@laptop.invalid`) differs from the trailer's, so it looks like a different person unless you explain it. |
| `bc7e732` (reset counters, Chloe, 18 Mar) | The only Reviewed-by is Chloe's own. |
| `8465169` (cache key format, Marta, 4 Feb) | The commit message mentions "Reviewed-by: Chloe Park" in a sentence about a PR thread. It isn't a real trailer, so it's unverified. You would need the PR thread itself as evidence. |
| `ad96886` (log throttled keys, Marta, 27 Mar) | It has only an Acked-by from Ben, not a Reviewed-by. You would have to argue that an ack counts as a review. |

**Accepted, but with caveats:**
- **`b07be54` and `268e72a` (Chloe, 6 and 8 Mar):** Neither commit has a trailer. The Reviewed-by from Marta is on merge commit `dada197` (PR #212). I marked both as indirectly reviewed. That's reasonable evidence, but it covers the PR as a whole, not each commit.
- **`fa7f9fc`:** The trailer is written in lowercase (`reviewed-by`). Git reads trailers case-insensitively, so I accepted it, but a strict text search could miss it.
- **`e37dd19`:** It has a self-review from Ben and a valid one from Chloe. I credited Chloe.
- **`d21c30a`:** Reviewed by Ben, with nothing to flag.

Everything is based on commit messages in this repo. If reviews also happened in PR approvals, those could close the gaps above, but I can't see them from here. The six flagged commits are the ones to look up in your PR system.