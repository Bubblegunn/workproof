Across your three addresses you have **76 commits** and **673 surviving lines**. I saved the breakdown to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 68 | 556 |
| <email:4132b6bd> | 5 | 116 |
| <email:266aea16> | 3 | 1 |

- **Commits:** I matched on author email over the full history. 13 of the 76 are merge commits, so excluding merges the count is 63.
- **Lines:** I ran `git blame` on every tracked file at HEAD. A line counts as yours if its last change was authored under one of the three addresses.