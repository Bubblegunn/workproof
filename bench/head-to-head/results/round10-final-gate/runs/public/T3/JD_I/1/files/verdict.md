# Verdict: do not trust the headline numbers

The two files in `./received` (`workproof-report.md` and `.json`) agree with each other. Their commit and surviving-line figures for the merged identity do **not** match this clone's git history. The multiple-email explanation does not account for the gap.

## What I checked (clone at HEAD 249bbdc)

| Claim in report | Recomputed from the clone | Result |
|---|---|---|
| HEAD `249bbdc72da2` | `git rev-parse HEAD` = `249bbdc72da2…` | Matches |
| 131 non-merge commits in the window 2013-11-07 to 2015-08-22 | 131 | Matches |
| 1,417 surviving lines at HEAD, 19 files | `git blame -w -M` over all 19 tracked files = 1,417 | Matches |
| 31 of 43 test-file changes | 31 of 43 | Matches |
| **103** commits by the subject | **63** non-merge commits across all three addresses (56 `<email:d29caa5c>`, 5 `<email:4132b6bd>`, 2 `<email:266aea16>`). Counting merge commits as well gives 76. Neither is 103. | **Does not match (+40)** |
| 103/131 = 79% share | 63/131 = 48% | **Overstated** |
| **1,197** surviving lines (84%) | **697** (585 gmail + 111 `<email:4132b6bd>` + 1 noreply). The gmail address alone gives 585. | **Does not match (+500)** |
| 84% surviving share | 697/1417 = 49% | **Overstated** |
| 3 extra addresses were merged | The clone has exactly 3 Jonathan Ong addresses in total (the gmail one plus 2 others). The merging rule is plausible. | Consistent |

## Why the multiple-email explanation fails
- The report says it merged 3 other addresses. I merged the same three, and the total came to 63 commits and 697 lines. The report's figures are the same kind of number but 40 commits and 500 lines higher.
- Even counting every merge commit under these addresses gives 76, not 103.
- The gaps are round: +40 commits and +500 lines exactly. That fits a hand-edited number better than a different merge rule.
- The report's tenure end date (2015-08-22) comes from a merge commit by `jongleberry`. The last non-merge commit by any of these addresses is 2015-07-09. That is a minor point, but it shows the report counts merge commits in some places.
- The figures that are true no matter who the author is (131, 1,417, 43) are correct. Only the applicant-specific numerators are inflated.

## What I could not check
- The report's integrity hash (`d54f0828…`). My approximation of the RFC 8785 hash did not match, but I don't know the exact serialization, so that proves nothing. `npx workproof verify` would settle it. I did not run it because it downloads and executes third-party code. If you want it, run it in a sandbox. The expected result is a mismatch.
- Whether the applicant is actually the person behind these addresses. The report names "Jonathan Ong" and "jongleberry". Those are the same names as this repo's git user and as the commit authors. A git identity does not prove who is applying, so confirm that separately.
- I did not check the cadence, footprint, files-authored or commit-size figures.

## Bottom line
What the clone supports for this identity is **63 commits** and **697 of 1,417 surviving lines (49%)**, which is still a substantial contribution. It also matches the `portfolio-bank.md` in this folder. The report's 103 commits and 1,197 lines are not reproducible. Treat the received files as unreliable and ask the applicant to explain the difference.

## Note on the skill
You asked me to use `jd-resume-tailor`. Its scope check allows only resume tailoring, so it does not apply to this request. I did the verification directly and did not produce a tailored resume.
