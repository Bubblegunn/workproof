No, you can't trust the headline numbers. I've written the full verdict to `verdict.md`.

The report is a genuine `workproof` output for this repo, and several of its figures are correct. Two of its main claims are inflated, and merging email addresses doesn't explain the gap.

I recomputed the figures from your clone with `git log` and `git blame`, merging all three addresses the report says it merged. I did not run `npx workproof verify`, because it needs network access. I read the two files as data only and didn't execute anything from them.

- **Correct:** HEAD, the tenure dates (2013-11-07 to 2015-08-22), the 131 total commits in that period, the 19 files and 1,417 lines, and the 24 active weeks.
- **Commits:** the report says 103 of 131 (79%). I count 63 (48%) after merging every address.
- **Surviving lines:** the report says 1,197 (84%). I count 697 (49%), so it's off by exactly 500.
- **Self-contradiction:** the report's own "Survival by cohort" lines (104 + 550 + 43) add up to 697, not 1,197.
- **Merging doesn't explain it:** the extra addresses add only about 7 commits. Every other address in the history belongs to someone else, including TJ Holowaychuk with roughly 145 commits.

One thing to ask the applicant: the identities in the report ("Jonathan Ong", "jongleberry") are the repo maintainer's, and the same name is your configured git user. They need to say which addresses are theirs. The report hides its emails, so the files can't settle it.

I couldn't recompute the report's integrity hash offline. Running `npx workproof verify` in your clone should show whether the numbers fail to match, which I expect.