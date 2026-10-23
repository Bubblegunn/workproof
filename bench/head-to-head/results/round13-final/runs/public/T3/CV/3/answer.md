No, you can't trust the headline numbers. I wrote the full verdict to `verdict.md`.

I recomputed the figures from your clone with `git log` and `git blame`, merging the same email addresses the report merges. I didn't run `workproof verify`, because the tool isn't installed here and I didn't fetch it.

The report is for `tj/co`, which it calls "F1". These parts are accurate:
- the HEAD commit
- 19 files
- 1,417 lines in total
- 131 commits in the window
- 24 active weeks
- 23 tags

These headline claims are not:

| Claim | Report | Recomputed |
|---|---|---|
| The applicant's commits | 103 of 131 (79%) | 63 of 131 (48%) |
| The applicant's surviving lines | 1,197 of 1,417 (84%) | 697 of 1,417 (49%) |

- **Commits:** Counting merge commits as well gives 76 across all their addresses. No combination of addresses reaches 103.
- **Lines:** The report's own breakdown by year (104 + 550 + 43) adds up to 697, not 1,197. It contradicts its own headline.
- **End date:** The tenure end date of 2015-08-22 is a merge commit. Their last non-merge commit is 2015-07-09.
- **Hash:** The report's integrity hash is unkeyed, so someone who edited the numbers could recompute it. A matching hash wouldn't prove the file is genuine.

The multiple-address explanation is real, since the three addresses do belong to one person. Even with all of them merged, though, they are still the top contributor by surviving lines (697 against TJ Holowaychuk's 551). The real numbers are respectable, and the report exaggerates them.

I'd ask the applicant to explain the 103 and 1,197 figures.