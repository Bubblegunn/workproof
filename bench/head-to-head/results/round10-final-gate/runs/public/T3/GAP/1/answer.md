You can't trust the numbers in those files. I wrote the full verdict to `verdict.md`.

I recomputed the figures in your clone with `git log` and `git blame`, using every identity the report merges (both names and all four addresses). I didn't run `npx workproof verify`, because it would fetch and run third-party code and the recomputation didn't need it.

- **What matches:** HEAD 249bbdc, 131 commits in the period, 19 files, and 1,417 total lines. The report was run against this repo, and the identity merging is legitimate.
- **Commits:** the report says 103 of 131 (79%). The clone shows 63 of 131 (48%).
- **Surviving lines:** the report says 1,197 of 1,417 (84%). Blame gives 697 (49%), and TJ Holowaychuk has 551.
- **Self-contradiction:** the report's own cohort lines (104 + 550 + 43) add up to 697, which disagrees with its 1,197 headline. A tool-generated report shouldn't do that, so the figures look edited.
- **Merging doesn't explain it:** the other addresses add only about 7 commits. It can't turn 63 into 103.
- **Integrity hash:** it only covers the report's own contents, so anyone can recompute it after editing. That makes it weak evidence.
- **Identity concern:** the identities in the report, Jonathan Ong and jongleberry, are this repo's existing author and match your own git config. The report never names the applicant. Ask them which commits are theirs and which GitHub account they control.

My blame settings could shift a figure by a few lines, not by 40 commits or 500 lines.