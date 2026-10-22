# Verdict: do not trust the received report

The two files (`workproof-report.md` and `.json`) are the same report in two formats. Several headline numbers do not match the repository, and the errors all make the subject look better. The multiple-email explanation does not account for the gap.

## What I checked

I ran git commands against the local clone. HEAD is `249bbdc72da2`, the same as the report, and the repo has 19 tracked files and 1,417 blamed lines, both also matching.

| Claim in report | What the repo shows |
|---|---|
| 103 of 131 non-merge commits by the subject (78.6%) | 131 total commits in the window is correct. The subject's commits, merging every address the report says it merged, number **63**: 56 (<email:d29caa5c>) + 4 (<email:4132b6bd>) + 2 and 1 (jongleberry, noreply and me@ addresses). This is about 48%, not 79%. |
| 1,197 of 1,417 surviving lines (84.5%) | `git blame --line-porcelain -w -M` over all files gives **697** lines for "Jonathan Ong" plus 1 for "jongleberry", so about 49%. The 1,417 total is right and the 1,197 is wrong by about 500 lines. |
| Report's own cohort table: 104 + 550 + 43 lines | This sums to **697**, which matches my blame count. The report contradicts itself, because 1,197 is not the sum of its own cohorts. |
| Tenure 2013-11-07 to 2015-08-22 | The first date is correct. The subject's last commit under any of these identities is **2015-07-09**. 2015-08-22 matches no commit by them. |
| 42 authors, subject ranks 1 | 60 distinct author emails among non-merge commits, and 230 non-merge commits in the full history. The ranking by commits is only #1 in the window, and the subject's real count (63) is well below the 90 by TJ Holowaychuk over all history. By surviving lines the subject is #1 (697 vs TJ's 551), which is the only claim that holds up, and only narrowly. |

I did not check every figure. The rest (cadence, files authored, test share, commit size, languages) rest on the same identity-matching step, so I would not trust them either.

## Why the "several email addresses" explanation does not rescue it

Merging the addresses is what I did, and it gives 63 commits. The report says it merged 3 extra addresses and reached 103. The repo has only 4 addresses or names that could be this person's, and they total 63 commits. Nothing in the history accounts for the other 40 commits or the other 500 surviving lines.

## Other points

- The "integrity" hash is not a signature. It is a plain SHA-256 over the report's own contents, so anyone who edits the numbers can recompute it. It proves nothing about the numbers being true. The fingerprint is keyed, so I can't compare it without the key the author holds.
- The report never names the applicant. The identities it counts are "Jonathan Ong" and "jongleberry", which are the repo's own maintainer and, as far as your git config shows, you. I could not confirm that this is the applicant's work. Please confirm that was intended, and ask whom they say these identities are.
- I did not run `npx workproof verify`. It would run downloaded code, and the numbers can be checked directly with git as above.

## Recommendation

Treat the report as unreliable. Ask the applicant to name the specific email addresses or names they say are theirs, then check those against `git shortlog -sne`. Only commits and surviving lines under those identities count, and the numbers above show how little of this repo is accounted for by the report's identities.
