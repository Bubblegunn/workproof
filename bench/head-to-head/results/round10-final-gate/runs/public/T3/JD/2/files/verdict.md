# Verdict: do not trust the received report

Files checked: `received/workproof-report.md` and `received/workproof-report.json` (workproof 0.7.0, HEAD `249bbdc`).
My clone is at the same HEAD (`249bbdc72da2…`), so the numbers should be directly reproducible. Many are not.

## The applicant's explanation does not hold up

They say their numbers are higher because they committed under several email addresses. I merged every address that could be them and the figures are still far lower than reported.

The identities in the report are "Jonathan Ong" and "jongleberry". In the repo these map to 4 addresses:

- <email:d29caa5c> (56 commits)
- <email:4132b6bd> (5 commits)
- <email:266aea16> (2 commits)

That comes to 63 non-merge commits in total. Counting by author name gives 60.

## Claim against recomputation

| Claim in report | What I found in the clone |
|---|---|
| 103 of 131 commits in tenure (78.6%) | 131 total is correct, but the identity has **63** commits (about 48%), not 103 |
| Tenure ends 2015-08-22 (654 days) | Last commit by this identity is **2015-07-09**. The first date, 2013-11-07, is correct |
| 1,197 of 1,417 surviving lines (84.5%) | Total of 1,417 is correct. `git blame -w -M` gives **697** lines for this identity (about 49%). TJ Holowaychuk holds 551 |
| Cohort lines 104 + 550 + 43 | These sum to **697**, matching the real blame. This contradicts the report's own 1,197 headline, so the JSON is internally inconsistent |
| Rank 1 of 42 authors by commits | TJ Holowaychuk has **90** commits, so this identity is rank 2 even with all addresses merged. There are 59 distinct author emails and 60 names, not 42 |
| 17 of 23 release tags in tenure | The repo has 36 tags. I did not recompute the in-tenure split |
| 10 of 19 files authored, 31 of 43 test changes, footprint and commit size | Not recomputed. These are derived from the same inflated attribution, so I can't rely on them |

I did not run `npx workproof verify`.

## What this means

- The commit count (103 vs 63) and the surviving-line count (1,197 vs 697) are both inflated by roughly 40 to 70 percent. Merging addresses cannot explain it, because I merged all of them.
- The surviving-line headline contradicts the cohort breakdown in the same file. The cohort figures are correct and the headline is not. That looks like hand-editing, not a tool error.
- The report says the numbers cannot be edited without breaking the hash, but that protection is weak. The hash is a plain sha256 over the report's own contents, so anyone who edits the figures can recompute it. A matching hash proves nothing about whether the figures are true.
- The identity in the report is "Jonathan Ong" / "jongleberry". That is also the repo maintainer's identity, which is your git user. The report never names the applicant, so it doesn't say who the applicant is. Ask them which of the repo's commit addresses are theirs. If they claim this identity, check it, because a real contributor's work appears under their own address.

## Genuine parts

The real shape of the data is a modest but real record for this identity: about 63 commits and about 697 surviving lines, starting November 2013. Whoever owns those commits did real work in this repo. The report claims much more than that.

## Recommendation

Don't accept the figures. Ask the applicant to name their commit addresses, and compute their numbers yourself with `git log --author=<email>` and `git blame`.
