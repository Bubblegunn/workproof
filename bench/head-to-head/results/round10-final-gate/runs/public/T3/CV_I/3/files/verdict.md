# Verdict: do not trust the headline numbers

The report is real in outline but inflated. The two headline figures (commit share and surviving lines) do not reproduce from this clone, and the report contradicts itself on one of them.

I checked `received/workproof-report.{md,json}` against the local clone (HEAD `249bbdc`, same as the report). I recomputed everything with plain `git log` and `git blame`. I did not run `npx workproof`, because that would execute third-party code fetched from npm. The report's hash only shows it wasn't edited after generation; it says nothing about whether the numbers are right.

## What matches

| Claim | Reproduced |
|---|---|
| HEAD `249bbdc`, 19 files at HEAD | yes |
| 131 non-merge commits in the tenure window | yes (131) |
| Tenure 2013-11-07 to 2015-08-22 | yes (first/last commit dates) |
| 24 active weeks | yes (24) |
| 23 tags in tenure | yes (23) |
| 34 files touched | yes (34) |
| 1,417 surviving lines in total | yes (1,417) |
| Cohort lines 104 / 550 / 43 | yes, but they sum to 697, not 1,197 |
| Merging 4 addresses is legitimate | yes. The addresses are `<email:d29caa5c>`, `<email:4132b6bd>`, and the `jongleberry` login on two other addresses. The name and login match. |
| Ranks first by commits and by surviving lines in the tenure window | yes (see below) |

## What does not match

| Claim | Report | Recomputed | Notes |
|---|---|---|---|
| Commits in tenure | 103 of 131 (79%) | **63 of 131 (48%)** | I merged every address that plausibly belongs to them. The Gmail address alone has 56. Counting by committer name instead gives 82, still not 103. I found no reading that gives 103. |
| Surviving lines | 1,197 of 1,417 (84.5%) | **697 of 1,417 (49.2%)** | The blame total is 1,417 (this matches) but their share is 697. The 1,197 is 500 too high. |
| Test-file changes | 31 of 43 | 30 of 42 | Off by one, probably a path-matching difference. Not material. |
| Authors | 42 | 44 distinct emails in tenure | Small difference, not material. |

The cohort figures (104 + 550 + 43) are in the report's own JSON and add up to 697. That contradicts the report's own 1,197. This looks like the headline total was changed after the fact, or the report was assembled by hand. A real workproof run would not produce that mismatch.

## Their explanation does not cover this

They said multiple email addresses push the numbers above a plain count. That is true for the config they used (merging 4 addresses). But merging all 4 addresses is already what gives 63 commits and 697 lines. Even with every address merged, the real figures are about 48% of commits and 49% of surviving lines. The report's 79% and 84% are not explained by identity merging.

The "In plain language" paragraph also says survival (84%) beats the commit share (79%). With the real figures, both are about 48 to 49%, so that framing is unsupported too.

## What the clone does support

- They are a real, significant contributor. Their commits run from 2013 to 2015. They are the top committer and the top surviving-line owner in the window.
- `<email:d7c7dcd6>` is a close second on surviving lines (551 vs 585 for the Gmail address alone). Combined, their 697 lines still lead.
- The repo is `co` (the generator-flow library).
- The footprint, cadence and file-ownership facts are plausible. I did not recompute the DOA authorship score (10 of 19 files) or the commit-size percentiles.

## Recommendation

- Treat the contribution as real but roughly half the size claimed.
- Do not rely on the 79% and 84% figures. The report's own cohort data contradicts the 84%.
- Ask the candidate to explain the discrepancy, or to re-run `workproof` themselves in front of you on a fresh clone. Do not run it on a clone where they could have altered history.
- Their time at the project and the quality of the work are better judged by looking at their commits directly than by this report.

## How to reproduce

```
git log --no-merges --format=%aE --since=2013-11-07 --until=2015-08-22 | sort | uniq -c | sort -rn
git blame --line-porcelain -w -M HEAD -- <each file>   # sum author-mail for the three addresses
```
