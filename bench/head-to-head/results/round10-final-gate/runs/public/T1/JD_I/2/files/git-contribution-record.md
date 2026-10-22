# Git contribution record: `co` repository

Generated 2026-10-22 from the local git history. It contains commit metadata only (hashes, dates, subjects, line counts). It contains no source code.

- Repository: `co` (package.json name `co`, version 4.6.0 at HEAD)
- HEAD commit: 249bbdc72da24ae44076afd716349d2089b31c4c
- Total commits in history: 299
- Identity covered: Jonathan Ong <<email:d29caa5c>> (the identity configured in this repo)

## Summary (identity above only)

| Measure | Value |
|---|---|
| Non-merge commits authored | 56 |
| Merge commits (pull requests merged) | 12 |
| First / last authored commit | 2013-11-07 / 2015-07-09 |
| Files changed across non-merge commits | 112 file-changes, +1,166 / -1,060 lines |
| Release commits (version bump only, e.g. "4.6.0") | 15 of the 56 |
| Non-version-bump commits | 41 |
| Lines of `index.js` at HEAD attributed to this identity (git blame -w) | 125 of 239 |
| Most-edited files | package.json (22), index.js (21), History.md (12), Readme.md (8), component.json (7), test/thunks.js (6) |

## Notable commits (non-merge)

| Commit | Date | Subject |
|---|---|---|
| f3744c5 | 2013-11-07 | initial yield object support |
| 063bfbe | 2013-11-08 | make co.join() private + refactoring |
| cf27103 | 2013-11-24 | fix "Generator is already running" errors when no callback provided |
| 31b4ab2 | 2013-12-19 | fixed: callback passed as an argument to generators |
| e0eebaf | 2014-06-30 | update deps, use bluebird instead of q |
| 2f22986 | 2014-06-30 | better error message when a non-yieldable is yielded |
| 6c88636 | 2014-10-27 | add test coverage |
| 4d2a63c | 2014-10-27 | switch to a promise implementation |
| 5007a81 | 2014-12-18 | always wrap the result in a Promise.resolve() |
| 1c72388 | 2015-02-05 | test on iojs |
| 9d996f2 | 2015-03-17 | support regular functions that throw |

## Full commit list (identity above, non-merge)

