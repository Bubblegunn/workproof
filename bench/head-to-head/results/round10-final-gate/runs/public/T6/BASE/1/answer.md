I've saved the answer to `mine.md`: **77 commits and 695 surviving lines** across the three addresses.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 69 | 583 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Commits:** I counted by author email across all refs. `git shortlog` shows 4 for `<email:4132b6bd>` because one of those commits is under the name "jongleberry", so it lists it separately.
- **Surviving lines:** these come from `git blame -w` on HEAD over tracked files. The `-w` flag ignores whitespace-only changes.