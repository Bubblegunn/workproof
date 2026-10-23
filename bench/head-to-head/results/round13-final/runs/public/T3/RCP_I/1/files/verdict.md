# Verdict: do not trust the headline numbers

The two files in `./received` (`workproof-report.md` and `.json`) are a workproof 0.7.0 report for this repo (HEAD `249bbdc`, which matches the clone). The facts about the repo are real. Several of the applicant's own figures are inflated. Merging email addresses explains only a small part of the gap.

I recomputed each figure with plain `git log` and `git blame` in the clone. I did not run `workproof`, because it isn't installed and I didn't fetch it.

## What checks out
| Claim | Recomputed |
|---|---|
| HEAD `249bbdc72da2` | matches |
| Tenure 2013-11-07 to 2015-08-22 | matches (first/last commit by these identities) |
| 131 non-merge commits in tenure | 131 |
| 24 active ISO weeks | 24 |
| 23 tags in tenure | 23 |
| 19 files at HEAD, 1,417 lines total | 19 and 1,417 |
| Identity merging (Jonathan Ong, jongleberry) | Plausible. These are the same person on 4 addresses: gmail, <email:4132b6bd> and the GitHub noreply address, plus the `jongleberry` name. |
| Survival by cohort (104 + 550 + 43) | matches blame by author-time year |

## What does not check out
| Claim | Actual | Notes |
|---|---|---|
| **103 of 131 commits (79%)** | **63 of 131 (48%)** | Counting every address and name they could plausibly own gives 56 + 4 + 2 + 1 = 63 non-merge commits, and 60 + 3 of them fall in the tenure window. The gap is 40 commits. The multi-email explanation covers 56 to 63 and cannot reach 103. |
| **1,197 of 1,417 surviving lines (84%)** | **697 (49%)** | `git blame -w -M` gives 696 lines for "Jonathan Ong" and 1 for "jongleberry". The report's own cohort table sums to 697 (104 + 550 + 43), so the file contradicts its own headline. |
| "The second number is the one that lasts, and here it is the higher of the two" | Wrong | With the real figures, lines survive at 49% and commits are at 48%, so the two are about equal. The narrative is generated from the inflated numbers. |
| Rank 1 of 42 authors by commit count | Rank 2, behind TJ Holowaychuk (90 commits against 63) | There are 59 distinct author names (60 emails), not 42. |
| 31 of 43 test-file changes (72%) | 31 of 74 | My count is a rough `test/` path match. The numerator agrees and the denominator is far larger. This one is lower confidence. |
| 2 authors cover half the commits | Not rechecked | |

Rank 1 by surviving lines does hold (696 against TJ's 551). That is probably the applicant's strongest honest figure.

## Why the "integrity" hash doesn't help
The report ends with a sha256 over its own parameters and figures. That only shows the file wasn't edited after it was generated. Anyone who edits the figures can recompute the hash. The hash says nothing about whether the figures match the repository. `npx workproof verify`, run in your clone, is the real test, and I expect it to fail on the figures above.

## What I couldn't verify
- Whether the hash is internally consistent. I didn't recompute the canonical JSON.
- The 17 author-owned tags, the 34 files touched, the language split, the "files authored" model (DOA) and the 10 of 19 files authored.
- The applicant's claim about "several email addresses". The JSON hides the addresses (`emails: []`). Even so, every address variant in this repo's history adds up to 63 commits, not 103.

## Bottom line
The applicant did real work in this repo. They are the second-largest contributor by commits and the largest by surviving lines. The report as sent overstates commits by about 63% (103 against 63) and surviving lines by about 72% (1,197 against 697). The cause is not explained by multiple email addresses, so the report was altered or produced by something other than a faithful run. Ask them for an explanation, and run `workproof verify` yourself, before you rely on any of it.
