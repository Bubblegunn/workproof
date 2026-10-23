# Verdict: do not trust the headline numbers

The report (`received/workproof-report.{md,json}`, "workproof 0.7.0") is about this repo. HEAD `249bbdc`, 19 files and 131 commits in the window all match the clone. But its two headline figures for the applicant, commit count and surviving lines, are inflated. The report's own JSON contradicts the surviving-lines number.

The identity merging they cite is legitimate. The numbers are still wrong even with it applied.

## What I checked (recomputed with plain `git` on the clone)

| Claim in report | What the clone shows | Result |
|---|---|---|
| HEAD `249bbdc72da2`, 19 files alive | HEAD matches, `git ls-files` = 19 | OK |
| Tenure 2013-11-07 to 2015-08-22 | First and last commits by the Jonathan Ong / jongleberry identities are 2013-11-07 and 2015-07-09. 2015-08-22 is not their last commit (see below). | Mostly OK |
| 131 non-merge commits in the window | 131 | OK |
| **103 of 131 commits are theirs (79%)** | **63** across all their addresses, merged generously: `jonathanrichardong@` 56, `<email:4132b6bd>` 5, `<email:04f7e37e>` 2. The 63 is the same in the window and all-time. | **FALSE, inflated by 40** |
| **1,197 of 1,417 surviving lines (84%)** | `git blame -w -M` at HEAD gives **696** lines for Jonathan Ong (total lines in the repo are 1,416). That is about 49%. | **FALSE, inflated by about 500** |
| Cohort lines 104 + 550 + 43 | These sum to **697**, matching my blame count. | The report contradicts itself |
| "Ranks 1 of 42 by commits" | There are 60 distinct author emails and 59 names. All-time, TJ Holowaychuk has 90 non-merge commits against the applicant's 63, so the applicant ranks 2nd. They rank 1st only inside the narrowed window (63 against 19 for TJ). | Misleading, and the 42 is wrong |
| 24 active weeks, 23 tags in window | 24 and 23 | OK |
| 31 of 43 test-file changes | The applicant's count is 31, but TJ's is also 31. The 43 total was not independently checked. | Plausible |
| 10 of 19 files "authored" | By who first added each file: TJ 10, applicant 8, Will Conant 1. The tool's score may differ, but the 10 looks like TJ's number. | Unconfirmed, suspicious |
| 0 bot or AI commits | Not checked in depth. | n/a |

## Interpretation

- Merging addresses is a fair thing to do, and I applied it. It raises the applicant to 63 commits, nowhere near 103.
- The cohort numbers (697) show the tool's raw output was about 696 surviving lines. The 1,197 headline and the 1,417 denominator look hand-edited or otherwise altered. The 84% and "higher than the commit share" narrative depends on that.
- The report is not tamper-evident. Its integrity hash is computed over the JSON contents, so someone who edits the figures can recompute it. I did not run `npx workproof verify`, because that would execute an untrusted package from the applicant. I could not verify the hash or the fingerprint (a keyed hash whose key only the applicant holds).
- The author's name pattern in the JSON suggests the numbers may also be a rerun on a different clone or fork. I can't prove that from here.

## What is real

The applicant did contribute substantially to this repo. They are the top contributor in the 2013-2015 window, with 63 commits and about 700 surviving lines, which is roughly half the code. That is a solid, honest contribution. The report overstates it by 40 commits and about 500 lines.

## Recommendation

Don't rely on the report. Ask the applicant to explain the discrepancies (103 against 63 commits, and 1,197 against about 697 lines, which their own cohort table contradicts). Use the figures above instead if you want a number: 63 commits, about 696 surviving lines.
