I wrote `change-review-evidence.csv` with 11 rows, one per commit that touched `lib/` between 2026-01-01 and 2026-03-31. I didn't commit it. I didn't use the cv-builder skills, because they're for resumes.

Only 3 of the 11 changes have a clean second-person review on the commit itself: `d21c30a`, `fa7f9fc` and `e37dd19`.

**The auditor will probably question these:**

| Commit | Author | Issue |
|---|---|---|
| `2f7f724` safelist cache | Chloe Park | No review trailer. |
| `f70e6a8` revert of the safelist cache | Marta Kowal | No review trailer. |
| `8465169` change the cache key format | Marta Kowal | The message says Chloe reviewed it in the PR thread, but that's prose, not a trailer. The auditor needs the PR thread itself. |
| `ad96886` log throttled keys | Marta Kowal | Has `Acked-by: Ben Adeyemi`, which isn't a review trailer. |
| `bc7e732` reset counters | Chloe Park | The only `Reviewed-by` names Chloe, the author, so it's a self-review. |
| `9e9751f` blocklist reason codes | Ben Adeyemi | The only `Reviewed-by` names Ben, the author, so it's a self-review. Its author email is `ben.a@laptop.invalid`, not Ben's usual address, so the auditor may also ask about identity. |

**Weaker evidence, worth explaining up front:**
- **`b07be54` and `268e72a`** (both Chloe): neither commit has a trailer. The `Reviewed-by: Marta Kowal` is on the merge commit `dada197` (PR #212), so I marked them "reviewed indirectly". This holds up only if the auditor accepts a PR-level trailer as covering its commits.
- **`fa7f9fc`**: the trailer is lowercase `reviewed-by:`. Git reads trailers case-insensitively, so I counted it, but a strict grep for `Reviewed-by` would miss it.
- **`e37dd19`**: it has two `Reviewed-by` lines, one of them the author's own. I recorded Chloe as the reviewer and ignored the author's.

**Other points:**
- I left `dada197` out as its own row, since it only merges PR #212. Its `lib/` content is already covered by `b07be54` and `268e72a`.
- `192a8ba` ("q2 work") is dated 2026-04-01, so it's outside the window and not listed.
- Some of the gaps may have been reviewed in the PR tool without the trailer reaching the commit. If so, the fix is to get that PR evidence for the auditor. Don't amend history.