You can't trust the headline numbers in those files. I wrote the verdict to `verdict.md`.

I compared the report to your clone using `git log` and `git blame`. I didn't run the `npx workproof verify` command the report suggests, since that means running code from the applicant's side.

- **Matches:** The commit (`249bbdc`) and the 19 files match. So do the merged identities (`Jonathan Ong` on two emails, plus `jongleberry`), the start date of 2013-11-07, and the 131 commits in the window.
- **Commits:** The report says 103 of 131 are theirs (79%). Merging every address and name variant gives 63 (about 48%).
- **Surviving lines:** The report says 1,197 of 1,417 (84%). Blame gives about 696 of 1,416 (about 49%), and TJ Holowaychuk has 551.
- **Self-contradiction:** The report's own year-by-year table sums to 697, which matches my blame count. The headline is exactly 500 higher than its own breakdown. Merging several emails can't explain that.

Two smaller points are unresolved. The report's "42 people" doesn't match the 59 names or 60 emails I counted. The end date of 2015-08-22 is later than their last non-merge commit (2015-07-09).

The report names no applicant, but the identity is "Jonathan Ong", the same name as the git user in your clone. Ask the applicant to confirm which GitHub account and addresses are theirs.

I didn't check the footprint, test-file, cadence or commit-size figures. The headline figures already fail.

Their real contribution looks like about 63 commits and about half the surviving code. That is still substantial, but about half of what the report claims. I'd ask them to explain the 103 and 1,197 figures and to list the emails they used.