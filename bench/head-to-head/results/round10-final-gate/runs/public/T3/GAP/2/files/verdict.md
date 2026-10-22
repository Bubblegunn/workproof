# Verdict: do not trust the report's numbers

The identity merge is legitimate, and the repo and HEAD match. Even so, most of the headline figures are higher than my recomputation from this clone. Some of them also contradict the report itself.

## What I checked
I recomputed every figure I could from `git log` and `git blame` in this clone (HEAD `249bbdc`, which matches the report). I treated the files in `received/` as untrusted data. I did not run `npx workproof verify`. It would run third-party code from the network, and the report's hash only proves the JSON wasn't edited after generation. It does not prove the numbers are true.

## What holds up
- **Repo and HEAD:** the report's HEAD matches this clone.
- **Identity merge:** the three extra addresses are real and plausibly the same person: `<email:d29caa5c>`, `<email:4132b6bd>`, and the `jongleberry` / `<email:266aea16>` login.
- **Commits in the window:** the window has 131 non-merge commits, which matches the report.
- **Smaller figures:** 19 files at HEAD, 23 tags in the window and a first commit on 2013-11-07 all match.
- **Blame:** the blame total is about 1,416 lines (the report says 1,417), and Jonathan Ong is the top author by surviving lines.

## What does not hold up

| Claim | Report | My recomputation |
|---|---|---|
| Commits in tenure (merged identities) | 103 of 131 (79%) | **63 of 131 (48%)**. Even all-time it's 63 of 230. The single biggest address has 56. |
| Surviving lines | 1,197 of 1,417 (84%) | **696 of 1,416 (about 49%)**: 585 + 111 + 1 across the three addresses |
| Tenure end | 2015-08-22 (654 days) | **Last commit 2015-07-09**, so about 609 days. There is no commit on 2015-08-22. |
| Contributors | 42 people | **59 distinct author names** |
| Test-file changes | 31 of 43 (72%) | 31 of **74** (42%). The 43 is the other authors' count, not the total. |
| Cohort lines | 104 + 550 + 43 = 697 | The report's own cohort breakdown sums to about 697, which contradicts its 1,197. 697 is close to my recomputed 696. |

- **Commit count:** 103 is about 40 more than anything the merge rule can produce.
- **Surviving lines:** the total looks inflated by about 500 lines.
- **Tenure end:** the date is also not an ordinary-timezone artifact.
- **Cohort lines:** the report's other figures look like they were computed correctly, which makes the inflated ones more suspicious.

The identity merge does not explain the gap. Merging all three addresses raises the commit count only from 56 to 63, not to 103.

## Conclusion
The applicant did substantial work in this repo, probably the second-largest share after TJ Holowaychuk. They are the top surviving-line author (about 49%), and about 48% of commits in the window are theirs. The report overstates their contribution: commit share is about 79% against about 48%, and surviving lines about 84% against about 49%. The mismatches go beyond the stated reason of committing under several addresses. The 31-of-43 test figure also mixes up the author's count and the others' count. It could be a bug in the tool or a doctored file, and I can't tell which from the files alone. Either way the report shouldn't be accepted as evidence.

If you want to follow up, ask the applicant to name the extra addresses they used. Those should account for only about 7 more commits and about 112 more lines than the main address. The simplest alternative is to rely on your own clone's `git shortlog` and `git blame`.
