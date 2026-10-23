I wrote `change-review-evidence.csv` with 12 rows. That's 11 commits that touched `lib/` between 1 Jan and 31 Mar 2026, plus the PR #212 merge. The merge is its own row because its trailer is the only review evidence for two other commits. The "q2 work" commit (192a8ba) is dated 1 April, so I left it out.

**Clean (4):**
- d21c30a: reviewed by Ben Adeyemi.
- fa7f9fc: reviewed by Marta Kowal. The trailer is lowercase `reviewed-by`, which git reads as a trailer, but a strict auditor might query it.
- e37dd19: reviewed by Chloe Park. The commit also has a self-review line from Ben, the author, which doesn't count.
- dada197 (merge of PR #212): reviewed by Marta Kowal.

**The auditor will likely question these (8):**
- **No review recorded:**
  - 2f7f724 (safelist cache, Chloe Park).
  - f70e6a8 (Marta Kowal's revert of that safelist cache). A revert is still a change to `lib/`.
- **Self-review only, where the reviewer is the author:**
  - 9e9751f (Ben Adeyemi reviewed his own commit). His author email there is `ben.a@laptop.invalid`, which differs from his usual address, so expect questions about that too.
  - bc7e732 (Chloe Park reviewed her own commit).
- **Review claimed but not in a trailer:**
  - 8465169 (cache key format change). The message mentions a Reviewed-by for Chloe only in prose, saying it was in a PR thread. To support it, you'd need the PR thread itself.
- **Wrong trailer type:**
  - ad96886 (log throttled keys). It only has `Acked-by: Ben Adeyemi`, not `Reviewed-by`. If Ben did review it, amending the record or supplying other evidence would fix this.
- **Indirect coverage only:**
  - b07be54 and 268e72a (Chloe Park) have no trailer of their own. They're only covered by Marta's trailer on the PR #212 merge. That's probably acceptable, but you should say so explicitly.

I only used what is in the commit messages. I didn't check GitHub PR approvals, which might close some of these gaps, especially 8465169 and ad96886. The `status` column holds a short note for each row, not a fixed set of values.