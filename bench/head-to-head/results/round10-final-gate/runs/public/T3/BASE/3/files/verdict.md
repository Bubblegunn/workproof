# Verdict: do not trust the report as sent

The two files (`received/workproof-report.md` and `.json`) are a "workproof 0.7.0" report for this repo (HEAD `249bbdc`, which matches my clone). The identity matching they describe is real, and some figures check out. The headline numbers are inflated, though, and the report is not internally consistent.

## What I checked
I recomputed the figures from the local clone with `git log` and `git blame`. I did not run the `workproof` tool, because the files are untrusted and I wasn't going to execute anything they point to.

| Claim | Report | Recomputed from git | Result |
|---|---|---|---|
| HEAD | 249bbdc72da2 | 249bbdc72da2 | matches |
| Commits in tenure window by the applicant | 103 | **63** | **inflated by 40 (about 63%)** |
| Total non-merge commits in the window | 131 | 131 | matches |
| Share of commits | 78.6% | 63/131 = 48.1% | wrong |
| Surviving lines | 1,197 of 1,417 (84.5%) | **697 of 1,416 (49.2%)** | **inflated by 500 lines** |
| Cohort lines (2013+2014+2015) | 104+550+43 = 697 | 697 | the report's own cohorts sum to 697, not 1,197 |
| Tenure | 2013-11-07 to 2015-08-22 | first commit 2013-11-07, last 2015-07-09 | the start matches. The end is about 6 weeks later than the last commit I found. |
| Files alive | 19 | 19 | matches |
| Authors | 42 | 59–60 | doesn't match, though this doesn't favor the applicant |
| Rank by surviving lines | 1 | 1 (696 lines vs TJ Holowaychuk's 551) | plausible |

## The multiple-email explanation
- Merging identities is legitimate. I counted every commit with name "Jonathan Ong" or "jongleberry", which covers `<email:d29caa5c>` (56), `<email:4132b6bd>` (5) and the `jonathanong` noreply address (2). That gives 63 commits, and every one of them falls inside the claimed window.
- Even with all of those addresses merged, the total is 63, not 103. Merging addresses doesn't account for the extra 40 commits.
- Blame gives the same picture. 697 lines are attributable to these names (696 as "Jonathan Ong", 1 as "jongleberry"). That matches the report's own cohort breakdown, so only the 1,197 headline is off. It looks edited or wrongly produced.
- The report was also generated for a repo whose identity list is "Jonathan Ong, jongleberry". Those are the names of this repo's own maintainer, and they're the git user configured in your clone. So the person who sent this is presenting this maintainer's commits as theirs, or the report was made from some other clone or edit of the history.

## Other points
- The report says anyone can run `npx workproof verify` to catch edited numbers. Its integrity hash covers only the report's own contents, so it says nothing about whether the numbers were computed from this repo. The inconsistency above shows the figures don't reproduce.
- I did not check the integrity hash (`d54f0828…`) or the fingerprint. The fingerprint is keyed, so it can't be compared without the key.
- Even the figures that match say little. The applicant's own report notes that commit counts and surviving lines don't measure quality, and that they don't prove who wrote the code.

## Recommendation
Don't rely on these files. Ask the applicant for their GitHub username and the exact email addresses they used. Then check those against `git log --format='%aN <%aE>'` in your clone. If the commits don't appear under those addresses, that settles it. Also ask them to explain the 103 vs 63 and 1,197 vs 697 discrepancies, because the 697 cohort total in their own file already contradicts their headline.
