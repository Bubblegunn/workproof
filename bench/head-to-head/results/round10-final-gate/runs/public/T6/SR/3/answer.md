Across your three addresses you have **76 commits** and **695 surviving lines**. I saved that to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| `<email:d29caa5c>` | 68 | 583 |
| `<email:4132b6bd>` | 5 | 111 |
| `<email:266aea16>` | 3 | 1 |

- **Commits:** these are the ones reachable from `HEAD`. One more commit of yours, `0591262` ("4.3.0"), is only reachable from another ref. Counting every ref makes it 77.
- **Lines:** I counted them with `git blame` at `HEAD`, ignoring whitespace changes.
- **Which emails:** I took the three addresses from the author list in `git shortlog`. The `jongleberry` commits under `<email:4132b6bd>` and the noreply address are the ones git config doesn't know about.