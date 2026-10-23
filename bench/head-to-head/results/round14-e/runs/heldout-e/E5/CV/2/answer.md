I wrote `change-review-evidence.csv` with 12 rows, one per change to `lib/` in Q1 2026. Seven have a clean independent review. The other five have no usable review evidence, or only a weak form of it. I haven't committed the file.

**Expect the auditor to question these:**

| sha | author | issue |
|---|---|---|
| `2f7f724` (safelist cache) | Chloe | No review trailer at all. |
| `f70e6a8` (revert of safelist cache) | Marta | No review trailer. It undoes the unreviewed `2f7f724`, so both ends of that change are unreviewed. |
| `ad96886` (log throttled keys) | Marta | Has only `Acked-by: Ben`. An ack isn't a `Reviewed-by`, so it won't count unless you can show Ben actually reviewed it. |
| `8465169` (cache key format) | Marta | The commit body says Chloe agreed in the PR thread, but there is no real trailer. This is the riskiest one, because a cache key format change is a substantive change. Pull the PR thread as evidence, or have Chloe confirm. |
| `9e9751f` (blocklist reason codes) | Ben | The only `Reviewed-by` is Ben himself. The commit's author email is different (`ben.a@laptop.invalid`), but it is the same person. |
| `bc7e732` (reset counters) | Chloe | The only `Reviewed-by` is Chloe herself. |

**Weaker evidence that should pass with an explanation:**
- **`b07be54` and `268e72a`** (Chloe's per-account limits): neither commit has a trailer. The review is on the merge commit `dada197` for PR #212 (`Reviewed-by: Marta`). That is reasonable evidence, but you'll need to explain that the trailer is on the merge rather than on the commits.
- **`e37dd19`**: Ben listed himself as a reviewer as well as Chloe. Chloe's review is the one that counts.
- **`fa7f9fc`**: the trailer is lowercase (`reviewed-by`). Git reads it fine, but an auditor running a case-sensitive search could miss it.

**Scope calls I made:**
- **`a54659a`** (expose counters) is in. Ben authored it on 30 March, but it was committed on 2 April, so a filter on commit date would drop it. It has a valid review from Marta.
- **`192a8ba`** (q2 work, 1 April) is out, because it is dated after the quarter.
- **Date column:** it shows the author date.
- **Merge commit `dada197`:** it isn't a row, because it changes nothing in `lib/` itself.

The CSV has only the five columns you asked for. The `status` column carries the explanations, and I left `reviewer` blank where no review was recorded.