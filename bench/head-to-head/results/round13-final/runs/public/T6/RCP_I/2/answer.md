Across the three emails you have 76 commits on the current branch and 697 surviving lines. I saved the answer to `mine.md` in the current directory.

| Email | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` | 68 | 585 |
| `<email:4132b6bd>` | 5 | 111 |
| `<email:266aea16>` | 3 | 1 |
| **Total** | **76** | **697** |

- **Commits:** counting all branches gives 77, because one more commit sits on another branch.
- **Surviving lines:** that is 697 of 1,416 lines in tracked files, about 49%. I counted lines at HEAD that `git blame` attributes to these emails, ignoring whitespace changes and following moved or copied lines.
- **Which emails:** I picked the three from `git shortlog`, and I'm assuming they are yours. The noreply one appears under the name "jongleberry".
- **The receipts skill:** I loaded it but didn't use it. It reports Claude Code session activity from your transcripts and can't count commits by email, so I used git directly.