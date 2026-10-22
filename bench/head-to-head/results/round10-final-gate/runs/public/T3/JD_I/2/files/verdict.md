# Verdict: do not trust the figures in the received workproof report

The merged-identity explanation is real, but it does not account for the numbers. Two headline figures are inflated, and the report contradicts itself.

## What I checked

I recomputed each figure in `received/workproof-report.{md,json}` from the local clone with plain `git`. The clone is at HEAD `249bbdc72da2`, matches the report's HEAD, is not shallow, and has 19 files. I did not run `npx workproof verify`, because that would execute downloaded code. I also didn't recompute the report hash. A hash only shows the file wasn't edited after it was generated. It doesn't show the numbers are right.

| Figure | Report says | Recomputed from clone | Result |
|---|---|---|---|
| Commits in tenure window (2013-11-07 to 2015-08-22), all authors | 131 | 131 | matches |
| Applicant's commits in window | **103 (78.6%)** | **63 (48.1%)**: 56 `<email:d29caa5c>`, 4 `<email:4132b6bd>`, 2 `<email:266aea16>`, 1 `<email:4132b6bd>` (as "jongleberry") | **false, overstated by 40** |
| Number of identities | 4 (3 merged) | 4 (the addresses above) | matches |
| Surviving lines at HEAD, total | 1,417 | 1,417 | matches |
| Applicant's surviving lines | **1,197 (84.5%)** | **697 (49.2%)**: 696 "Jonathan Ong" + 1 "jongleberry" via `git blame -w -M` | **false, overstated by 500** |
| Survival by cohort (2013/2014/2015) | 104 + 550 + 43 = 697 | not recomputed per year; the sum equals the real total | matches the real total, contradicts the report's own 1,197 |
| Last commit in tenure | 2015-08-22 | 2015-07-09 (applicant's latest commit under any of the four identities) | does not match |
| Tags in window | 23 | 23 | matches |
| Authors in repo | 42 | 59 distinct names, 60 distinct emails (all history) | does not match (may be a different counting rule) |
| Files at HEAD | 19 | 19 | matches |

## Why this isn't the multiple-addresses effect

- I counted every address and name variant tied to the applicant, including `<email:4132b6bd>`, the GitHub noreply address and the "jongleberry" name. The total is 63 commits in the window. The report's own identity list gives the same four, so the extra addresses are already counted and the report's 103 is still 40 too high.
- The report's own cohort table sums to 697 lines. That matches the real blame result and contradicts the 1,197 headline. A tool computing both from one blame pass would not produce this. It looks like the headline number was edited or the cohort table came from a different run.
- The 2015-08-22 end date and the 103 count both exceed what the repository supports.
- The report's overall framing ("their work survived better than the count of changes suggests", "the higher of the two") rests on the inflated 84% surviving share. The real figures are about 48% of commits and 49% of surviving lines. That is still a substantial contribution. Jonathan Ong has the most surviving lines (697 vs 551 for TJ Holowaychuk), but it is not what the report claims.

## What is genuine

The repo, HEAD, window size (131), total surviving lines (1,417), file count (19) and tag count (23) all check out. The applicant does appear to have contributed real work to this repo, mainly under the `<email:d29caa5c>` identity.

## Caveats

- I assumed all four identities are the applicant. I can't prove that from the repo alone. If some belong to someone else, the real figures are lower.
- I did not check the secondary figures: test-file share, files-authored (DOA), commit size, cadence weeks or footprint percentages.

## Recommendation

Treat the report as unreliable evidence. Ask the applicant to explain the 103 commits and the 1,197 lines. A reasonable test is to have them run `npx workproof` themselves in your clone, or you can run it yourself in a sandbox. Use the verified figures (about 63 commits, about 697 surviving lines) if you evaluate their contribution.
