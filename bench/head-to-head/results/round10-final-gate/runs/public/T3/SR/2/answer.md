You can't trust the report. Its two headline numbers are inflated, and I've written the full verdict to `verdict.md`.

I recomputed the figures from your clone with plain `git`. I didn't run `npx workproof verify`, because it would execute code fetched from npm and chosen by the applicant. HEAD (`249bbdc72da2`) and the 131-commit total match the report. So do the report hash in the `.md` and `.json` files and the first commit date, 2013-11-07.

| Claim | Report | My count |
|---|---|---|
| Applicant's commits | 103 of 131 (79%) | 63 of 131 (48%) |
| Surviving lines at HEAD | 1,197 of 1,417 (84%) | 696 of 1,416 (49%) |
| Last commit | 2015-08-22 | 2015-07-09 |

- **Commits:** I merged every address that plausibly belongs to the applicant. The extra addresses add only 7 commits to the 56 under their main one, so merging doesn't explain the gap.
- **Surviving lines:** The report's own cohort table (104 + 550 + 43) sums to 697, which matches my count and contradicts its 1,197 headline.
- **Last commit:** The applicant has no commits after 2015-07-09, so the stated end date and 654-day tenure aren't supported.
- **Still true:** The applicant is the top contributor by surviving lines, though with about 49% rather than 84%. They have a real but smaller contribution than claimed.
- **Can't be audited:** The report hides the email addresses it merged (`"emails": []`), so the merge can't be checked from the file. The report hash only shows the file wasn't edited after it was generated. It doesn't show the numbers are honest.

I'd ask the applicant to explain the 103 commits and the 1,197 lines, and to list the emails they merged.