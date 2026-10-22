# Verdict on received/workproof-report.{md,json}

**Do not trust the headline numbers. The report is not reliable as evidence.**
Several figures are much higher than the repo supports, even after merging every email address the report itself names. The multiple-email explanation does not account for the gap.

## What I checked
I recomputed the figures from the local clone. HEAD `249bbdc72da2` matches the report's HEAD, so it is the same commit.
I merged all identities that could belong to the subject: `Jonathan Ong` (2 addresses) and `jongleberry` (2 addresses). This is the same merge rule the report says it used.

| Claim in report | What the clone shows |
|---|---|
| 103 of 131 commits in tenure (79%) | **63** non-merge commits (60 as "Jonathan Ong" + 3 as "jongleberry" in the window), about 48% of 131. The window total of 131 is correct, so only the author count is inflated. |
| 1,197 of 1,417 surviving lines (84%) | **697** of 1,417 (49%), by `git blame -w -M HEAD`. The total of 1,417 matches. The claimed figure is about 500 lines too high. |
| Cohort lines 104 + 550 + 43 | Sums to 697, which matches my blame count. The report contradicts itself: its cohort breakdown adds up to 697, not the 1,197 in its headline. |
| Tenure 2013-11-07 to 2015-08-22 (654 days) | First commit 2013-11-07 is right. The last commit under these identities is **2015-07-09**. 2015-08-22 matches none of them, so the tenure is overstated by about 6 weeks. |
| Ranks 1 by surviving lines | Close. 697 vs TJ Holowaychuk's 551. The margin is much smaller than the report's numbers imply. |
| 24 active weeks, 23 tags in tenure | Both match. |
| 34 files touched | I count 35. This is a minor difference. |
| 42 authors | I count 59 distinct author names across all history. I did not check this for the window, so it is inconclusive. |

I did not independently verify: files authored (10/19), test-file changes (31/43), commit size, and the co-author and AI figures.

## On the "several email addresses" explanation
Extra addresses do exist, but they add very little. Across `<email:d29caa5c>` (56), `<email:4132b6bd>` (5 including the jongleberry-named one) and the GitHub noreply address (2), the total is 63 commits.
Merging identities cannot produce 103 commits or 1,197 surviving lines. Blame attribution under every candidate address totals 697.

## Other observations
- The report's integrity hash is `d54f0828…`. I could not reproduce it with my own canonical-JSON attempt. That check is only a weak signal, because my reconstruction of their hashing scheme may be wrong.
- I did not run `npx workproof verify`, because it would run downloaded code from an untrusted source. Running it in a sandbox against the clone is the clean way to get an authoritative answer. Given the mismatches above, I expect it to fail.
- The report names only "Jonathan Ong" and "jongleberry". It never names the applicant. It also uses real names that appear in this repo's history. Confirm the applicant's identity independently, and ask which commits and addresses they say are theirs.
- The md and json files agree with each other. They were most likely edited together, or the numbers were wrong at generation time.

## Recommendation
- Treat the report as unverified and materially overstated.
- Ask the applicant for the exact email addresses they claim, then run `git log --author=<email>` on your clone and compare.
- The real, verifiable figure is about 63 commits and about 697 surviving lines. Judge them on that.
