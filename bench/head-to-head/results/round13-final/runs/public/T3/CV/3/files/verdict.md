# Verdict: do not trust the headline numbers

The report's authorship figures are inflated, even after merging every email address. The report is internally inconsistent, and it also disagrees with the repo. The repo is `tj/co` (the report calls it "F1"). HEAD matches the report: `249bbdc`.

## What I checked

I recomputed the figures from the local clone with plain `git log` and `git blame`. I merged the same aliases the report merges: `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. That covers the name "Jonathan Ong" and the login "jongleberry". I did not run `workproof verify`, because the tool isn't installed here and I didn't fetch it.

| Claim | Report | Recomputed | Result |
|---|---|---|---|
| HEAD commit | 249bbdc | 249bbdc | matches |
| Files alive at HEAD | 19 | 19 | matches |
| Total lines attributed by blame | 1,417 | 1,417 | matches |
| Non-merge commits by all authors in the window | 131 | 131 | matches |
| Active ISO weeks | 24 | 24 | matches |
| Release tags in the window | 23 | 23 | matches |
| First commit | 2013-11-07 | 2013-11-07 | matches |
| **Applicant's commits in the window** | **103 of 131 (79%)** | **63 of 131 (48%)** | **false** |
| **Surviving lines at HEAD** | **1,197 of 1,417 (84%)** | **697 of 1,417 (49%)** | **false** |
| Last commit | 2015-08-22 | 2015-07-09 for non-merge work | misleading |

## Problems

1. **Commit count is overstated by about 40.**
   - Across all aliases there are 63 non-merge commits in the whole history, and all 63 fall inside the window.
   - Counting merge commits as well gives 76 across all aliases, which is still below 103.
   - No combination of the applicant's addresses reaches 103.

2. **Surviving lines are overstated by 500.**
   - Blame at HEAD gives the merged identity 697 lines: 585 + 111 + 1.
   - The report claims 1,197.
   - The report's own "Survival by cohort" figure (104 + 550 + 43) sums to 697. It contradicts its own headline of 1,197.
   - My per-year split of those 697 lines also matches the report's cohort split.
   - So the cohort figure is genuine, and the headline figure was edited or inflated.
   - The narrative then says this "is the one that lasts, and here it is the higher of the two", which leans on the inflated number.

3. **The tenure end date is weaker than it looks.**
   - 2015-08-22 is a merge commit by `jongleberry` (PR #238 merge).
   - The applicant's last non-merge commit is 2015-07-09.
   - This is minor, but it stretches the "654 days" span.

4. **Smaller discrepancies.**
   - The report counts 42 people, but I found 44 distinct author emails in the window.
   - The report's ownership ranking ("rank 1 by surviving lines") is plausible but is built on the inflated number. The honest figure of 697 still ranks first, ahead of TJ Holowaychuk's 551.

5. **The integrity hash proves nothing.**
   - The hash is an unkeyed sha256 over the report's own contents.
   - Anyone who edits the figures can recompute it, so a matching hash only shows the file is self-consistent.
   - The JSON also suggests the figures were edited after generation. 1,197 does not equal the sum of its own byYear breakdown, and a real run would have produced consistent output.

## What is legitimate

The alias merging is valid. The applicant did commit under several addresses, and the merged commit and line counts do put them ahead of every other contributor except possibly TJ on commits. The real numbers are respectable: the top surviving-line share at 49%, 63 commits and 24 active weeks. The submitted report exaggerates them: 79% of commits, 84% of lines.

## Recommendation

- Treat the report as altered. Ask the applicant to explain the 103 and 1,197 figures.
- Better, have them run `npx workproof verify` against their own JSON in a fresh clone. Or use the recomputed numbers above, which you can reproduce with `git log --no-merges --format=%aE` and `git blame --line-porcelain -w -M HEAD`.
- Don't treat a clean `workproof verify` as proof if the file was edited and re-hashed. Compare against your own clone, as done here.
