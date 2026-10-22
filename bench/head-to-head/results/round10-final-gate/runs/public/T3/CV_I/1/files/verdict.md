# Verdict on received/workproof-report.{md,json}

**Do not trust the headline numbers. The report's own figures contradict each other, and the two most flattering ones do not reproduce from the repo.** The multiple-email explanation accounts for only a small part of the gap.

## What I checked (recomputed from this clone with plain `git`)

The report matches this clone's HEAD (`249bbdc`). The repo has 299 commits, 230 of them non-merge. I did not run `npx workproof verify`, because that would download and execute third-party code. I recomputed each figure with git commands instead.

The merged identity set is "Jonathan Ong" and "jongleberry", across three addresses: `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:26cc79b4>`. That set is real.

| Claim | Recomputed | Result |
|---|---|---|
| 103 of 131 commits in tenure (78.6%) | **63 of 131 (48%)**. Only 56 use the primary address, so merging identities adds 7. | **Inflated by 40 commits** |
| 1,197 of 1,417 surviving lines (84.5%) | **697 of 1,417 (49.2%)**. That is 585 + 111 by name/email, plus 1 for `jongleberry`. | **Inflated by 500 lines** |
| Cohort lines 104 + 550 + 43 | Sums to **697**. This matches my recount and contradicts the report's own 1,197. | **Self-contradiction** |
| 24 active weeks at 2.6 commits per active week | 24 × 2.6 ≈ 62, which is consistent with 63 commits and not with 103. | **Self-contradiction** |
| 10 of 19 files authored (52.6%) | Only 8 of 19 were first added by this identity. The report uses a DOA heuristic, so this is soft. | Mildly generous |
| Rank 1 by surviving lines | True (697 vs TJ Holowaychuk 551), but with a much smaller margin than stated. | Holds |
| 31 of 43 test-file changes | 31 of 43 in the window | Matches |
| 24 active weeks, 23 tags in window, 0 co-author trailers | Match | Matches |
| Tenure 2013-11-07 to 2015-08-22 | The first date is correct. The last non-merge commit is 2015-07-09. The 2015-08-22 end date is a merge commit by `jongleberry`. Day count is 653 or 654 depending on inclusive counting. | Minor stretch |
| 42 authors | 44 distinct emails in the window, 60 overall | Minor, unexplained |

## Reading

- Merging the three addresses is legitimate. It adds 7 commits and 1 line, not the 40 commits and 500 lines claimed. It cannot explain the gap.
- The surplus is oddly round (exactly 500 lines). The JSON's own byYear breakdown still adds up to the true 697. That pattern fits a headline field being edited by hand after generation.
- The report's integrity hash is an unkeyed SHA-256 of the contents. Anyone who edits the numbers can recompute it, so it proves nothing here. Only a fresh `workproof verify` run against the repo would catch the edit, and that is the check the report itself tells you to run.
- Some figures are real but misleading. Merge commits stretch the tenure window. The commit-count and blame measures give no weight to the several earlier maintainers.

## Identity issue to resolve separately

The credited identity, Jonathan Ong, is the repo's own long-time maintainer. It is also the `user.name` in your local git config. The report does not say whether the applicant is that person or is claiming the maintainer's history. It hides the emails (`emails: false`), so the applicant never shows which addresses are theirs.

Ask the applicant to name the exact addresses, and have them show control of one of them. For example, they could sign a commit or push to a branch from that account.

## Caveats

I checked only what git history can show. Surviving lines and commit counts say nothing about the quality of the work. I did not review the applicant's resume, because none was provided.

## Bottom line

The true figures are about 63 commits (48%) and about 697 surviving lines (49%). The applicant is still the top contributor by surviving lines, and the work is substantial. The report overstates it and does not hold up as evidence. Treat the discrepancy as a serious integrity concern and ask the applicant to explain it.
