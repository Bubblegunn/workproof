# Verdict on received/workproof-report.{md,json}

**Do not trust the report as sent.** Some figures are exact. Several others are inflated, and the inflated ones are the ones that make the applicant look strongest. The multiple-email explanation covers only a small part of the gap.

## What I checked
I recomputed the figures from this clone (HEAD `249bbdc`, which matches the report's HEAD). I used plain `git log` and `git blame`. I did not run `npx workproof verify`, because that would download and execute code from the network. I did not need it.

The report treats "Jonathan Ong" and "jongleberry" as one person, merged across 4 addresses. I applied the same merge (same name or GitHub login, any address).

| Claim | Report | Recomputed | Result |
|---|---|---|---|
| HEAD | 249bbdc72da2 | 249bbdc72da2 | matches |
| Tenure | 2013-11-07 to 2015-08-22 | same | matches |
| Non-merge commits in tenure, all authors | 131 | 131 | matches |
| **Subject's commits in tenure** | **103 (78.6%)** | **63 (48%)** | **inflated by 40** |
| Active weeks | 24 | 24 | matches |
| Files alive at HEAD | 19 | 19 | matches |
| Lines attributed at HEAD | 1,417 | 1,416 | matches within 1 |
| **Subject's surviving lines** | **1,197 (84.5%)** | **696 (49%)** | **inflated by about 500** |
| Absence factor | 42 authors | 60 distinct emails | differs; not checked further |
| **Commit rank** | **"ranks 1 of 42"** | **TJ Holowaychuk 90 commits vs 63** | **false** |

## Findings
1. **Commit count.** Merging all the applicant's addresses gives 63 commits, all of them inside the tenure window. The report says 103. Merging in every direction still does not reach 103.
   - Without merging, the largest single address (<email:d29caa5c>) has 56 commits.
   - TJ Holowaychuk has 90 commits, so the applicant is not first by commit count.
2. **Surviving lines.** Blame gives the subject about 696 lines, against TJ Holowaychuk's 551. The report's own cohort breakdown (104 + 550 + 43) adds up to 697, which matches my number. The headline of 1,197 is about 500 higher than the report's own breakdown. So the file is internally inconsistent, and it looks edited.
3. **The "they merged identities" explanation is only partly true.** The identity merge is real. It moves the applicant from 56 commits to 63, not from about 60 to 103. It cannot account for the gap.
4. **The integrity hash proves nothing.** The "Report hash" is a SHA-256 of the report's own contents, and anyone can recompute it offline. It shows the file wasn't changed after the hash was made. It doesn't show the numbers came from the repo. The 1,197 figure also contradicts the cohort figures it sits beside, which an untouched tool run should not produce.
5. **Figures I did not independently confirm:** test-file changes (31 of 43), cadence streaks, tag counts, files authored (10 of 19), and commit size.

## Caveats
- **Identity.** The "Jonathan Ong" identity in the report is the same name as this clone's git user (you). If the applicant is someone else, then the report is claiming your commits. Check who they say they are and what addresses they gave you. The real subject may just be you.
- **Sizes.** The sizes of the inflated numbers (103 vs 63, 1,197 vs 696) are my recomputation. A different merge rule might shift them slightly, but not by 40 commits or 500 lines.
- **Wider history.** Even the true figures only describe this repo's history. A clone doesn't show squashed or rewritten history.

## Recommendation
Ask the applicant which addresses they used, and for the exact `workproof` command and output. Compare their addresses against `git log --format='%an <%ae>' | sort | uniq -c`. Treat the report's numbers as unreliable until they explain the 103 and the 1,197. The true figures are still a real contribution, but not the one shown.
