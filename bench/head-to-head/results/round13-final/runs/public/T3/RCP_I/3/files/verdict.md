# Verdict: do not trust the headline numbers

The two files are a `workproof` 0.7.0 report (`.json` and `.md`) for this repo. The `.json` has a self-hash and the `.md` is rendered from it, so they agree with each other. I did not run `npx workproof verify` or `check`, because I treated the files as untrusted and avoided network or tool execution from them. Their internal consistency proves nothing, since anyone can regenerate or edit both files. I recomputed the figures from this clone instead (HEAD `249bbdc`, 299 commits, not shallow).

## What matches
- The HEAD hash in the report matches this clone.
- The repo contents match (19 tracked files, the `co` library).
- 131 non-merge commits fall in the tenure window. This matches the report.
- The first commit date of 2013-11-07 matches.
- 34 files touched matches.
- 23 tags in the window matches.
- 19 files at HEAD matches.

## What does not match
| Claim | Recomputed from git |
|---|---|
| 103 of 131 commits (79%) | **63 of 131 (48%)**. That is 60 as "Jonathan Ong", 3 as "jongleberry", using every address that plausibly belongs to them. |
| Tenure ends 2015-08-22 (654 days) | **Last commit by any of their identities is 2015-07-09**, which is about 609 days. |
| 1,197 of 1,417 surviving lines (84%) | **About 696 lines** by `git blame -w -M`, which is roughly 49%. TJ Holowaychuk holds about 551. |
| Cohort lines: 104 + 550 + 43 | These sum to 697. That agrees with my blame count and **contradicts the report's own 1,197 headline**. The headline is inflated by about 500 lines. |
| Rank 1 of 42 authors by commit count | Over the whole history, TJ Holowaychuk has 90 commits and Jonathan has 60, so Jonathan ranks 2nd. Within the window Jonathan ranks 1st (60 vs 19). The author count (about 59 names / 60 emails) was not reconciled with 42. |

## The multiple-email explanation
The claim that identity merging raises their numbers is only partly true. This repo has few Jonathan Ong/jongleberry addresses: `<email:d29caa5c>` (56 commits), `<email:4132b6bd>` (4 plus 1 as "jongleberry") and `<email:266aea16>` (2). Merging these gets 63 commits. It does not get 103, so merging cannot account for the gap. The report also says the merge was done by rules such as "same name" and "GitHub login matches". Those rules are the kind that could sweep in someone else's commits. For example, the `AutoSponge` and `Yazhong Liu` commits showed up in my name search but are not Jonathan's.

## Other observations
- The report lists emails as hidden and the repo as "F1", with a keyed fingerprint. That makes it impossible for you to verify the identity set without the applicant's key.
- 0 AI-assisted commits and 0 bot commits are reported. I did not check these.

## Bottom line
The report is genuine in form and partly accurate. It is real work on this repo, and the repo state, window commit total, files touched and tags are right. The three figures that make the applicant look strongest (commit share, surviving-line share, tenure length) are overstated. The honest picture is about 63 commits (48% of the window), about 700 surviving lines (about 49%), and active from Nov 2013 to Jul 2015.

I'd ask the applicant to list the exact email addresses they merged. They should also say how they got to 103 commits, since the clone shows at most 63 for any reasonable identity set. Meanwhile, rely on your own `git log` and `git blame`.
