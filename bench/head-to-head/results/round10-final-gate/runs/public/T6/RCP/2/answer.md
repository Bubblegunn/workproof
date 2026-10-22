Across your three addresses you have **77 commits** and **695 surviving lines**. I saved both numbers to `mine.md`.

The addresses are `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`.

| Address | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` | 69 | 583 |
| `<email:4132b6bd>` | 5 | 111 |
| `<email:266aea16>` | 3 | 1 |

- **Commits:** I counted commits on all branches. One of the 77 exists only on a branch other than `master`, so 76 are reachable from the current checkout.
- **Surviving lines:** I counted lines that `git blame` at HEAD credits to those addresses, ignoring whitespace changes. This covers every tracked file.
- **Matching:** I matched on author address only, not on committer. `git shortlog` also lists `AutoSponge` and `Yazhong Liu`, and I left those out.