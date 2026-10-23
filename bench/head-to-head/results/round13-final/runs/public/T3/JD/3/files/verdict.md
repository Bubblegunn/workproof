# Verdict: do not trust the figures in `received/`

The two files (`workproof-report.json` and `.md`) agree with each other. The key numbers do not agree with the repository, and some disagree with the report itself. The report looks edited, or it was generated from different data than this clone.

## What I checked

I recomputed the figures from the clone with plain `git log` and `git blame`.
- Clone HEAD is `249bbdc72da2`, which matches the report's HEAD.
- The repo is a 19-file project with 230 non-merge commits.
- The report calls the repo "F1" and attributes the work to "Jonathan Ong, jongleberry".
- The repo's author identities are "Jonathan Ong" on two addresses and "jongleberry" on two more (a GitHub noreply address and <email:4132b6bd>).

| Figure | Report says | Clone says |
|---|---|---|
| Subject's surviving lines | **1,197 of 1,417 (84.5%)** | **about 697 of 1,417 (about 49%)** |
| Subject's commits in the tenure window | **103 of 131** | **about 61 of 131** (63 across all history) |
| Tenure end | **2015-08-22** | **2015-07-09** (last commit by any of those identities) |
| Authors (absence factor) | **42** | **60** distinct emails |
| Total surviving lines | 1,417 | 1,417 (matches) |
| Tenure start | 2013-11-07 | 2013-11-07 (matches) |
| Active weeks | 24 | 24 (matches) |
| Files at HEAD | 19 | 19 (matches) |
| Files touched | 34 | 35 (close) |

Details on the mismatches:
- **Surviving lines.** The report's own cohort table (2013: 104, 2014: 550, 2015: 43) sums to 697. The headline says 1,197, which is exactly 500 higher. My blame count by year reproduces 104, 550 and 43 exactly. The cohort table is genuine, but the headline contradicts it.
- **Commit share.** Counting all four Jonathan Ong / jongleberry addresses, I get about 61 commits in the window, not 103. The largest single address has 56 commits across all history. The top committer overall is TJ Holowaychuk with 90. The report's "ranks 1 by share of surviving lines" and "103 of 131" are not supported.
- **Merging identities.** The applicant says their numbers are higher because they committed under several addresses. That explanation doesn't hold up. The merging is real, since the report reports 3 merged addresses. But it only adds 5 to 7 commits to the 56 on the main address, and it can't produce 103.
- **Tenure end.** The report's 2015-08-22 end date matches no commit by these identities. The latest is 2015-07-09.

## Not checked
- I did not run `npx workproof verify` or `check`. I only recomputed the figures by hand.
- I did not check whether the applicant is actually the person behind these identities. Matching names and emails in git history is not proof of identity. Anyone can set `user.name` and `user.email` to match another person's, and the report was never shown to come from the applicant's own account.
- The figures that did match are the ones that are easy to reproduce from public history, so a match doesn't vouch for the rest.

## Recommendation
Treat the report as unreliable evidence. Don't use the headline figures in a hiring decision. Ask the applicant to:
- re-run `npx workproof verify` in front of you, or
- name the specific commits they say are theirs, so you can check them directly in the clone.

You can also check the commits yourself: `git log --no-merges --author=<name>` shows each identity's real history.
