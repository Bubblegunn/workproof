Across your three addresses you have **77 commits** and **695 surviving lines**. I saved the breakdown to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 69 | 583 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Skill:** I loaded `/receipts`, but it only counts commits that carry Claude Code's work, under a single git identity. It couldn't answer this, so I used `git log` and `git blame` directly. I did not run the miner or write any receipt files.
- **Commits:** I counted these across all branches, matching on author email. No SHA appeared under more than one address.
- **Lines:** I ran `git blame -w` on every tracked file at HEAD of `master`, so whitespace-only changes don't count. Your lines show up under the author email on each line.
- **Name variants:** Two of the 5 `<email:4132b6bd>` commits are credited to "jongleberry". I matched on email, so they are included.