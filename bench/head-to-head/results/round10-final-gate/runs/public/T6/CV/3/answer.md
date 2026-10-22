Across your three addresses you have **77 commits** and **695 surviving lines**. I saved this to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 69 | 583 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Commits:** I counted by author email across all refs. 76 of the 77 are reachable from the current HEAD. The extra one is on another ref.
- **<email:4132b6bd>:** Four of its commits show the name "Jonathan Ong" and one shows "jongleberry". I counted all five.
- **Surviving lines:** I ran `git blame -w` on every tracked file at HEAD, which ignores whitespace-only changes. Then I grouped the lines by author email.