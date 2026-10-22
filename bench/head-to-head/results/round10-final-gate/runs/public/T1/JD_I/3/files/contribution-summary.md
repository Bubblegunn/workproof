# Summary of Git Contributions

**Author:** Jonathan Ong
**Git identity used:** `Jonathan Ong <<email:d29caa5c>>` (the identity configured in the repository)
**Repository:** `co` (package name `co`, `repository` field in package.json: `tj/co`), JavaScript / Node.js
**Generated:** 2026-10-22 from `git log` on branch `master`
**Source code is not included.** This document contains commit metadata and aggregate counts only. The full commit list is in `contribution-log.csv`.

## Totals (configured identity only)

| Measure | Value |
|---|---|
| First commit | 2013-11-07 |
| Last commit | 2015-07-09 |
| Commits on the current branch | 68 |
| Of which non-merge commits (authored changes) | 56 |
| Of which merge commits (merging others' pull requests) | 12 |
| Lines added / removed in non-merge commits | 1,151 / 1,075 |
| Of those, lines added / removed under `test/` | 561 / 559 |
| Share of all non-merge commits in the repo | 56 of 230 |

Most-modified files across my commits: `package.json` (22), `index.js` (21), `History.md` (12), `Readme.md` (8), `component.json` (7), `test/thunks.js` (6).

## Work, by area (from commit messages)

- **Core library behaviour (`index.js`):** support for yielding objects (Nov 2013); fixes for the "Generator is already running" error; passing context and arguments through thunks; callbacks passed as arguments to generators; handling of regular functions that throw (Mar 2015); always wrapping results in `Promise.resolve()` (Dec 2014); preserving key ordering when yielding objects; clearer error for non-yieldable values (Jun 2014).
- **Dependencies and implementation changes:** switched to a promise implementation (Oct 2014); replaced `q` with `bluebird` (Jun 2014); removed an unused dependency (Dec 2014); replaced `.bind()` with a closure.
- **Testing and CI:** added a recursion test and a test for the "Generator is already running" case; added test coverage reporting and Travis CI configuration; added iojs to the test matrix (Feb 2015).
- **Releases and documentation:** version tags 3.0.1 to 4.6.0 and `History.md` changelog entries; README edits and `component.json`.
- **Maintenance:** merged community pull requests (12 merge commits).

## Verification

Anyone given read access can reproduce these figures with:

```
git log --author=<email:d29caa5c> --no-merges --oneline | wc -l
git log --author=<email:d29caa5c> --no-merges --shortstat
```

Not included: commits under my other identities in this history (`<email:4132b6bd>`, `<email:266aea16>`), so this under-counts my total work.
