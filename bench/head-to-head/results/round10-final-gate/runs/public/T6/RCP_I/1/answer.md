Across your three addresses you have **77 commits** and **695 surviving lines**. I saved the answer to `mine.md`.

I didn't run the receipts report itself. It only measures Claude Code session activity, not authorship in git history, so I used `git shortlog` and `git blame` directly.

The addresses are `<email:d29caa5c>` (the one in git config), `<email:4132b6bd>` and `<email:266aea16>`.

| Address | Commits (all refs) | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` | 69 | 583 |
| `<email:4132b6bd>` | 5 | 111 |
| `<email:266aea16>` | 3 | 1 |
| **Total** | **77** | **695** |

- **Commit count:** 76 of the 77 commits are reachable from `master`. The 77th is on another ref.
- **Name variants:** Four of the `<email:4132b6bd>` commits are under "Jonathan Ong". One is under "jongleberry". I matched on email, so all five are counted.
- **Surviving lines:** I counted lines in the files at `HEAD` that `git blame` still attributes to you, ignoring whitespace-only changes.