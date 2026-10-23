I've written `change-review-evidence.csv`, which has 11 rows, one for each commit that touched `lib/` from 1 January to 31 March 2026. Only 3 of the 11 have a usable second-person review. I read the commits on `main` and checked the CSV file's row count and the `bc7e732` row. I didn't re-read the other rows after writing them.

**Expect the auditor to question these 8:**

| Commit | Author | Problem |
|---|---|---|
| `9e9751f` blocklist reason codes | Ben Adeyemi | The only `Reviewed-by` is Ben's own. The commit author email is different (`ben.a@laptop.invalid`), but the person is the same. |
| `bc7e732` reset counters | Chloe Park | The only `Reviewed-by` is Chloe's own. |
| `2f7f724` safelist cache | Chloe Park | No review recorded. |
| `8465169` change cache key format | Marta Kowal | The message says Chloe reviewed it "in the PR thread", but that is prose, not a trailer. It counts as no review unless you can produce the PR thread. |
| `f70e6a8` revert of safelist cache | Marta Kowal | No review recorded. Reverts are still changes. |
| `b07be54` per-account limits | Chloe Park | No review recorded. |
| `268e72a` per-account limit docs hook | Chloe Park | No review recorded. It adds a file under `lib/`, so it's in scope despite the name. |
| `ad96886` log throttled keys | Marta Kowal | It has only an `Acked-by` from Ben. That isn't a `Reviewed-by`, so it won't pass a strict reading. |

**Counted as reviewed:**
- **`d21c30a`:** reviewed by Ben.
- **`e37dd19`:** reviewed by Chloe. Ben also added a `Reviewed-by` for himself on his own commit; I ignored that one.
- **`fa7f9fc`:** reviewed by Marta, but the trailer is written lowercase (`reviewed-by`). Git treats trailer keys as case-insensitive, so it is valid, but an auditor grepping case-sensitively might miss it.

**Caveats:**
- **Scope:** I excluded `192a8ba` ("q2 work"). It is dated 1 April, so it falls outside the quarter.
- **Other refs:** The repo has only `main` and no other branches or tags. The history shows only the commits, not any PR approvals. The `main` history shows no merge commits for the in-scope changes.
- **Missing reviews:** If the missing reviews happened in PRs, the fix is to get that evidence from the PR approvals. I can't produce it from git.