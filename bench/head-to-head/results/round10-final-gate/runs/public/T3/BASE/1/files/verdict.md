# Verdict: do not trust the headline numbers in `received/`

The two files (`workproof-report.json` and `.md`) are one report from a tool called "workproof 0.7.0". I recomputed its main figures from this clone (HEAD `249bbdc`, same as the report's HEAD). **The identity merge is not what inflates the numbers. The headline figures are overstated, and some are contradicted by the report itself.**

## What I checked

| Claim in report | What the clone shows |
|---|---|
| HEAD `249bbdc72da2` | Matches. |
| 131 non-merge commits in the window 2013-11-07 to 2015-08-22 | Matches (131). |
| Tenure 2013-11-07 to 2015-08-22 | Matches. First commit is 2013-11-07 and last is 2015-08-22 (as `jongleberry`). |
| **"103 of 131 commits (79%)"** | **False.** Counting every address that could belong to the subject, I get **63 of 131 (about 48%)**. That is the `<email:d29caa5c>` address (56 in the window), `<email:4132b6bd>`, and the `jongleberry` noreply address. 103 is not reachable by any reading of the history. The repo has 64 non-merge commits in total under these names, across all dates. |
| **"1,197 of 1,417 surviving lines (84.5%)"** | **False.** Total attributed lines is 1,417 (matches), but a full `git blame -w -M` gives **696 lines to "Jonathan Ong" and 1 to "jongleberry", about 49%**. TJ Holowaychuk has 551. |
| Report's own cohort table (2013: 104, 2014: 550, 2015: 43) | Sums to **697**, which matches my blame count. It contradicts the report's own 1,197. The summary figure was changed, or computed wrongly, and the breakdown was left alone. |
| "Ranks 1 of 42 authors", "2 authors cover half the commits" | The rank is plausible only on the full history. Author count is roughly right, but a rank of 1 is questionable. In the window, `<email:d7c7dcd6>` has 19 commits and the applicant's addresses together have about 63. |
| 10 of 19 files "authored" | Not recomputed. It uses a fitted formula, and the blame figure it depends on is already shown to be wrong. |
| Identity merging ("3 other addresses") | The merge itself is legitimate. The addresses `<email:4132b6bd>` and `<email:266aea16>` are real, and I counted them. Even with all of them, the commit and line figures don't reach what is claimed. |
| Report hash `d54f08…` | I could not reproduce it. I tried plain sorted-key JSON and did not have the tool's RFC 8785 canonicalisation. This is inconclusive, not proof of tampering. The hash is unkeyed, so anyone who edits the numbers can recompute it. It proves nothing about honesty. |

I did not run `npx workproof verify`. It would need to fetch and execute a package from npm, and it adds nothing the direct git recomputation doesn't already cover.

## Other concerns

- **The identity is yours, not an applicant's.** The report names "Jonathan Ong" and "jongleberry", which is the repo's real maintainer and the same name and email as this clone's configured git user. Nothing in the report names the applicant. If the applicant is not Jonathan Ong, the report describes someone else's work. If they say they are, ask why they need a tool to prove it. Check who this person is against what they have told you.
- **No per-commit evidence.** The report has no commit hashes, so it can't be spot-checked. Emails are hidden (`emails: false`).
- **Error direction.** Every discrepancy I found inflates the subject's share (79% vs 48% of commits, 84% vs 49% of lines). None goes the other way. The internal contradiction (1,197 vs a cohort sum of 697) suggests the numbers were edited or generated carelessly.

## What the clone actually supports

The subject's addresses account for about **63 of 131 commits (48%)** in that window and about **49% of the surviving lines**. That is a significant contribution, and the second-largest in the repo after TJ Holowaychuk. It is still well short of what the report claims. The multiple-address explanation is real but doesn't account for the gap.

## Suggested next step

Ask the applicant for the exact commit hashes or email addresses they used. Then run `git log --author=<addr>` yourself. Don't rely on the report's figures.
