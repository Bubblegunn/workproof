# My contributions (three identities combined)

Identities counted:
- <email:d29caa5c> (the one in git config)
- <email:4132b6bd>
- <email:266aea16> (GitHub noreply)

| Identity | Commits (HEAD) | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 68 | 585 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |
| **Total** | **76** | **697** |

- Commits: 76 on the current branch (HEAD). Across all refs, the unique-SHA count is 77, because one more commit sits on another branch.
- Surviving lines: lines at HEAD that `git blame -w -M -C` attributes to these emails. That is 697 of 1,416 lines in tracked files, about 49%.
- Method: `git log --format=%ae` for commits, and `git blame --line-porcelain` over `git ls-files` for lines.
