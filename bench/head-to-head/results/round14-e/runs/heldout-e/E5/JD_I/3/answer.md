I wrote `change-review-evidence.csv` in this folder with 12 rows, one per change to `lib/` in Q1 2026. I didn't use the jd-resume-tailor skill, which only tailors resumes, so I read the git history directly.

**Changes the auditor will question**

| Commit | Author | Problem |
|---|---|---|
| `2f7f724` safelist cache | Chloe Park | No review trailer. |
| `b07be54` per-account limits | Chloe Park | No review trailer. |
| `268e72a` per-account limit docs hook | Chloe Park | No review trailer. |
| `f70e6a8` revert of safelist cache | Marta Kowal | No review trailer. It's a revert, but it still changed `lib/`. |
| `ad96886` log throttled keys | Marta Kowal | Only an `Acked-by: Ben Adeyemi`, which isn't a `Reviewed-by`. |
| `9e9751f` blocklist reason codes | Ben Adeyemi | The only reviewer is Ben himself, under an email (`ben.adeyemi@…`) that differs from the author's (`ben.a@laptop.invalid`). That's a self-review. |
| `bc7e732` reset counters | Chloe Park | The only reviewer is Chloe, the author. |
| `8465169` change the cache key format | Marta Kowal | "Reviewed-by: Chloe Park" appears in the message prose, not as a trailer. The real evidence would be the PR thread, so you'd need to produce that. |

**Changes that pass, with caveats**
- `e37dd19` has two `Reviewed-by` trailers. Ben Adeyemi's is a self-review, but Chloe Park's is valid, so it passes.
- `fa7f9fc` uses a lowercase `reviewed-by`. Git treats trailer keys as case-insensitive, but a strict script check could miss it.
- `a54659a` expose counters has an author date of 2026-03-30 but a commit date of 2026-04-02, which looks like a rebase or amend. I counted it in Q1 by author date. It does have a valid review from Marta Kowal. Expect questions about why the commit date moved after quarter-end.
- `d21c30a` is clean.

I left out `192a8ba` (dated 2026-04-01) because it's Q2.

**Process gap:** the git history shows four commits with no review and four with only a self-review or an `Acked-by`. Some of those may have been reviewed in the PR tool without a trailer being added. If so, get exports of those PR approvals before the audit.