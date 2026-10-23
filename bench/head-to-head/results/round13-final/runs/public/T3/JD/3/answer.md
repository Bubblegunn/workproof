You can't trust the report. I wrote the verdict to `verdict.md`.

I recomputed its figures from your clone with plain `git log` and `git blame`. The clone's HEAD matches the report's HEAD, but several headline numbers don't match the history:

- **Surviving lines:** the report says 1,197 of 1,417 (84.5%). The clone gives about 697 (about 49%). The report's own year-by-year table (104 + 550 + 43) also adds up to 697, so its headline figure contradicts its own breakdown by exactly 500 lines.
- **Commit count:** the report says 103 of 131 commits in the period. Counting all four Jonathan Ong / jongleberry addresses, I get about 61. Merging addresses can't explain the gap, because the extra addresses add only about 5 commits to the 56 on the main address.
- **End of tenure:** the report says 2015-08-22. Their last commit under any of those identities is 2015-07-09.
- **Number of authors:** the report says 42. The history has 60 distinct emails.

Some figures do match: the start date, active weeks, total lines and file count. Those are easy to reproduce from public history, so they don't vouch for the rest.

I didn't run `npx workproof verify`. Matching names and emails in git history also doesn't prove the applicant is the person behind those identities.

I'd ask the applicant to run `npx workproof verify` in front of you or to name the specific commits they say are theirs.