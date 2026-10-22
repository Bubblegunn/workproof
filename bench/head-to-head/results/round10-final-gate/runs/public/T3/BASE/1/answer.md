You can't trust the headline numbers in the report. I've written the verdict to `verdict.md`.

I recomputed the figures from your clone. The merged email addresses are real, but they don't explain the gap.

- **Commits:** the report says 103 of 131 in the window (79%). Counting every address that could be theirs, I get about 63 (48%).
- **Surviving lines:** the report says 1,197 of 1,417 (84.5%). A full `git blame` gives about 697 (49%).
- **Internal contradiction:** the report's own cohort table (104 + 550 + 43) adds up to 697, not 1,197. That matches my blame count.
- **Matches:** HEAD, the 131-commit total, the tenure dates and the 1,417 total lines all agree with the clone.
- **Whose work it is:** the identity in the report is "Jonathan Ong" / "jongleberry", the repo's actual maintainer and the git user configured in your clone. Nothing in the report names the applicant, so check who they say they are.
- **Hash and `npx workproof verify`:** I couldn't reproduce the report hash. That is inconclusive, and anyone who edits the numbers can recompute it anyway. I didn't run `npx workproof verify`, because it would fetch and execute an npm package.

Every discrepancy I found inflates the applicant's share. Ask them for the exact commit hashes or email addresses they used, then check with `git log --author` yourself.