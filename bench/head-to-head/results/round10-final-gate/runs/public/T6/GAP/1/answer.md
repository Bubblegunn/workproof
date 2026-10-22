Across all three addresses you have **77 commits** and **695 surviving lines**. I saved both to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 69 | 583 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Commit count:** 76 of the 77 are reachable from master. The other one exists only on another ref.
- **Name mismatch:** `git shortlog` shows only 4 commits for `<email:4132b6bd>`, because it groups by name and email together. The fifth commit under that email must use a different name, so matching on email alone gives 5.
- **Surviving lines:** I counted lines at HEAD with `git blame -w`, which ignores whitespace-only changes when deciding who owns a line.