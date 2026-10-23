# Verdict: do not trust the report's headline numbers

The applicant's `workproof-report.{md,json}` describes the right repository, but its figures for the applicant are inflated. Their contribution is real and substantial. It is smaller than the report says.

## What I checked

I recomputed the figures with plain `git` in the local clone. I did not run `npx workproof`, because that would execute third-party code. The clone is at HEAD `249bbdc72da2` and is not shallow.

| Claim in report | Recomputed from the clone | Result |
|---|---|---|
| HEAD `249bbdc72da2` | `249bbdc72da2` | Matches |
| 19 files alive at HEAD | 19 | Matches |
| 131 non-merge commits in the tenure window (2013-11-07 to 2015-08-22) | 131 | Matches |
| 1,417 surviving lines at HEAD | 1,417 (`git blame -w -M`, all files) | Matches |
| **103 of 131 commits are the applicant's (79%)** | **63 of 131 (48%)** | **Inflated by 40** |
| **1,197 of 1,417 surviving lines are theirs (84%)** | **697 of 1,417 (49%)** | **Inflated by 500** |
| Tenure ends 2015-08-22 | Their last commit is 2015-07-09. No commit by anyone is dated 2015-08-22. | Not supported |
| Rank 1 of 42 authors | The applicant is still the top committer in the window and top blame author. | Plausible |

The merged identities are legitimate. The applicant's addresses are:
- `<email:d29caa5c>` (56 commits)
- `<email:4132b6bd>` (5)
- `<email:266aea16>` (2)

That gives 63 commits, and I counted them with all three included. Merging the extra addresses therefore does not explain 103.

The report also contradicts itself. Its own "survival by cohort" figure sums to 104 + 550 + 43 = **697 lines**, which matches my recount and not the 1,197 it states as the total. A tool computing these figures honestly would not produce both numbers.

## Why the numbers can't be trusted

- **The integrity hash does not prove the numbers are right.** The report's `hash` is an unkeyed SHA-256 of its own contents. Anyone who edits the numbers can recompute it, and the repository fingerprint is keyed with a secret that only the applicant holds. I could not check either against the clone.
- **The report is not self-consistent.** The cohort total and the headline surviving-lines count disagree by exactly 500, and the commit count is 40 above what git shows.
- **The report is not a pure git output.** Totals such as 131 and 1,417 match git, but the applicant-specific figures do not. This pattern fits someone editing the "author" side only.
- **I did not check every figure.** I did not recompute cadence, the DOA file-authorship score, commit size or test-change counts. These are probably affected too if the numbers were edited, but I haven't confirmed that.

## What is supportable

- The applicant (Jonathan Ong, across the three addresses above) is the top contributor to this repo by commits and surviving lines.
- Their work spans 2013-11-07 to 2015-07-09, with 63 commits and about 697 surviving lines (roughly 49%).
- Other significant authors include TJ Holowaychuk, who has about 551 surviving lines and 90 commits overall.

## Suggested next steps

- Ask the applicant to explain the 103 and 1,197 figures. If they ran the tool honestly, they should be able to show the exact command and the repository state they used.
- Verify against `git log` and `git blame` yourself, as above, and don't rely on the attached files.
- Treat the claim "my numbers are higher because of several email addresses" as unsupported. The extra addresses add only 7 commits.
