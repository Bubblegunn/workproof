# Verdict: do not trust the received workproof report

The two files (`received/workproof-report.md` and `.json`) describe the same report. Its headline numbers are inflated compared with what git shows in your clone. Merging several email addresses does not explain the gap. I applied the report's own merge rule and still could not reproduce its numbers.

## What I checked

I recomputed the figures directly with `git log` and `git blame`. I did not run `npx workproof verify`, because that would execute a third-party package fetched from the network on the strength of the submitter's file.

The identities I treated as the applicant's were the maximal set: `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. They match the report's names "Jonathan Ong" and "jongleberry".

| Claim in report | Report | Recomputed from your clone | Result |
|---|---|---|---|
| HEAD | `249bbdc` | `249bbdc72da2…` | matches |
| Tenure | 2013-11-07 to 2015-08-22 | first commit 2013-11-07; last in-window commit on or before 2015-08-22 | consistent |
| Total non-merge commits in window | 131 | 131 | matches |
| Applicant's commits in window (all merged addresses) | **103 (78.6%)** | **63 (48.1%)**: 56 + 5 + 2 | **inflated by about 40** |
| Total lines at HEAD | 1,417 | 1,417 | matches |
| Applicant's surviving lines (`git blame -w -M`) | **1,197 (84.5%)** | **696 (49.1%)**: 585 + 111 from the two main addresses | **inflated by about 500** |
| Files alive at HEAD | 19 | 19 | matches |
| Release tags in tenure | 23 | 23 | matches |
| Files "authored" | 10 of 19 | the applicant added 8 files first; TJ Holowaychuk added 10 | not reproduced; the report's figure is a heuristic and I did not replicate it |
| Test-file changes | 31 of 43 | 30 of 72 (my own rough count) | does not match; my counting method may differ |

## Why I think the report is wrong

1. **The report contradicts itself.** Its "survival by cohort" figures (104 + 550 + 43) sum to 697. That matches the 696 lines I found, and it does not match the 1,197 lines the same report states. The headline number is about 500 higher than the figures it is supposed to be built from.
2. **The commit count cannot be reached.** If you merge every address that could plausibly be theirs, the count is 63 commits. The report says 103. The report says 3 extra addresses were merged, but I found only 2 other addresses (`<email:4132b6bd>` and the noreply one).
3. **The ranking is not what the history shows.** Over the whole history, TJ Holowaychuk has the most non-merge commits (90). The applicant has 56 + 4 + 2 + 1. Within the window the applicant does rank first, but only by about 63 to 19, not by the report's margin.
4. **The integrity hash proves nothing here.** I could not reproduce `d54f0828…` with several guesses at the canonicalisation, so that check is inconclusive. Even if it were reproducible, the hash would only show the file wasn't changed after it was made. Anyone can edit the numbers and recompute the hash, and the file's `generatedAt` and tool-version fields can't be checked either.

## What is true

The applicant did real work in this repo. They are the second-largest contributor overall and the largest in the window by commits. About half of the code still alive at HEAD is theirs (696 of 1,417 lines), and they made 8 of the 19 current files. Their tenure dates and the count of release tags match. The report overstates the commit count by about 40 and the surviving lines by about 500. Those are the figures that make them look like the dominant author.

## Recommendation

- Do not rely on the report's percentages. Use the recomputed numbers above if you want to cite anything.
- Ask the applicant to explain the 103 and 1,197 figures and to list the exact email addresses they merged. Their own cohort table disagrees with their headline.
- Ask for a short conversation about the code they wrote. The recomputed numbers still show real contribution.

## Limits of this check

- I only checked the clone you gave me. I did not confirm that it matches the upstream repository's history.
- Test-file counts and the "files authored" heuristic were not reproduced exactly.
- I did not use the cv-builder skills. They draft and edit resumes, and this task was verifying evidence.
