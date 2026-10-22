Across your three addresses you have **76 commits** and **673 surviving lines**. I saved the breakdown to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> (git config) | 68 | 556 |
| <email:4132b6bd> | 5 | 116 |
| <email:266aea16> | 3 | 1 |

- **How I picked the emails:** I took them from the author emails in the git log. I assumed the other two were yours because they share your name or the jongleberry handle.
- **Commits:** I counted by author email. The commit count of 76 is the sum of the three rows.
- **Surviving lines:** I ran `git blame` over every tracked file at HEAD and counted the lines attributed to each address. I didn't pass `-w`, so lines that only had whitespace changes count toward whoever last touched them.