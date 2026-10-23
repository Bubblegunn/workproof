# Verdict: do not trust the headline numbers

The two files in `./received` (`workproof-report.md` and `.json`, from "workproof 0.7.0") describe real work by "Jonathan Ong" in this repo. The two numbers that matter most are inflated. The report's own detail data contradicts them.

The applicant's explanation, that multiple email addresses push the numbers above a plain count, is allowed for. All of the applicant's addresses are merged in the recomputation below, and the figures are still far below the claims.

## What I checked

I recomputed each figure with plain `git` in the local clone at HEAD `249bbdc72da2`, which matches the report. I did not run `npx workproof verify`, because that executes third-party code.

Identities found in the history (non-merge commits):

| Name | Email | Commits |
|---|---|---|
| Jonathan Ong | <email:d29caa5c> | 56 |
| Jonathan Ong | <email:4132b6bd> | 4 |
| jongleberry | <email:266aea16> | 2 |
| jongleberry | <email:4132b6bd> | 1 |

That is 63 commits across 3 emails and 2 names, so the report's "3 other addresses" is plausible. Other "ong" matches in the history (AutoSponge, Yazhong Liu) are different people.

| Claim in report | Recomputed from the clone | Result |
|---|---|---|
| HEAD `249bbdc72da2` | Same | OK |
| 131 commits by all authors in the window, 2013-11-07 to 2015-08-22 | 131 | OK |
| 1,417 lines at HEAD, 19 files | 1,417 lines, 19 files | OK |
| Tenure: first commit 2013-11-07 | Same | OK |
| Tenure: last commit 2015-08-22 | Latest commit under these identities is 2015-07-09 (last day not checked further) | Minor mismatch |
| 23 tags in the window | 23 | OK |
| 24 active weeks | 24 | OK |
| **103 of 131 commits (79%)** | **63 of 131 (48%)** | **Inflated by 40 commits** |
| **1,197 of 1,417 surviving lines (84%)** | **697 of 1,417 (49%)**: `git blame -w -M` gives 585 + 111 + 1 lines across the three emails | **Inflated by 500 lines** |

My blame run uses the report's own flags and has no ignore-revs file. Lines of code for everyone else at HEAD: TJ Holowaychuk 551, Will Conant 36, welefen 25, Jorge Bucaran 25, and others.

## Why this looks like editing, not a different method

- The report's own "Survival by cohort" figure (104 + 550 + 43 lines) sums to **697**. That equals my merged blame count, and it contradicts the report's 1,197 headline.
- 1,197 of 1,417 lines would leave only 220 lines for everyone else. TJ Holowaychuk alone has 551 surviving lines.
- Counting every address cannot produce 103 commits or 1,197 lines. There are only 63 commits and 697 lines under all of the applicant's addresses.
- The prose paragraph's claim that surviving lines are "the higher of the two" (84% vs 79%) rests on the inflated numbers. With the real figures, commit share is 48% and surviving-line share is 49%.

## What I could not confirm

- **Integrity hash:** I could not reproduce it (`d54f0828…`). I tried two plausible canonicalizations, and the exact scheme is the tool's. The hash also wouldn't prove anything here, because anyone who edits a figure can recompute it. Treat it as unverified.
- **Other figures:** I did not recompute files authored (10 of 19), commit size, test-file share, language split or the 42-author count. I found 60 distinct author emails against the report's 42 authors, but that may be a counting difference. The other figures are secondary to the two that are already wrong.
- **Skills:** I did not use the cv-builder skills. They draft and edit resumes, and this was a verification task.

## Bottom line

- **Accurate:** the applicant did commit to this repo under several addresses, with 63 commits and about 697 surviving lines, and they are a top contributor in the window.
- **Not accurate:** the 103 commits (79%) and 1,197 lines (84%) in the report. The real shares are about 48% and 49%.
- **Next step:** ask the applicant to explain the discrepancy, or have them re-run the tool in front of you on your clone. Rely on the recomputed figures above. Their work here is real but smaller than presented, and the numbers were most likely altered after the tool ran.
