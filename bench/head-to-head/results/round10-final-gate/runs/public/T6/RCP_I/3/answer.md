Across your three addresses you have **77 commits** and **697 surviving lines**. I saved the answer to `mine.md` in the current directory.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 69 | 585 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Commits:** I counted across all branches. One of the 77 isn't reachable from HEAD, so HEAD alone gives 76.
- **Surviving lines:** I used `git blame` at HEAD, ignoring whitespace changes and following moved or copied lines.
- **Matching:** I matched by author email only. `<email:4132b6bd>` appears under two display names, "Jonathan Ong" and "jongleberry", and both are counted.

I didn't run the receipts miner, because it reports Claude Code activity under your one configured git identity. It can't total commits and surviving lines across three emails. So I counted directly from git, and I didn't write the receipts `.md` or `.html` reports.