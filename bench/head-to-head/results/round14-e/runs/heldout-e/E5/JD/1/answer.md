I've written `change-review-evidence.csv` with 11 rows, one per commit that touched `lib/` in Q1 2026. Only 3 of the 11 have clean evidence of a second person's review.

**Expect the auditor to question these 8:**

| Commit | Author | Problem |
|---|---|---|
| `9e9751f` | Ben | The only `Reviewed-by` is Ben himself. The author email is also `ben.a@laptop.invalid`, which doesn't match his usual address. |
| `bc7e732` | Chloe | The only `Reviewed-by` is Chloe herself. |
| `2f7f724` | Chloe | No review recorded (safelist cache). |
| `8465169` | Marta | No trailer. The message says Chloe approved it in a PR thread, but that's prose, not a `Reviewed-by` trailer. You'd need the PR thread itself as evidence. |
| `f70e6a8` | Marta | A revert with no review recorded. |
| `b07be54` | Chloe | No review recorded (per-account limits). |
| `268e72a` | Chloe | No review recorded (docs hook). |
| `ad96886` | Marta | Only an `Acked-by` from Ben, which isn't a `Reviewed-by`. Be ready to argue that an ack counts as review. |

**Reviewed by someone else:**
- `d21c30a` was reviewed by Ben.
- `e37dd19` was reviewed by Chloe. Ben's own `Reviewed-by` line on it doesn't count.
- `fa7f9fc` was reviewed by Marta, but the trailer is written lowercase (`reviewed-by`). Git treats trailers as case-insensitive, so I counted it. An auditor running a case-sensitive search might miss it.

**Other notes:**
- Chloe's PR #212 merge (`dada197`) is not a separate row. It only brought in the commits above, and nothing in it reads as a review.
- `192a8ba` ("q2 work") is dated 2026-04-01, so it falls outside the quarter.
- I used author dates, which match the commit dates here. All dates are UTC.
- A `Reviewed-by` trailer is only a claim in the commit message. It shows a review was recorded, not that it happened.