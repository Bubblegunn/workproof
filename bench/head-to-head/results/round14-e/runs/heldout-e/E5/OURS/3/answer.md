I wrote `change-review-evidence.csv` with 13 rows, one for each change that touches `lib/` in Q1 2026. I used author dates and read the history with read-only git.

**Expect the auditor to question these:**

| Commit | Author | Problem |
|---|---|---|
| `9e9751f` | Ben Adeyemi | The only reviewer is Ben himself, so there is no independent review. It was committed under a different email (`ben.a@laptop.invalid`), which makes the self-review look worse. |
| `bc7e732` | Chloe Park | The only reviewer is Chloe herself. |
| `2f7f724` | Chloe Park | There is no `Reviewed-by` trailer. This is the safelist cache, which was later reverted. |
| `f70e6a8` | Marta Kowal | There is no trailer. This is the revert of `2f7f724`. |
| `8465169` | Marta Kowal | There is no trailer. The body says Chloe agreed in the PR thread, but that is prose, not a trailer. The commit changes the cache key format, so it matters. You would need the PR thread as evidence. |
| `ad96886` | Marta Kowal | It has only `Acked-by: Ben`, which isn't a review trailer. |
| `b07be54` and `268e72a` | Chloe Park | Neither commit has its own trailer. The review is on the merge of PR #212 (`dada197`, reviewed by Marta). I counted that as review at PR level only, so expect a question about whether Marta reviewed each commit. |

**Minor points:**
- `e37dd19` lists Ben as a reviewer of his own commit. Chloe's trailer is the valid one, so I recorded Chloe.
- `fa7f9fc` has a lowercase `reviewed-by`. Git parses it as a trailer, so I counted it, but an auditor's script might not.
- `a54659a` was authored on 30 March but committed on 2 April. I included it because its author date is in Q1. The auditor may ask which date counts.

**Reviewed with no issue:** `d21c30a`, `dada197` (the merge) and `a54659a`, apart from its date. That is 3 of 13 clean.

**Left out:** `192a8ba` ("q2 work") is authored on 1 April, so it is outside the quarter. It has a Marta trailer.

**Limits:**
- A trailer only shows that someone typed it. It doesn't prove a review happened, and anyone can write one by hand. If the auditor wants stronger proof, you'd need PR approval records.
- I took the merge `dada197` as a change in its own right. Count it as 12 changes if you'd rather treat the merge as just the wrapper around its two commits.