# Verdict: do not trust the headline numbers

The two files (`workproof-report.md` and `.json`) match each other and the repo in places. The two main claims, commit share and surviving lines, are inflated compared with what git shows in this clone.

## What I checked (read-only, against the local clone)

The report is for a repo it calls "F1", at HEAD `249bbdc`.

| Claim | Report | Recomputed from clone | Result |
|---|---|---|---|
| HEAD commit | `249bbdc72da2…` | `249bbdc72da24ae44076afd716349d2089b31c4c` | Matches |
| Non-merge commits in the window 2013-11-07 to 2015-08-22 | 131 | 131 | Matches |
| First and last commit dates | 2013-11-07 to 2015-08-22 | First commit 2013-11-07. Last commit is 2015-07-09. | First date matches. Last date is about 6 weeks later than any commit by these identities. |
| **Subject's commits in the window** | **103 (78.6%)** | **62 (about 47%)**: 56 `<email:d29caa5c>`, 4 `<email:4132b6bd>`, 2 `<email:89962dec>`. Across all history it is 63. | **Inflated by about 40 commits** |
| Files alive at HEAD | 19 | 19 | Matches |
| **Surviving lines credited to the subject** | **1,197 of 1,417 (84.5%)** | **696 of about 1,416 (about 49%)**, from `git blame -w -M` summed over all files. TJ Holowaychuk has 551. | **Inflated by about 500 lines** |
| Authors in the project | 42 | 44 in the window, 59 in all history | Doesn't match (minor) |
| Rank by commits and by surviving lines | 1 | 1 by surviving lines (696 vs 551). 1 by commits in the window (62 vs TJ's 19). | Holds, but only because the true numbers are still the top ones |

## The report contradicts itself

The report's own "Survival by cohort" figure lists 104 + 550 + 43 = **697** lines. That matches my 696 from blame. Its headline says 1,197. The cohort breakdown comes from the same blame pass, so the headline total is about 500 lines higher than the report's own data supports.

The summary paragraph stresses that the surviving-lines share (84%) is well above the commit share (79%). On the real figures the two are about equal (about 49% and about 47%), so the "their work survived better than the commit count suggests" point doesn't hold either.

## What this says about the "several email addresses" explanation

Merging addresses does add commits. The clone has 4 identities for this person: 2 name spellings and 3 emails. Counting all of them gives 62 commits in the window. The first line of the report's output uses the same merge rule I applied. Reaching 103 would need about 40 more commits that no author string in this clone supports. Multiple addresses explain the gap between a plain single-address count (56) and 62. They don't explain 103.

## Other points

- **Identity:** The report never names the applicant. It names "Jonathan Ong, jongleberry". Your git user is also Jonathan Ong, and the repo's top contributor of that name is the real project author. Confirm with the applicant which of these identities and emails are theirs. If they are not that person, the whole report describes someone else's work.
- **Tamper check not run:** The report says `npx workproof verify` / `check` can detect edited numbers. I did not run it, because that would download and execute third-party code. The mismatches above suggest the numbers were edited or came from a different clone, but I haven't proven which. If you want a definitive answer, run the tool yourself in a sandbox against this clone.
- **Not checked:** the footprint, files-authored (10/19), test-change and cadence figures. I recomputed only the commit, blame and HEAD figures.

## Recommendation

Treat the reports as unreliable. Ask the applicant to explain the 103 commit count and the 1,197 surviving-line count, and to say which email addresses are theirs. The real figures, if you want them, are roughly 62 commits (about 47% of the window) and 696 surviving lines (about 49%). That is still the top contribution to the repo, but a different claim from the one made.
