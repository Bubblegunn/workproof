You have **77 commits** and **695 surviving lines** across the three addresses. I saved the breakdown to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 69 | 583 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |
| **Total** | **77** | **695** |

- **Commits:** I counted commits across all refs. One of the 77 (`0591262`, "4.3.0") isn't reachable from master, so master alone has 76.
- **Surviving lines:** I ran `git blame -w` on every tracked file at HEAD, so whitespace-only changes don't count as yours.
- **Discrepancy:** `git shortlog` showed 4 commits for <email:4132b6bd>, but `git log` finds 5. I used the `git log` count and didn't dig into the difference.