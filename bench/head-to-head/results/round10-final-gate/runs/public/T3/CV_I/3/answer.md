You can't fully trust the files: the two headline numbers are inflated, though the applicant did make real contributions. I wrote the full verdict to `verdict.md`.

I recomputed the report's figures from your clone with plain `git log` and `git blame`. I did not run `npx workproof`, because that would execute third-party code. Its hash check also only shows the file wasn't edited after it was generated, not that the numbers are right.

**What matches**
- The repo is the same: HEAD `249bbdc`, 19 files at HEAD, 131 commits in the period, and the same first and last commit dates.
- Active weeks (24), tags (23), files touched (34) and total surviving lines (1,417) all match.
- Their four email addresses and the `jongleberry` login really do belong together. They are first by commits and first by surviving lines.

**What doesn't match**

| Claim | Report | Recomputed |
|---|---|---|
| Commit share | 103 of 131 (79%) | **63 of 131 (48%)** |
| Surviving lines | 1,197 of 1,417 (84%) | **697 of 1,417 (49%)** |

- **Commits:** 63 is the count with all their addresses merged. Counting by committer name instead gives 82, still not 103.
- **Surviving lines:** the report's own cohort breakdown (104 + 550 + 43) adds up to 697, which contradicts its own 1,197. A genuine tool run wouldn't produce that, so the headline looks altered.
- **Multiple emails:** this doesn't explain the gap. Merging every address is already what gives 63 commits and 697 lines.

The test-change count is off by one (31 of 43 against my 30 of 42), which isn't material. I didn't recompute the authorship score or the commit-size percentiles.

I'd treat their contribution as real but roughly half what's claimed, and ask them to explain the discrepancy. Judging their commits directly in the clone is more reliable than the report.