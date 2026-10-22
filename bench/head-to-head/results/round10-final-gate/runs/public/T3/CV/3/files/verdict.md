# Verdict on received/workproof-report.{md,json}

**Do not trust the headline numbers. The report's totals match this repo, but its figures for the applicant do not.**

I did not run `npx workproof verify`. That would download and run code from the network. I recomputed the figures directly with `git log` and `git blame` on your clone (HEAD 249bbdc, the same HEAD the report names).

## What matches
- HEAD is `249bbdc72da2`, as in the report.
- 131 non-merge commits fall in the claimed window, 2013-11-07 to 2015-08-22.
- 1,417 lines survive across 19 files.
- The first commit date, 2013-11-07, is correct for the "Jonathan Ong" / "jongleberry" identities.

## What does not match

| Claim | Recomputed from the clone |
|---|---|
| 103 of 131 commits in tenure (79%) | **63 of 131 (48%)**, counting every address: `<email:d29caa5c>`, `<email:4132b6bd>` and the `jongleberry` noreply address. 103 is not reachable. All of "Jonathan Ong" or "jongleberry" across the whole history is 63 non-merge commits. |
| 1,197 of 1,417 surviving lines (84.5%) | **697 of 1,417 (49%)**: 696 under "Jonathan Ong" plus 1 under "jongleberry". TJ Holowaychuk holds 551. |
| Tenure ends 2015-08-22 (654 days) | The last commit by these identities is **2015-07-09**, about 610 days after the first commit. There is no commit by them on 2015-08-22. |
| Rank 1 by surviving lines | This holds, 697 against 551 for TJ Holowaychuk. |
| Report is internally consistent | **It is not.** The report's own "survival by cohort" lines sum to 104 + 550 + 43 = 697. That matches my blame count and contradicts the report's 1,197. |

The "several email addresses" explanation covers only part of the gap. Merging all the addresses gives 63 commits, not 103. It also cannot move the surviving-line count from about 697 to 1,197. Only 4 commits come from `<email:4132b6bd>`, and the repo has no other plausible address that would account for the rest.

## Other notes
- The repo has 60 distinct author emails and 59 names. The report says "42 people". I did not check that number.
- The report's integrity hash only shows the file was not edited after it was generated. It cannot show the numbers were computed honestly. The numbers appear to have been edited, or generated against a different or modified history, before hashing. Their own cohort figures give it away.
- The "same name on another address" and "GitHub login matches" merge rules explain the identity merging, but they do not explain the inflated totals.
- The report also names "Jonathan Ong", which is the same name as your git user. Check whether the applicant is claiming your own commits. The same name does not prove it is a different person. `<email:d29caa5c>` is the address your local git config uses, so these commits may be yours.

## Conclusion
The files were not produced honestly from this repository. The commit share is overstated by about 40 commits (79% claimed against 48%). Surviving-line ownership is overstated by about 500 lines (84% claimed against 49%). The tenure end date is wrong too. The repo does support a real contribution: 63 commits and about 697 surviving lines, ranked first by surviving lines. Before going further, ask the applicant which commits are theirs and which addresses they used. Then compare that list against `git log`.
