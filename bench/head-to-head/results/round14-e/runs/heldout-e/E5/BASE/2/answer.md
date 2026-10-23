I wrote `change-review-evidence.csv` in this folder with 12 rows, one per change to `lib/` in Q1. 3 rows have a reviewer and 9 don't, so expect the auditor to question 9 of the 12.

I counted a Reviewed-by trailer only if the named reviewer isn't the author. I read the trailers from each commit message in `git log`.

**Reviewed (3 plus 1 caveat):**
- `d21c30a` was reviewed by Ben Adeyemi.
- `e37dd19` was reviewed by Chloe Park. It also carries a self-review trailer from the author, which I ignored.
- `dada197`, the merge of PR #212, was reviewed by Marta Kowal.
- `fa7f9fc` was reviewed by Marta Kowal, but the trailer is written in lowercase (`reviewed-by`). Git reads trailers case-insensitively, so I counted it. An auditor running a case-sensitive grep may miss it.

**Expect questions on these:**
- **`9e9751f` and `bc7e732`:** the only Reviewed-by trailer is the author's own, so there's no independent review.
- **`8465169`:** the message mentions a Reviewed-by from Chloe "in the PR thread". It's in the prose, not a trailer. If you can export that PR thread, it could serve as evidence.
- **`ad96886`:** it has an Acked-by from Ben but no Reviewed-by. An acknowledgement isn't necessarily a review.
- **`2f7f724`, `f70e6a8`, `b07be54` and `268e72a`:** no review trailers at all. Of these, `f70e6a8` is a revert of `2f7f724`, and `b07be54` and `268e72a` came in through PR #212. Marta's review on the merge `dada197` may cover those two, but the commits themselves have no evidence. The PR approval record would settle it.

**Scope and data notes:**
- `192a8ba` ("q2 work") is dated 1 April 2026, so I left it out.
- `9e9751f` has an author email of `ben.a@laptop.invalid`, unlike Ben's other commits. The auditor may query whether it's the same person.

The CSV's status column holds short free-text notes like "self-review only" and "no Reviewed-by trailer", not a fixed set of codes.