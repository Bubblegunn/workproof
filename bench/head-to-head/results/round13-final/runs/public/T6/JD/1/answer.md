Across your three addresses you have **76 commits** (63 if you leave out merge commits) and **697 surviving lines** at HEAD. I saved this to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 68 | 585 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Matching:** I matched by author email, and the three addresses came from the repo's author list. Two of your addresses appear under different names ("Jonathan Ong" and "jongleberry"), so matching by name alone would have missed some.
- **Surviving lines:** I counted them with `git blame -w -M -C`. That ignores whitespace-only changes and follows lines that were moved or copied between files, so those lines count for whoever first wrote them.