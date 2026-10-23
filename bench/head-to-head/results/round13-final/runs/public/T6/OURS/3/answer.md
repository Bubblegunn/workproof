Across all three addresses you have **63 commits** and **695 surviving lines**. I saved both to `mine.md`.

| Address | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` (the one in git config) | 56 | 583 |
| `<email:4132b6bd>` (author names "Jonathan Ong" and "jongleberry") | 5 | 111 |
| `<email:266aea16>` (GitHub noreply) | 2 | 1 |

- **Basis:** Commits are non-merge, by author date, over the full history. Surviving lines come from `git blame` at HEAD, ignoring whitespace-only changes.
- **Not counted:** 12 merge commits and 19 commits that others wrote and you committed. One commit of yours was later reverted. It's in the 63, but its lines don't survive.
- **Please confirm:** I counted the two extra addresses as you because the name and the GitHub login ("jonathanong") match. That's a rule, not proof. Without them the totals would be 56 commits and 583 lines.

The 63 matches the tool's own count, and it agrees with `git shortlog` once the fifth `<email:4132b6bd>` commit, authored under the name "jongleberry", is included.

`mine.md` contains the figures and the "not counted" note, but not your email addresses.