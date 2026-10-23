# Verdict: do not trust the numbers in the received workproof report

The report is for this repo (HEAD `249bbdc`, root commit `7a6e733`) and the identity merge is plausible. But the headline figures are inflated well beyond what the merging explains, and one figure contradicts the report itself.

## What I checked
I recomputed each figure from the local clone with plain `git`. I did not run `npx workproof verify`, because it would download and run third-party code on an untrusted report. The report's integrity hash only proves the file wasn't edited after it was generated. It doesn't prove the figures are right.

The merged identity set is `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. This is more generous to the applicant than the report's own "3 other addresses".

| Claim in report | Recomputed from the clone | Result |
|---|---|---|
| HEAD `249bbdc72da2` | Matches | OK |
| 131 non-merge commits in the tenure window | 131 | OK |
| **103 of 131 commits are theirs (79%)** | **63 of 131 (48%)** with all identities merged. Only 56 are under the configured address. | **Overstated by about 40 commits** |
| **1,197 of 1,417 surviving lines (84%)** | Total of 1,417 matches. **Their lines are 697 (49%)**: 585 + 111 + 1 | **Overstated by 500 lines** |
| Cohort lines 104 + 550 + 43 | These sum to **697**, not 1,197 | **The report contradicts itself.** Its own breakdown supports the true figure. |
| 31 of 43 test-file changes (72%) | 31 of 74 (42%). Their count matches but the total doesn't. | Denominator wrong |
| 10 of 19 files authored | 8 files were first added by them, 10 by TJ Holowaychuk, 1 by another contributor. The tool's DOA method may differ, so this is a soft discrepancy. | Doubtful |
| 42 people wrote code, they rank 1 | 60 distinct emails and 59 names across the full history. They are #2 by commits (TJ has 90, they have 63 merged), and TJ has 551 surviving lines to their 697. They rank 1 on surviving lines only. | Population is wrong. The rank is right only for surviving lines. |
| Tenure 2013-11-07 to 2015-08-22 (654 days) | First commit 2013-11-07 matches. The last commit under any of these identities is **2015-07-09**, so about 610 days. | End date unsupported |

## Read
- The identity merge, commit window, HEAD and file count are real, so the file is probably derived from this repo.
- The ratios the report leads with (79% of commits, 84% of lines) are not reproducible. The true values are about 48% and 49%.
- Merging email addresses can't explain this. Merging every address I could find still gives only 63 commits.
- The 1,197 figure disagrees with the report's own cohort table (697). That points to a hand-edited or fabricated figure, or a different or modified repo history.
- Their contribution is still real and sizable: 63 commits, 697 surviving lines (about half), and the largest surviving share of any author. It is just not the dominant ownership the report claims.

## Caveats
- The `.md` and `.json` files agree with each other, so they don't give independent evidence.
- Nothing in the files ties "Jonathan Ong" or "jongleberry" to the applicant. Ask them to confirm which commits are theirs, for example by naming the GitHub login and email addresses. Authorship in git is self-declared, so commit emails can be set to anyone's.
- Ask the applicant to explain the 103 and 1,197 figures. Ask them to re-run the tool on a fresh clone, or to share the exact command and the version of the repo they used.
