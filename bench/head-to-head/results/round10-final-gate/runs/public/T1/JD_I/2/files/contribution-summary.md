# Git contribution summary: `co` repository

Generated from `git log` and `git blame` on the local clone. It contains no source code.

**Repository:** `co` (package name `co`, `repository: tj/co`, MIT licence, copyright TJ Holowaychuk). A JavaScript / Node.js library for generator-based control flow.
**Repository size:** 299 commits at HEAD, 1 to 2 files of source (`index.js`, 239 lines) plus 11 test files.
**Author identity analysed:** `Jonathan Ong <<email:d29caa5c>>` (the identity configured in this repo).

## Commits by this identity

| Measure | Value |
|---|---|
| Non-merge commits | 56 |
| Merge commits | 12 |
| First commit | 2013-11-07 |
| Last commit | 2015-07-09 |
| Lines added (non-merge) | 1,151 |
| Lines deleted (non-merge) | 1,075 |
| Lines at HEAD in `index.js` attributed to this identity by `git blame` | 100 of 239 |

Other identities in the history that may also be yours are not counted above: `Jonathan Ong <<email:4132b6bd>>` (4 commits) and `jongleberry <<email:266aea16>>` (3 commits). Add them only if they are yours.

## What the commits did (from commit messages)

- **Core behaviour:** added yield-object support (2013-11); fixed "Generator is already running" errors (2013-11); passed context and arguments through thunks; preserved key ordering; supported regular functions that throw; always wrapped results in `Promise.resolve()`.
- **Promise migration (2014-10):** switched the implementation to promises; moved from Q to Bluebird (2014-06).
- **Error handling:** improved the error message when a non-yieldable is yielded.
- **Quality and tooling:** added tests (recursion, "already running"), added test coverage, enabled Travis CI and io.js testing, removed an unused dependency.
- **Releases:** version-bump commits 3.0.1 to 4.6.0.
- **Documentation:** README and History.md updates, badges.

## How to reproduce

```
git log --author=<email:d29caa5c> --no-merges --format='%h %ad %s' --date=short
git log --author=<email:d29caa5c> --no-merges --numstat --format=
git blame --line-porcelain HEAD -- index.js | grep '^author-mail' | sort | uniq -c
```
