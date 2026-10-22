# Verdict on received/workproof-report.{md,json}

**Do not trust the figures as written.** The commit and surviving-line numbers are inflated compared with what this repo shows. The numbers that were inflated are the ones that would favour the applicant.

I recomputed everything with plain `git` against the local clone (HEAD `249bbdc72da2`, which matches the report's HEAD). I did not run `npx workproof`, because that would execute untrusted third-party code from inside the repo.

## What I checked

| Claim in report | What the repo shows | Result |
|---|---|---|
| HEAD `249bbdc72da2` | Same | Matches |
| 131 non-merge commits in tenure window (2013-11-07 to 2015-08-22) | 131 | Matches |
| **103 of those 131 are the subject's (78.6%)** | **63 (about 48%).** All identities combined: `Jonathan Ong <<email:d29caa5c>>` 56, `Jonathan Ong <<email:4132b6bd>>` 4, `jongleberry <<email:266aea16>>` 2, `jongleberry <<email:4132b6bd>>` 1. | **False, overstated by 40 commits** |
| **1,197 of 1,417 surviving lines are theirs (84.5%)** | Total of 1,417 matches. `git blame -w -M` gives **696 lines** for "Jonathan Ong" (about 49%). | **False, overstated by about 500 lines** |
| Cohort lines 104 + 550 + 43 | These add up to **697**, which matches the real blame count. They contradict the report's own 1,197. | The report is internally inconsistent |
| Rank 1 by surviving lines | 696 against TJ Holowaychuk's 551 | True, but the lead is much smaller than implied |
| Tenure 2013-11-07 to 2015-08-22 | The first commit is 2013-11-07. The last non-merge authored commit is **2015-07-09**. 2015-08-22 is a merge commit (PR #238, a typo fix by someone else) made by `jongleberry`. | Roughly true, but the end date is a merge commit, not authored work, and the span is stretched by about 6 weeks |
| 19 files, 1,417 lines | 19 files, 1,417 lines | Matches |
| 42 authors | 60 distinct emails and 59 distinct names in the full history | Does not match. The report's figure is probably window-scoped, and I did not pin it down. |
| 23 release tags in tenure | 36 tags in the repo in total | Plausible, not checked in detail |
| Report hash `d54f08…` | I could not reproduce it. The canonicalization is not specified well enough to recompute without the tool. | Unverified |

## Other observations

- **The report never names the applicant.** The "subject" identity is `Jonathan Ong, jongleberry`. That is the repo's owner and maintainer, and also the git user configured in your clone. It is the same person who merges everyone else's PRs. The applicant should explain how this is their work. Ask them for their actual commit email or GitHub login, and check it against `git log`.
- **The merged-identity claim is only partly true.** Merging several addresses is legitimate here, because the same person really does appear under 4 name and email combinations. But that merge only gets you to 63 commits. It does not get you to 103.
- **Several figures could not be reproduced:** 103 commits, 1,197 lines, and the 42-author count. The cohort numbers (697 lines) do match the real data, so the headline 1,197 figure was changed or computed on something other than this repo.
- **Verification would not show a tampered file reliably.** The report says `npx workproof verify` will catch edited numbers. That only holds if the tool is trusted and the hash covers what it claims. Treat the report as self-attested data, and do not treat it as proof.

## Bottom line

The tool output is a self-reported file. The real, defensible numbers from this clone are:

- about 63 commits, roughly 48% of the commits in the period
- about 696 surviving lines, roughly 49% of the lines in the project
- an active period of roughly 2013-11 to 2015-07

They are still substantial contributions to this repo. But the report overstates them and has an internal contradiction, so it should not be accepted as evidence without the applicant explaining the discrepancy.

Consider asking the applicant for the exact email addresses they say they used, and for the command output they ran.
