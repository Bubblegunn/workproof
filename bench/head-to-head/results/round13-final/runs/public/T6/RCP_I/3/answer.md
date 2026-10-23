Across your three addresses you have **76 commits** and **695 surviving lines**. I saved the breakdown to `mine.md` in the current directory.

| Email | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` (the one in git config) | 68 | 583 |
| `<email:4132b6bd>` | 5 | 111 |
| `<email:266aea16>` | 3 | 1 |

- **Commits:** 13 of the 76 are merge commits (12 under the gmail address, 1 under the noreply one), so 63 are non-merge.
- **Surviving lines:** I counted lines that `git blame` still attributes to each address in the current files. I ignored whitespace-only changes.
- **Receipts skill:** I loaded `/receipts` as you asked but didn't run its miner. It only counts work done through Claude Code sessions, so it can't answer a question about your whole commit history. I used `git log` and `git blame` directly.