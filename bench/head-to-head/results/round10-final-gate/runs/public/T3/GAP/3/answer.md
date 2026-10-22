No, you can't trust the headline numbers in those files. I wrote the verdict to `verdict.md`.

The repo-wide figures are correct. The HEAD commit matches your clone, as do the 131 commits in the period, the 1,417 surviving lines and the 19 files. The applicant's own share is inflated.

| Claim | What your clone shows |
|---|---|
| 103 commits (79%) | 63 commits across all their addresses (about 48%) |
| 1,197 surviving lines (84%) | about 696 lines (about 49%) |
| 42 code authors | 60 distinct author emails |

- **Addresses:** the report merges three addresses into the applicant's name. I merged the same three, and they total 63 commits. Even counting everything under those names, the 103 can't be reached, so the multiple-email explanation doesn't cover the gap.
- **Self-contradiction:** the report's own year-by-year breakdown adds up to 697 lines, not 1,197. That matches my blame count, so the 1,197 looks edited. The report's hash wouldn't catch this, because anyone can recompute it after changing the numbers.
- **What holds up:** they are the top contributor by surviving lines, but narrowly (696 against 551 for TJ Holowaychuk). The tenure start date is right. The end date, 2015-08-22, comes from a commit of theirs that I believe is a merge. Their last non-merge commit is 2015-07-09.
- **What I didn't do:** I didn't run `npx workproof verify`, because it would execute downloaded code. I read both files as plain data and recomputed everything with git. I also couldn't check the keyed repository fingerprint.

A fair reading of their contribution is about 63 commits and about 700 surviving lines.

If they say other addresses are theirs, ask for the list and check it against `git shortlog -sne`. Those addresses would need independent confirmation, and they still couldn't explain the 1,197 lines.