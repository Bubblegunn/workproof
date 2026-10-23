I wrote `change-review-evidence.csv` with 11 rows, one for each commit that touched `lib/` from 1 January to 31 March 2026. Only 3 of the 11 have a valid second-person review.

**Reviewed (3)**
- `d21c30a` (Marta Kowal) was reviewed by Ben Adeyemi.
- `fa7f9fc` (Chloe Park) was reviewed by Marta Kowal. The trailer is spelled `reviewed-by` in lowercase. Git treats trailer keys as case-insensitive, but the auditor may notice it.
- `e37dd19` (Ben Adeyemi) was reviewed by Chloe Park. It also has a Reviewed-by from Ben himself, which I ignored.

**Expect questions on these 8**
- **Self-review only:**
  - `bc7e732` (Chloe) has a Reviewed-by naming Chloe, the author.
  - `9e9751f` (Ben) has a Reviewed-by naming Ben, the author. The commit email is `ben.a@laptop.invalid`, while the trailer uses his normal address, so this could be read as a different identity. It is still the same name.
- **Review mentioned but not recorded as a trailer:** `8465169` (Marta, cache key format change) says in its message body that Chloe agreed in the PR thread. There is no trailer. The PR thread itself could be the evidence, so it's worth fetching.
- **Ack only:** `ad96886` (Marta, log throttled keys) has an `Acked-by` from Ben. That isn't a Reviewed-by, so I didn't count it.
- **No review recorded:**
  - `2f7f724` (Chloe, safelist cache).
  - `f70e6a8` (Marta, the revert of that safelist cache). Auditors often ask about reverts because they change production behaviour.
  - `b07be54` (Chloe, per-account limits). This is a substantive feature.
  - `268e72a` (Chloe, per-account limit docs hook).

**Limits of the evidence**
- Trailers are self-asserted text in commit messages, so they show a review was claimed, not that it happened. For the 8 exceptions, the PR approvals in your hosting platform are the likely fix, and I can't see those from here.
- The history is linear with no merge commits in range, so no review is hiding in a merge. The Q1 window includes everything through 31 March. `192a8ba` ("q2 work") is dated 1 April and is excluded.