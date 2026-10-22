Across all three addresses you have **76 commits** and **673 surviving lines**. I saved this to `mine.md`.

| Address | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` (the one in git config) | 69 | 556 |
| `<email:4132b6bd>` | 4 | 116 |
| `<email:266aea16>` | 3 | 1 |

- **Commits:** the 76 are on master. Counting every ref gives 77, because the `4.3.0` tag commit (0591262) isn't reachable from master.
- **Surviving lines:** I counted lines at HEAD that `git blame` attributes to your addresses, across all tracked files. I didn't ignore whitespace-only changes. Ignoring them gives 695.

I found the three addresses from the author list in `git shortlog` (the name "Jonathan Ong" plus the noreply handle `jonathanong`). If you used another address under a different name, it won't be in these totals.