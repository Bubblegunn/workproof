# Verdict: do not trust the figures in `received/`

The report is **not reliable as submitted**. Its headline numbers are inflated well beyond what the merged identities explain. Some of its other figures are accurate, and that makes the inflated ones harder to spot.

## What was checked

I recomputed the figures from this clone with plain `git`. HEAD is `249bbdc72da2`, which matches the report. I did **not** run `npx workproof verify`. That would execute code fetched from npm and chosen by the applicant, and everything I needed could be done with git. The two files also match each other: the report hash is identical in the .md and the .json.

Counting only non-merge commits, and merging every address that plausibly belongs to the applicant, I get:

| Claim | Report | Recomputed |
|---|---|---|
| Commits by applicant | 103 of 131 (78.6%) | **63** of 131 (**48%**) |
| Surviving lines at HEAD | 1,197 of 1,417 (84.5%) | **696** of 1,416 (**49%**) |
| Last commit | 2015-08-22 | **2015-07-09** |

Details on the recomputed figures:

- **Commits.** The applicant's identities are `Jonathan Ong <<email:d29caa5c>>` (56), `Jonathan Ong <<email:4132b6bd>>` (4), and `jongleberry` on `<email:266aea16>` (2) and `<email:4132b6bd>` (1). That makes 63. The denominator of 131 does match (non-merge commits from 2013-11-07 to 2015-08-22). So the denominator is right and the numerator is overstated by 40.
- **Surviving lines.** `git blame -w -M` over all 19 files credits "Jonathan Ong" with 696 lines, and TJ Holowaychuk with 551. The report's own cohort table (2013: 104, 2014: 550, 2015: 43) sums to **697**, which agrees with my count. It contradicts the report's own 1,197 headline, so the report is inconsistent with itself. The total of 1,417 vs my 1,416 is a one-line difference.
- **Last commit.** No commit by the applicant exists after 2015-07-09. The only commit in the window after that is by someone else (Takayuki Sakai, 2015-08-02). The stated tenure end of 2015-08-22 and the 654-day span are therefore not supported.
- **Merging more addresses does not explain the gap.** The multi-email explanation holds up to a point, since the 63 commits come from several addresses. The extra addresses add only 7 commits to the 56 under the main address, so the excess cannot come from them. The report claims 3 merged addresses and does not list the emails (`"emails": []`), so the merge cannot be audited from the file.

## What held up

- The repository (F1 is this `co` repo, with 19 tracked files) and HEAD match.
- The 131-commit denominator matches.
- The first commit date (2013-11-07) matches.
- The applicant is the top contributor by surviving lines, but with about 49% rather than 84%. TJ Holowaychuk is the main author of the project (90 commits overall).
- The report's honesty caveats are genuine, but they do not cover these errors.

## Other things to note

- The "In plain language" paragraph says the surviving-lines share is the higher number ("their work survived better than the count of changes suggests"). With real numbers it is the reverse: 49% of lines against 48% of commits, so the two are roughly equal.
- The paths and emails are hidden, so the applicant's claims cannot be cross-checked without their cooperation.
- The report is self-generated. Its hash only shows the file was not edited after generation. It says nothing about whether the generation was honest. Numbers that do not match the repo mean either the tool was run against something other than this repo state, or the JSON was altered and the hash regenerated.

## Recommendation

Do not rely on this report. The accurate picture is about 63 commits (roughly 48% of the period) and about 696 surviving lines (about 49%), with activity from 2013-11-07 to 2015-07-09. That is still a real contribution, but a smaller one than claimed. Ask the applicant to explain the 103 commits and the 1,197 lines, and to list the email addresses they merged. I'd re-run the verification yourself, in a sandbox, only if you want to confirm the tool's output against these numbers.
