Across your three addresses you have 77 commits and 695 surviving lines. I saved both to `mine.md`.

The three addresses are `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`.

| Address | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` | 69 | 583 |
| `<email:4132b6bd>` | 5 | 111 |
| `<email:266aea16>` | 3 | 1 |
| **Total** | **77** | **695** |

- **Commit counts:** the 77 covers all branches. 76 of them are reachable from the current `master`, and 63 are non-merge commits.
- **Surviving lines:** I counted lines in the current `HEAD` that `git blame` attributes to these addresses, ignoring whitespace-only changes. I counted blame only over files git tracks.
- **`<email:4132b6bd>`:** `git shortlog` showed 4 commits for this address, but a direct log search found 5. I used the log search. I didn't look into the gap, which could be a commit under a different author name.