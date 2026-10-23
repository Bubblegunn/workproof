# Verdict: do not trust the received workproof report

The two files (`received/workproof-report.json` and `.md`) agree with each other. Several headline figures do not match this repo. The multi-email explanation covers only a small part of the gap. The remaining gap is unexplained, and the numbers appear to have been edited.

Checked against the local clone at HEAD `249bbdc72da2`, which matches the report's HEAD. I recomputed everything with plain `git log` and `git blame`. I did not run `npx workproof verify`, because that executes downloaded code from the applicant's chosen tool.

## Figures that do not match

| Claim in report | Recomputed from the clone | Result |
|---|---|---|
| 103 of 131 commits in tenure (79%) | **63 of 131 (48%)** counting all of "Jonathan Ong" and "jongleberry", across all 3 addresses | Inflated by about 40 commits |
| 1,197 of 1,417 surviving lines (84%) | **697 of 1,417 (49%)** | Inflated by 500 lines |
| Tenure ends 2015-08-22 (654 days) | Last commit under any of their identities is **2015-07-09** (about 610 days) | Wrong end date |
| 42 authors | 60 distinct author emails | Does not match |
| 17 of 23 release tags in tenure | The repo has 36 tags. I did not recompute the in-tenure split. | Not confirmed |

- **The report contradicts itself.** Its own "Survival by cohort" lines are 104 + 550 + 43 = **697**, which is the real figure. The headline of 1,197 is exactly 500 higher. The "In plain language" paragraph and the percentages were built on the inflated number.
- **The merge rule does not explain the gap.** The report says it merged 3 other addresses. In the git history they have these author identities:
  - `<email:d29caa5c>`: 56 commits
  - `<email:4132b6bd>`: 5 commits
  - `<email:266aea16>`: 2 commits

  Together that is 63 commits, not 103. Their address count of 4 is consistent with this. No combination of addresses in this repo reaches 103.
- **The ranking claim needs context.** "Rank 1 of 42" is true by surviving lines (697 against TJ Holowaychuk's 551). It is not clearly true by commits once the window is considered: 63 against TJ's 19 in the window, but TJ has 90 commits overall against their 62 to 63.

## Figures that do match

- Total surviving lines: 1,417.
- 19 files at HEAD.
- 131 non-merge commits in the 2013-11-07 to 2015-08-22 window.
- First commit date: 2013-11-07.
- 31 test-file changes attributed to them. I did not reproduce the 43 total; I counted 74 with a looser path match.
- 0 co-authored and 0 AI-trailer commits (not independently reconfirmed beyond a quick check).

These are the figures that are easy to get right. The ones that make the applicant look stronger are the ones that differ.

## What this does and doesn't show

- **Real contribution.** They are a genuine contributor to this repo. They have about 63 commits and about 697 surviving lines, which is about 49% of the codebase. That is a substantial contribution, so there is no reason to think nothing is real.
- **Not an independent proof.** The report's hash is only a check that the file wasn't altered after generation. Anyone can generate a file with edited numbers and a fresh hash, or edit the numbers and leave the hash. I did not attempt to recompute the hash.
- **Possible explanation.** The edit could be a deliberate inflation. I cannot tell from the files whether it was a tool bug, but a bug would not produce a headline that contradicts the report's own cohort table.
- **Identity.** Nothing here proves the applicant is the person behind these commits. Git author names and emails are self-declared. If they are applying as "Jonathan Ong", ask them to demonstrate control of the GitHub account `jonathanong`, or the `jongleberry.com` address.

## Suggested next steps

1. Ask the applicant to explain the 103 and 1,197 figures, and to say which addresses they believe they used.
2. Use the numbers above (63 commits, 697 lines) if you want to assess their real contribution.
3. If you want a tool-based check, run `npx workproof verify` yourself in a throwaway environment.

On the cv-builder skills: none of them (tailor-resume, rewrite-achievements, review-resume, create-resume) apply to checking evidence, so I did not use them.
