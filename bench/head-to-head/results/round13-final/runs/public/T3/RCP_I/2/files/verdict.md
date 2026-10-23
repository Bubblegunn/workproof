# Verdict: do not trust the headline numbers

The applicant sent `received/workproof-report.md` and `received/workproof-report.json`. They are a "workproof 0.7.0" report for this repo (HEAD `249bbdc`, which matches our clone). Several figures do not match the git history. They are inflated, and the multiple-email explanation does not account for the difference.

## What I checked
I recomputed each figure with git in our clone. I did not run `npx workproof` or any code from the files. I read the two files only as data.

| Claim in report | What git shows | Result |
|---|---|---|
| HEAD `249bbdc72da2` | HEAD is `249bbdc72da2` | OK |
| 131 non-merge commits in the window | 131 | OK |
| **103 commits by the applicant (79%)** | **63** (56 + 4 + 2 + 1) across all four identities | **Inflated by 40 commits** |
| Last commit 2015-08-22, tenure 654 days | Last commit by any of their identities is **2015-07-09** | Wrong (about 610 days) |
| First commit 2013-11-07 | 2013-11-07 | OK |
| **1,197 of 1,417 surviving lines (84%)** | `git blame -w -M` on HEAD gives **696 of 1,416 (about 49%)** | **Inflated by about 500 lines** |
| Files touched 34 | 34 | OK |
| 24 active weeks | 24 | OK |
| 31 test-file changes by the applicant | 31 | OK |
| Rank 1 by surviving lines | Rank 1 (696 against 551 for the next author) | OK |
| 42 authors | 59 distinct names, 60 distinct emails | Does not match |

## Why I don't believe the explanation
- **The identities don't explain 103.** The four addresses and names (`<email:d29caa5c>`, `<email:4132b6bd>`, `<email:266aea16>`, and the name `jongleberry`) add up to 63 commits. That is already everything the multiple-email claim covers.
- **The report contradicts itself.** Its own cohort breakdown (104 + 550 + 43) sums to 697 lines, which matches git's 696. The headline says 1,197, and the 500-line gap is exactly the kind of edit that makes 84% out of 49%.
- **The cadence figure points to about 63 commits.** 24 active weeks at 2.6 commits per active week is about 62 commits. 103 commits would be about 4.3 per week.
- **The edit looks deliberate.** The commit count, the last date and the surviving-lines total are the figures that make the applicant look larger. The figures that are hard to inflate (files touched, active weeks, test changes) are all correct.
- **The hash doesn't prove integrity.** The report hash covers only the report's own contents. Anyone who edits the numbers can recompute it, so a matching hash would prove nothing. The "recompute with `npx workproof verify`" instruction is also a reason to be careful. It runs a package the applicant chose, and I did not run it.

## What is true
The applicant did real work here. They are the top author by surviving lines, with about 696 lines, 63 commits across 4 identities, and 34 files, from Nov 2013 to Jul 2015. Their real share is about 49% of surviving lines and 63 of 131 commits in the window (48%). That is a strong contribution, but it is not the 84% and 79% they presented.

## Suggested next step
Ask the applicant to explain the 103 commits and the 1,197 lines. Give them the numbers above: 63 commits and 696 lines. If they ran the tool unmodified, they can send the exact command and the tool's version. You can also run it yourself in a sandbox against this clone and compare.

## Limits of this check
- I used only the local clone. A shallow or filtered clone could differ from the applicant's, but the 131-commit total matched, which suggests the history is the same.
- Blame figures depend on the `-w -M` flags, which I used as the report states. Small differences of one or two lines (1,416 against 1,417) are normal.
- I did not re-check the "test changes total" (43), the languages split, or the commit-size percentiles. None of them affects the verdict.
- The receipts skill builds a report from my own Claude Code sessions and cannot assess someone else's files. I used git directly instead.