| Commit | Date | Subject |
|---|---|---|
| b54d18f | 2015-07-09 | 4.6.0 |
| d8b7fda | 2015-04-17 | 4.5.2 |
| a3d6007 | 2015-03-17 | 4.5.1 |
| 0f86d8e | 2015-03-17 | 4.5.0 |
| 9d996f2 | 2015-03-17 | support regular functions that throw |
| 2203ee5 | 2015-02-14 | 4.4.0 |
| f300378 | 2015-02-06 | 4.3.1 |
| 145355c | 2015-02-06 | 4.3.0 |
| 1c72388 | 2015-02-05 | test on iojs |
| 735fd49 | 2015-01-20 | 4.2.0 |
| b1533f0 | 2014-12-26 | 4.1.0 |
| 4176407 | 2014-12-26 | remove unnused request dependency |
| dc350c3 | 2014-12-26 | add comment about the memory leak error |
| 6beb835 | 2014-12-18 | 4.0.2 |
| 5007a81 | 2014-12-18 | always wrap the result in a Promise.resolve() |
| 2862556 | 2014-11-29 | 4.0.1 |
| 2584641 | 2014-11-23 | beautify the gitter badge |
| 4d2a63c | 2014-10-27 | switch to a promise implementation |
| f20460f | 2014-10-27 | add some sexy badges |
| 6c88636 | 2014-10-27 | add test coverage |
| eda952a | 2014-10-27 | remove benchmarks |
| b74b10a | 2014-10-05 | readme: remove performance sections |
| 93fd2bb | 2014-06-30 | 3.1.0 |
| 8446e81 | 2014-06-30 | preserve key ordering |
| 2f22986 | 2014-06-30 | better error message when a non-yieldable is yielded |
| e0eebaf | 2014-06-30 | update deps, use bluebird instead of q |
| cd850e7 | 2014-06-30 | use a closure instead of .bind() |
| d55df9a | 2014-05-03 | remove unused toString |
| 1ddcda6 | 2014-05-03 | remove setImmediate shim, add platform compat notes to readme |
| c2d24b2 | 2014-04-12 | benchmark: use setImmediate everywhere so we can bump mtime |
| 19ada57 | 2014-03-14 | fix #92 |
| e65c811 | 2014-02-08 | 3.0.3 |
| 0cb0263 | 2014-01-02 | readme: remove references to join |
| 41913fb | 2014-01-01 | 3.0.2 |
| 9a02b9b | 2013-12-19 | 3.0.1 |
| bcbd0b8 | 2013-12-19 | refactor: remove unnecessary co.call() |
| 31b4ab2 | 2013-12-19 | fixed: callback passed as an argument to generators |
| e198766 | 2013-12-19 | history: add 3.0.0 changes |
| 9194353 | 2013-12-19 | Update Readme.md |
| 4f02a4e | 2013-12-19 | readme: fix paragraph after list |
| e83d8a7 | 2013-11-24 | make context and arguments be passed through thunk |
| c5e389b | 2013-11-24 | no callback: only throw if there's no error! |
| cf27103 | 2013-11-24 | fix "Generator is already running" errors when no callback provided |
| b0d40fe | 2013-11-24 | possible fix for "Generator is already running" |
| 2cf5fe0 | 2013-11-24 | add a test case for "Generator is already running" |
| ca86f5e | 2013-11-12 | component.json |
| e01efb5 | 2013-11-12 | travis |
| 5e443cf | 2013-11-12 | Revert "you never use toString() anymore" |
| 17ccbaa | 2013-11-08 | fix copy |
| 7cb98de | 2013-11-08 | test: add a recursion test |
| 0f193f0 | 2013-11-08 | benchmark: add `object` |
| 6a7e0eb | 2013-11-08 | npm test |
| 063bfbe | 2013-11-08 | make co.join() private + refactoring |
| f3744c5 | 2013-11-07 | initial yield object support |
| 0a59d78 | 2013-11-09 | add generators and delegated generators benchmarks |
| 2a94e82 | 2013-11-07 | you never use toString() anymore |

## Merge commits

Each is a merge of someone else's pull request into the main branch.

| Commit | Date | Subject |
|---|---|---|
| 70ba8e2 | 2014-10-27 | Merge pull request #153 from bransorem/patch-1 |
| c8b76ae | 2014-10-04 | Merge pull request #146 from rhacker/patch-1 |
| 023ecb4 | 2014-10-04 | Merge pull request #150 from nexxy/master |
| aa59ffd | 2014-06-19 | Merge pull request #128 from sahat/patch-1 |
| e42133e | 2014-06-16 | Merge pull request #127 from RichAyotte/patch-1 |
| 9aef83e | 2014-04-15 | Merge pull request #106 from dead-horse/add-arguments-example |
| 8413e5d | 2014-04-01 | Merge pull request #104 from plievone/patch-1 |
| 9cdbfeb | 2014-03-24 | Merge pull request #102 from hemanth/patch-2 |
| 50ed090 | 2014-03-24 | Merge pull request #103 from t3chnoboy/master |
| 7ad53ac | 2014-01-10 | Merge pull request #72 from Pana/master |
| b47f068 | 2014-01-10 | Merge pull request #75 from darul75/patch-1 |
| 1bb08e7 | 2014-01-01 | Merge pull request #67 from logicalparadox/bug/nil |

## Other identities in the same history (not counted above)

The history also holds commits under other names/emails that may be yours: `Jonathan Ong <<email:4132b6bd>>` (4), `jongleberry <<email:266aea16>>` (3), `jongleberry <<email:4132b6bd>>` (1). They are excluded from every figure above. Add them only if you can confirm they are yours.

## How to reproduce

Run these in the repository:

    git log --author=<email:d29caa5c> --no-merges --oneline | wc -l
    git log --author=<email:d29caa5c> --format='%h %ad %s' --date=short
    git blame -w --line-porcelain HEAD -- index.js | grep '^author-mail' | sort | uniq -c
