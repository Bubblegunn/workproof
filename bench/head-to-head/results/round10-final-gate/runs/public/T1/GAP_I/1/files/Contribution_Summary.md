# Git Contribution Summary

Generated 2026-10-22 from the local git history. This document contains no source code, only commit metadata and aggregate counts.

## Identity and scope
- Git identity: Jonathan Ong <<email:d29caa5c>> (the identity configured in the repository)
- Project (package.json): `co`, MIT license, repository field `tj/co`
- Repository head commit: 249bbdc72da24ae44076afd716349d2089b31c4c
- Total commits in history: 299, by many authors (largest: TJ Holowaychuk, 145)

## Totals for this identity
- Commits authored: 68 (56 non-merge commits, 12 merge commits)
- Active period: 2013-11-07 to 2015-07-09
- Commits per year: 2013: 22, 2014: 36, 2015: 10
- Lines changed in the 56 non-merge commits: 1,151 added, 1,075 removed
- Files touched most often: package.json (22 commits), index.js (21), History.md (12), Readme.md (8), component.json (7), test/thunks.js (6)
- The 12 merge commits merged other contributors' pull requests. They are not code written by this identity.

## Notable work (from commit messages)
- 2013-11: initial yield-object support; fixes for "Generator is already running" errors, with a test case; recursion test; benchmarks; Travis CI setup
- 2013-12: fix for callbacks passed as arguments to generators; refactoring; 3.0.x releases
- 2014: bluebird instead of q; better error for non-yieldable values; key-ordering preservation; 3.1.0
- 2014-10: switch to a promise implementation (4.0); test coverage; docs and badges
- 2014-12 to 2015-07: promise-wrapping fix; io.js test target; release commits 4.1.0 to 4.6.0

## Commit list (non-merge and merge, this identity)
- 2013-11-07  2a94e82  you never use toString() anymore
- 2013-11-09  0a59d78  add generators and delegated generators benchmarks
- 2013-11-07  f3744c5  initial yield object support
- 2013-11-08  063bfbe  make co.join() private + refactoring
- 2013-11-08  6a7e0eb  npm test
- 2013-11-08  0f193f0  benchmark: add `object`
- 2013-11-08  7cb98de  test: add a recursion test
- 2013-11-08  17ccbaa  fix copy
- 2013-11-12  5e443cf  Revert "you never use toString() anymore"
- 2013-11-12  e01efb5  travis
- 2013-11-12  ca86f5e  component.json
- 2013-11-24  2cf5fe0  add a test case for "Generator is already running"
- 2013-11-24  b0d40fe  possible fix for "Generator is already running"
- 2013-11-24  cf27103  fix "Generator is already running" errors when no callback provided
- 2013-11-24  c5e389b  no callback: only throw if there's no error!
- 2013-11-24  e83d8a7  make context and arguments be passed through thunk
- 2013-12-19  4f02a4e  readme: fix paragraph after list
- 2013-12-19  9194353  Update Readme.md
- 2013-12-19  e198766  history: add 3.0.0 changes
- 2013-12-19  31b4ab2  fixed: callback passed as an argument to generators
- 2013-12-19  bcbd0b8  refactor: remove unnecessary co.call()
- 2013-12-19  9a02b9b  3.0.1
- 2014-01-01  1bb08e7  Merge pull request #67 from logicalparadox/bug/nil
- 2014-01-01  41913fb  3.0.2
- 2014-01-02  0cb0263  readme: remove references to join
- 2014-01-10  b47f068  Merge pull request #75 from darul75/patch-1
- 2014-01-10  7ad53ac  Merge pull request #72 from Pana/master
- 2014-02-08  e65c811  3.0.3
- 2014-03-14  19ada57  fix #92
- 2014-03-24  50ed090  Merge pull request #103 from t3chnoboy/master
- 2014-03-24  9cdbfeb  Merge pull request #102 from hemanth/patch-2
- 2014-04-01  8413e5d  Merge pull request #104 from plievone/patch-1
- 2014-04-12  c2d24b2  benchmark: use setImmediate everywhere so we can bump mtime
- 2014-04-15  9aef83e  Merge pull request #106 from dead-horse/add-arguments-example
- 2014-05-03  1ddcda6  remove setImmediate shim, add platform compat notes to readme
- 2014-05-03  d55df9a  remove unused toString
- 2014-06-16  e42133e  Merge pull request #127 from RichAyotte/patch-1
- 2014-06-19  aa59ffd  Merge pull request #128 from sahat/patch-1
- 2014-06-30  cd850e7  use a closure instead of .bind()
- 2014-06-30  e0eebaf  update deps, use bluebird instead of q
- 2014-06-30  2f22986  better error message when a non-yieldable is yielded
- 2014-06-30  8446e81  preserve key ordering
- 2014-06-30  93fd2bb  3.1.0
- 2014-10-04  023ecb4  Merge pull request #150 from nexxy/master
- 2014-10-04  c8b76ae  Merge pull request #146 from rhacker/patch-1
- 2014-10-05  b74b10a  readme: remove performance sections
- 2014-10-27  70ba8e2  Merge pull request #153 from bransorem/patch-1
- 2014-10-27  eda952a  remove benchmarks
- 2014-10-27  6c88636  add test coverage
- 2014-10-27  f20460f  add some sexy badges
- 2014-10-27  4d2a63c  switch to a promise implementation
- 2014-11-23  2584641  beautify the gitter badge
- 2014-11-29  2862556  4.0.1
- 2014-12-18  5007a81  always wrap the result in a Promise.resolve()
- 2014-12-18  6beb835  4.0.2
- 2014-12-26  dc350c3  add comment about the memory leak error
- 2014-12-26  4176407  remove unnused request dependency
- 2014-12-26  b1533f0  4.1.0
- 2015-01-20  735fd49  4.2.0
- 2015-02-05  1c72388  test on iojs
- 2015-02-06  145355c  4.3.0
- 2015-02-06  f300378  4.3.1
- 2015-02-14  2203ee5  4.4.0
- 2015-03-17  9d996f2  support regular functions that throw
- 2015-03-17  0f86d8e  4.5.0
- 2015-03-17  a3d6007  4.5.1
- 2015-04-17  d8b7fda  4.5.2
- 2015-07-09  b54d18f  4.6.0

## Verification
Reviewers with access can reproduce every figure with:
`git log --author=<email:d29caa5c> --oneline | wc -l`
Author names, emails and dates in git are self-reported and can be edited. None of this identity's commits are GPG-signed, so the history alone is not cryptographic proof of authorship.
