Across all three addresses you have **77 commits** and **695 surviving lines**. I saved the breakdown to `mine.md`.

| Address | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> (the one in git config) | 69 | 583 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |

- **Commits:** I matched on author email across all refs. The 77 includes merge commits; without them it's 64. `master` is the only branch, and 76 of the 77 are reachable from HEAD.
- **Surviving lines:** I used `git blame` at HEAD with whitespace-only changes ignored. Blame credits a line to whoever last changed it, so lines you wrote that someone else later edited don't count.
- **Identity:** the repo's history has no `<email:38e0984e>` commits. I took the three addresses to be the Jonathan Ong identity that git config points to, and I picked them from the author list in the history.