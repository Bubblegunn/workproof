# Verdict: workproof report in `./received`

**Do not trust the headline numbers.** The report is internally consistent and the repo facts are real. But the two headline figures are far higher than what git shows in your clone, and the multiple-email explanation does not close the gap.

## What I checked

I recomputed the figures from the local clone with plain `git log` and `git blame`. I did not run `npx workproof` from the report, because that would download and execute third-party code. The clone is at HEAD `249bbdc72da2`, the same as the report, and is not shallow.

I merged every address that plausibly belongs to the applicant. The clone has three: `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. The report says it merged "3 other addresses", so this is the most generous reading of its own rule.

| Claim in report | Report | Recomputed from clone | Result |
|---|---|---|---|
| Repo HEAD | `249bbdc72da2` | `249bbdc72da2` | Matches |
| Total lines at HEAD (blame) | 1,417 | 1,417 | Matches |
| Non-merge commits in the window (2013-11-07 to 2015-08-22) | 131 | 131 | Matches |
| **Applicant's commits in the window** | **103 (78.6%)** | **63 (48%)**: 56 gmail, 5 jongleberry.com, 2 noreply | **Inflated by 40 commits** |
| **Surviving lines at HEAD** | **1,197 (84.5%)** | **697 (49.2%)**: 585 gmail, 111 jongleberry.com, 1 other | **Inflated by 500 lines** |
| "Rank 1 by surviving lines" | Rank 1 | TJ Holowaychuk has 551 lines. The applicant has 697, so rank 1 holds, but only at about 49%. | Holds, by a thinner margin |
| Authors in the project | 42 | 60 distinct emails overall, 44 in the window | Does not match |
| Test-file changes | 31 of 43 | 30 of 42 | Close, probably rename handling |
| Release tags in the window | 23 | 23 | Matches |
| Tenure end 2015-08-22 | Stated as last commit | The last non-merge commit is 2015-07-09. 2015-08-22 is a merge commit of someone else's PR (#238). | Slightly generous |

## Why the explanation does not hold

- **Multiple emails cannot account for the surplus.** I looked for any other address in the repo plausibly tied to this person. Only the three above exist. The only other near-matches are unrelated people (AutoSponge, Yazhong Liu).
- **The report contradicts itself.** Its own "survival by cohort" figure lists 104 + 550 + 43 = **697** lines. That equals my blame count, but the headline figure beside it says 1,197. A genuine report would have those two numbers agree.
- **The gap is a round number.** 1,197 − 697 = exactly 500.
- **The percentages repeat the inflation.** The 79% commit share and 84% line share in the plain-language paragraph follow from the inflated counts. The honest figures are about 48% and 49%.
- **I could not use the integrity hash.** The stated hash (`d54f0828…`) did not match any of the plausible canonicalisations I tried, and I don't know the tool's exact scheme. That check is inconclusive, not a pass. A matching hash would prove little anyway, because a person editing numbers can recompute it. The `.md` and `.json` agree with each other, which only shows the same numbers were put in both.

## What is genuine

The applicant is a real, major contributor to this repo. They are the top committer in the window, with 63 non-merge commits, and the top author by surviving lines, with 697 of 1,417. They wrote about 49% of the code. The report overstates that as about 84%. The first commit (2013-11-07) and the pattern of work look real.

## Suggested next steps

1. Ask the applicant which fourth address or identity they merged. The report says `count: 4`, but only three addresses exist in this repo. Ask which commits it covers.
2. Ask them to re-run the tool, or send the `--emails` output, so the merged addresses can be checked against `git log`.
3. Treat the person as a strong contributor to this repo, based on the verified numbers. Treat the supplied report as unreliable evidence of their honesty about it. Their inflated figures were presented as tool output.

## Notes

- Only the repo's own history was used. I did not look at GitHub identities, so the report's "GitHub login matches" merge reason is unchecked.
- The cv-builder skills (tailor, rewrite, review, create) were not used, since this was a verification task and not a resume task.
- Scratch script: `/tmp/wpcheck_scripts/h.py`, outside the repo.
