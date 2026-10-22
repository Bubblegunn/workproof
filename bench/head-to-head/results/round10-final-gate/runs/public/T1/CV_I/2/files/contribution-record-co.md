# Contribution Record: Jonathan Ong, `co` (open-source JavaScript library)

Generated from the git history of the repository (`package.json` names it `co`, repository `tj/co`, MIT license). No source code is included. Only commit metadata (hash, date, message) and aggregate counts are listed.

## Scope of this record

- Identity: commits whose author is `Jonathan Ong <<email:d29caa5c>>`. This is the git identity configured in the repository.
- Project: `co`, "generator async control flow goodness". It is a public, MIT-licensed project, not a private client codebase. Each hash below can be checked against the public repository.
- This is a multi-author project. The history has about 300 commits; the identity above accounts for 68 of those reachable from HEAD. The original author, TJ Holowaychuk, wrote most of the rest.
- Two other identities appear in the history (`<email:4132b6bd>`, 4 commits, and `<email:26cc79b4>`, 3 commits). They are not counted here. Add them only if they are yours.

## Summary

| Measure | Value |
|---|---|
| Period of commits | 2013-11-07 to 2015-07-09 |
| Commits authored (HEAD) | 68 |
| Non-merge commits | 56 (22 in 2013, 24 in 2014, 10 in 2015) |
| Merge commits (merging others' pull requests) | 12 |
| Release/version commits | 15 (3.0.1 through 4.6.0) |
| Lines added / removed (non-merge) | 1,151 / 1,075 |
| Of which `index.js` | 356 / 320 |
| Of which `test/` | 561 / 559 |

## What the commits show

- Maintained the library's releases from 3.0.1 to 4.6.0 (major release 4.0 included).
- Changed the core implementation to a promise-based design (`switch to a promise implementation`, 2014-10-27). Added `always wrap the result in a Promise.resolve()` (4.0.2) and replaced Q with Bluebird as the promise library (`3.1.0`).
- Fixed "Generator is already running" errors in callback-less use (Nov 2013), with a test case added first.
- Added object yielding (`initial yield object support`, 2013-11-07) and preserved key ordering (3.1.0).
- Improved error handling: a clearer message when a non-yieldable value is yielded, and support for regular functions that throw (4.5.0).
- Added test coverage and CI (Travis, io.js testing, coverage badges) and removed the benchmarks and unused dependencies.
- Reviewed and merged community pull requests (12 merges).

## Commits authored (non-merge, newest first)

| Hash | Date | Message |
|---|---|---|
| `b54d18f` | 2015-07-09 | 4.6.0 |
| `d8b7fda` | 2015-04-17 | 4.5.2 |
| `a3d6007` | 2015-03-17 | 4.5.1 |
| `0f86d8e` | 2015-03-17 | 4.5.0 |
| `9d996f2` | 2015-03-17 | support regular functions that throw |
| `2203ee5` | 2015-02-14 | 4.4.0 |
| `f300378` | 2015-02-06 | 4.3.1 |
| `145355c` | 2015-02-06 | 4.3.0 |
| `1c72388` | 2015-02-05 | test on iojs |
| `735fd49` | 2015-01-20 | 4.2.0 |
| `b1533f0` | 2014-12-26 | 4.1.0 |
| `4176407` | 2014-12-26 | remove unnused request dependency |
| `dc350c3` | 2014-12-26 | add comment about the memory leak error |
| `6beb835` | 2014-12-18 | 4.0.2 |
| `5007a81` | 2014-12-18 | always wrap the result in a Promise.resolve() |
| `2862556` | 2014-11-29 | 4.0.1 |
| `2584641` | 2014-11-23 | beautify the gitter badge |
| `4d2a63c` | 2014-10-27 | switch to a promise implementation |
| `f20460f` | 2014-10-27 | add some sexy badges |
| `6c88636` | 2014-10-27 | add test coverage |
| `eda952a` | 2014-10-27 | remove benchmarks |
| `b74b10a` | 2014-10-05 | readme: remove performance sections |
| `93fd2bb` | 2014-06-30 | 3.1.0 |
| `8446e81` | 2014-06-30 | preserve key ordering |
| `2f22986` | 2014-06-30 | better error message when a non-yieldable is yielded |
| `e0eebaf` | 2014-06-30 | update deps, use bluebird instead of q |
| `cd850e7` | 2014-06-30 | use a closure instead of .bind() |
| `d55df9a` | 2014-05-03 | remove unused toString |
| `1ddcda6` | 2014-05-03 | remove setImmediate shim, add platform compat notes to readme |
| `c2d24b2` | 2014-04-12 | benchmark: use setImmediate everywhere so we can bump mtime |
| `19ada57` | 2014-03-14 | fix #92 |
| `e65c811` | 2014-02-08 | 3.0.3 |
| `0cb0263` | 2014-01-02 | readme: remove references to join |
| `41913fb` | 2014-01-01 | 3.0.2 |
| `9a02b9b` | 2013-12-19 | 3.0.1 |
| `bcbd0b8` | 2013-12-19 | refactor: remove unnecessary co.call() |
| `31b4ab2` | 2013-12-19 | fixed: callback passed as an argument to generators |
| `e198766` | 2013-12-19 | history: add 3.0.0 changes |
| `9194353` | 2013-12-19 | Update Readme.md |
| `4f02a4e` | 2013-12-19 | readme: fix paragraph after list |
| `e83d8a7` | 2013-11-24 | make context and arguments be passed through thunk |
| `c5e389b` | 2013-11-24 | no callback: only throw if there's no error! |
| `cf27103` | 2013-11-24 | fix "Generator is already running" errors when no callback provided |
| `b0d40fe` | 2013-11-24 | possible fix for "Generator is already running" |
| `2cf5fe0` | 2013-11-24 | add a test case for "Generator is already running" |
| `ca86f5e` | 2013-11-12 | component.json |
| `e01efb5` | 2013-11-12 | travis |
| `5e443cf` | 2013-11-12 | Revert "you never use toString() anymore" |
| `17ccbaa` | 2013-11-08 | fix copy |
| `7cb98de` | 2013-11-08 | test: add a recursion test |
| `0f193f0` | 2013-11-08 | benchmark: add `object` |
| `6a7e0eb` | 2013-11-08 | npm test |
| `063bfbe` | 2013-11-08 | make co.join() private + refactoring |
| `f3744c5` | 2013-11-07 | initial yield object support |
| `0a59d78` | 2013-11-09 | add generators and delegated generators benchmarks |
| `2a94e82` | 2013-11-07 | you never use toString() anymore |

## Merge commits (merging others' pull requests)

| Hash | Date | Message |
|---|---|---|
| `70ba8e2` | 2014-10-27 | Merge pull request #153 from bransorem/patch-1 |
| `c8b76ae` | 2014-10-04 | Merge pull request #146 from rhacker/patch-1 |
| `023ecb4` | 2014-10-04 | Merge pull request #150 from nexxy/master |
| `aa59ffd` | 2014-06-19 | Merge pull request #128 from sahat/patch-1 |
| `e42133e` | 2014-06-16 | Merge pull request #127 from RichAyotte/patch-1 |
| `9aef83e` | 2014-04-15 | Merge pull request #106 from dead-horse/add-arguments-example |
| `8413e5d` | 2014-04-01 | Merge pull request #104 from plievone/patch-1 |
| `9cdbfeb` | 2014-03-24 | Merge pull request #102 from hemanth/patch-2 |
| `50ed090` | 2014-03-24 | Merge pull request #103 from t3chnoboy/master |
| `7ad53ac` | 2014-01-10 | Merge pull request #72 from Pana/master |
| `b47f068` | 2014-01-10 | Merge pull request #75 from darul75/patch-1 |
| `1bb08e7` | 2014-01-01 | Merge pull request #67 from logicalparadox/bug/nil |

## How to verify

1. Open the public repository (`tj/co`) and look up any hash above.
2. Run `git log --author=<email:d29caa5c> --no-merges --oneline` in a clone to reproduce the list.
3. Run `git shortlog -sne` to see authorship across all contributors.
