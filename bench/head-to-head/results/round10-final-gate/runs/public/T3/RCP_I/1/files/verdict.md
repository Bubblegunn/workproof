# Verdict on received/workproof-report.{md,json}

**Do not trust the headline numbers.** The report looks like genuine `workproof 0.7.0` output for this repo, and the repo-wide figures match. The numbers credited to the applicant are inflated, though, and the multiple-email explanation does not account for the gap.

## What I checked
I recomputed the figures from your local clone with plain `git log` and `git blame`. I did not run `npx workproof verify` because it needs the network. I read the two files as data and did not execute anything from them.

I merged every address of the applicant's that exists in the history: `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. The names are "Jonathan Ong" and "jongleberry".

| Claim | Report | Recomputed | Result |
|---|---|---|---|
| HEAD | 249bbdc | 249bbdc | matches |
| Tenure | 2013-11-07 to 2015-08-22 | same (the last day is a merge commit by jongleberry) | matches |
| Non-merge commits in tenure, all authors | 131 | 131 | matches |
| Files alive at HEAD / lines attributed | 19 / 1,417 | 19 / 1,417 | matches |
| **Applicant's commits** | **103 (78.6%)** | **63 (48%)** | **inflated by 40** |
| **Surviving lines** | **1,197 (84.5%)** | **about 697 (49%)** | **inflated by about 500** |

For the surviving-lines row, `git blame` gives 585 lines to the gmail address and 111 to `<email:4132b6bd>`. That is 696 before the noreply address, so about 697.

## The report contradicts itself
- Its "Survival by cohort" figure lists 104 + 550 + 43 lines, which is **697**. That matches blame and not the 1,197 in the headline figure.
- The plain-language text says surviving lines are "the higher of the two" shares (84% against 79%). With the real numbers they are about 49% and 48%, so that sentence does not hold.

## The "several email addresses" explanation
- Merging does raise the count: 56 commits from the main address, plus 4 and 3 from the other two, gives 63. That is about 12% more.
- It cannot reach 103. Every other address in the history belongs to someone else. TJ Holowaychuk alone has 90 non-merge commits, and there are about 59 distinct author names. Reaching 103 or 1,197 would mean counting other people's work as the applicant's.

## Other concerns
- **Whose identity is this?** "Jonathan Ong / jongleberry" is the repo maintainer, and the same name as your configured git user. Either the applicant is that person, or the report claims someone else's commits. The report hides the emails (`emails: []`), so you can't tell from the files. Ask the applicant which addresses are theirs.
- **Automatic merging.** The merge rules were "same name on another address" and "GitHub login matches". A matching name does not prove the same person.
- **Integrity hash.** I could not recompute the `d54f0828…` hash offline. A hash only shows the file is unchanged since it was generated. It does not show the inputs were honest. Run `npx workproof verify` in your clone on a networked machine. I expect it to fail to match.
- **Scope.** This is one repo with old work (2013–2015). It says nothing about recent work.
- **Pre-existing file.** A `verdict.md` was already in this folder, dated 19:45, before I wrote this one, and I didn't create it. I checked its main numbers (63 commits, about 697 lines) and they agree with mine. This file replaces it.

## Bottom line
The applicant's real contribution here is about 63 commits (48%) and about 697 surviving lines (49%) of a small repo. The report claims roughly 1.6 to 1.7 times that. Treat it as unreliable evidence and ask the applicant to explain the 103 and the 1,197.
