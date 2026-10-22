# Verdict: do not trust the numbers in `received/`

Several headline figures do not match this repo, and every mismatch inflates the applicant's contribution. The report is `workproof` output (`workproof-report.md` and `.json`, HEAD `249bbdc`). Both files make identical claims. The HEAD in the report matches your clone, so it was run against this same history.

## What I checked
I recomputed the figures with plain `git log` and `git blame` on your clone. I did not run `npx workproof verify`, because that would run downloaded tooling named by an untrusted file. I also did not recompute the report hash, so the integrity block is unchecked. The hash would not help anyway, because the figures are wrong at the source.

The subject identity in the report is "Jonathan Ong, jongleberry", which is the same name as the repo's main author and your git user. The report never names the applicant. Ask them which identities and emails they say are theirs.

| Figure | Report claims | Actual in this repo |
|---|---|---|
| Non-merge commits in tenure window, all authors | 131 | 131 (matches) |
| Total blamed lines at HEAD | 1,417 | 1,417 (matches) |
| Files at HEAD | 19 | 19 (matches) |
| Subject's commits | **103** (78.6%) | **63** (48%), counting every identity: 56 + 4 + 2 + 1 across `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. 60 by the name "Jonathan Ong" alone. |
| Subject's surviving lines | **1,197** (84.5%) | **696** (about 49%). TJ Holowaychuk has 551. |
| Tenure end | 2015-08-22 | Last commit by any of these identities is 2015-07-09. The start date, 2013-11-07, is correct. |
| Authors | 42 | 59 distinct names, 60 distinct emails |
| Per-year cohort lines (104 + 550 + 43) | 697 | 697, which matches reality and contradicts the 1,197 headline in the same report |

Details on the mismatches:
- **Surviving lines:** the report's own cohort breakdown adds up to 697, which matches the real blame count of 696. The 1,197 headline is about 500 lines higher than what its own table supports.
- **Commit count:** the report's own text says 3 extra addresses were merged. Even with all identities merged I get 63, not 103.
- **Tenure end:** the date is after the last commit, so it cannot come from the stated command (`first and last commit dates`).
- **Author count:** the report gives 42 and I find 59 or 60.
- **Tags:** the repo has 36 tags, from 2013-06-06 to 2015-07-09. The report says 23 in tenure, which I did not break down.

## Other points
- Some claims are real but weak. Early-history commits are under the maintainer's identity, and the numbers come from a tool that credits whoever's name is on the commit.
- Authorship in git is self-declared, so even a correct report would only show what the commits say.

## Recommendation
- Do not rely on the report. The matching totals (131 and 1,417) show that real data was used, and the subject's figures were then overstated. It could be a tampered file, or a tool run with a wrong identity set. I can't tell which from here.
- Run `git shortlog -sne` yourself and map the emails the applicant claims to commits.
- Ask the applicant to name the exact emails, then compare with their GitHub profile.
- If their claimed identities do not explain the gap between 63 and 103 commits, treat the discrepancy as a serious credibility concern and ask them about it directly.
