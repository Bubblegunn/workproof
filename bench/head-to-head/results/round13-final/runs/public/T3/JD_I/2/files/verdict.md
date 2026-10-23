# Verdict: do not trust the headline numbers

The report (`received/workproof-report.{json,md}`) is real in form. The repo HEAD (`249bbdc7…`), the 131-commit window and the 1,417 surviving lines all match this clone. But the applicant's own contribution figures are inflated. The multiple-email explanation does not account for the gap.

## What I checked (recomputed from this clone with git, nothing downloaded or executed from the report)

| Claim in report | Recomputed | Result |
|---|---|---|
| HEAD `249bbdc72da2` | Same | Matches |
| 131 non-merge commits in 2013-11-07..2015-08-22 | 131 | Matches |
| 19 files, 1,417 surviving lines at HEAD | 19 files, 1,417 lines (git blame -w -M) | Matches |
| Applicant has 4 identities (3 merged addresses) | Same 3 addresses: <email:d29caa5c>, <email:4132b6bd>, <email:266aea16> | Plausible. All carry the same or a matching name/login. |
| **103 of 131 commits (79%)** | **63 of 131 (48%)** with all three addresses combined. 63 is also their lifetime total in the repo. | **False. Overstated by 40 commits.** |
| **1,197 of 1,417 surviving lines (84.5%)** | **697 (49%)**: 585 + 111 + 1 across the three addresses | **False. Overstated by 500 lines.** |
| Active 24 of 94 weeks, 17 of 23 tags | Not recomputed. The report derives them from the inflated commit set, so treat them as unverified. | Unverified |
| Rank 1 of 42 people | Rank 1 by lines (697 vs TJ Holowaychuk 551) is correct. The contributor count is off: 44 distinct author emails in the window, 60 overall. | Rank holds, count doesn't match |
| Tenure end 2015-08-22 | The last *author* date is 2015-07-09. The 2015-08-22 commit exists but only as a later commit-date on their work. | Slightly generous; minor |

Merging addresses cannot explain the gap. I merged every address that could belong to them, and the total is still 63 commits and 697 lines. The report's 103 and 1,197 are larger than the repo's entire lifetime total for those addresses. The only way to reach them is to attribute other people's work to the applicant. That means either a wrong identity merge, or the figures were edited. The report says it carries a fingerprint that stops edits, but I did not verify that. It also says "fingerprintKeyed: true", so the fingerprint can't be checked without the key. The `emails` list is blank (redacted), so the merged addresses can't be audited from the file alone.

## Corroboration
The `portfolio-bank.md` in this folder says 63 commits and 697 of 1,417 lines (49%). That matches my recomputation, and the report's numbers contradict it.

## Bottom line
The applicant did real work here: they are the top contributor by surviving lines and wrote about half the code. The report's 103 commits / 84% survival claim is not supported by the repo. The true figures are 63 commits (48%) and 697 lines (49%). I would raise the discrepancy with them and ask which addresses they merged. I would use the recomputed figures, not theirs.

## Notes
- The jd-resume-tailor skill covers tailoring resumes only, so I didn't use it for this check.
- I did not run `npx workproof verify`, to avoid executing downloaded code from an untrusted source.
- The blame run uses `-w -M`, as in the report's own parameters.
