I wrote `change-review-evidence.csv` in this folder. It has 11 rows, one for each commit on `main` that touched `lib/` between 1 January and 31 March 2026. Only 3 of the 11 show a second person's review.

I didn't use the receipts skill. It builds a Claude Code usage report from session transcripts, so it can't produce review evidence. I read the git history and commit-message trailers directly instead.

**Reviewed (3):**
- `d21c30a` (Marta Kowal, 8 Jan): reviewed by Ben Adeyemi.
- `fa7f9fc` (Chloe Park, 12 Feb): reviewed by Marta Kowal. The trailer is lowercase `reviewed-by`, so a strict auditor might query it.
- `e37dd19` (Ben Adeyemi, 25 Feb): reviewed by Chloe Park. Ben also listed himself, and I ignored that.

**Expect the auditor to question (8):**
- **No review trailer at all (4):**
  - `2f7f724` (Chloe Park, 29 Jan, safelist cache)
  - `b07be54` (Chloe Park, 6 Mar, per-account limits)
  - `268e72a` (Chloe Park, 8 Mar, limit docs hook)
  - `f70e6a8` (Marta Kowal, 3 Mar, a revert of the safelist cache commit). A revert still changes `lib/`.
- **Self-review (2):** `bc7e732` (Chloe Park, 18 Mar) lists Chloe as her own reviewer. `9e9751f` (Ben Adeyemi, 15 Jan) lists Ben as his own reviewer. The author email is `ben.a@laptop.invalid` and the trailer uses `ben.adeyemi@…`, but it is the same person.
- **Wrong trailer type (1):** `ad96886` (Marta Kowal, 27 Mar) has `Acked-by: Ben Adeyemi`, not `Reviewed-by`. It is also the most recent change.
- **Review mentioned in prose only (1):** `8465169` (Marta Kowal, 4 Feb) says Chloe Park reviewed it "in the PR thread". The text isn't a trailer, and this commit changed the cache key format. If the PR thread exists, link it as supporting evidence. Otherwise it counts as unreviewed.

- **Possible gap:** the CSV only reflects commit messages. Some of the "no review" commits may have been approved in PRs that never got a trailer. Check those PR approvals before the audit, since they could close several of these gaps.
- **Scope:** I checked `main` only. The repo has no other branches, so nothing else touched `lib/` in that period.