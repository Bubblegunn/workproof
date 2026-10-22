# Summary of Authored Contributions: Jonathan Ong

This summary was generated from the git history of a source repository. It contains commit metadata only (dates, counts, commit messages, short commit IDs). No source code is included.

## Scope

- Git identity: Jonathan Ong <<email:d29caa5c>> (the identity configured in the repository)
- Commits matched by author email: 69 (12 of them merge commits)
- Active period: 2013-11-07 to 2015-07-09
- Net size of those commits: about 1,157 lines added and 1,076 lines removed (all authored commits, from `git log --numstat`)
- Context: the repository has about 300 commits from many authors. Only commits authored under the identity above are counted here. Other people's work is not claimed.
- Not included: 5 further commits carry the name "Jonathan Ong" or "jongleberry" with other email addresses (<email:4132b6bd>, a GitHub noreply address). I have not counted them because I can't confirm from the repository that they are the same person. If they are yours, add them and state how you know.

## Areas of work (from commit messages)

| Area | Examples (commit ID, date, message) |
|---|---|
| Releases / versioning | Version tags 3.0.1 to 4.6.0, e.g. `b54d18f` 2015-07-09 "4.6.0"; `d8b7fda` 2015-04-17 "4.5.2"; `2203ee5` 2015-02-14 "4.4.0" |
| Bug fixes | `cf27103` 2013-11-24 fix "Generator is already running" errors when no callback provided; `31b4ab2` 2013-12-19 callback passed as an argument to generators; `19ada57` 2014-03-14 fix #92; `9d996f2` 2015-03-17 support regular functions that throw |
| Features | `f3744c5` 2013-11-07 initial yield object support; `e83d8a7` 2013-11-24 make context and arguments be passed through thunk; `8446e81` 2014-06-30 preserve key ordering; `2f22986` 2014-06-30 better error message when a non-yieldable is yielded |
| Promise implementation | `4d2a63c` 2014-10-27 switch to a promise implementation; `5007a81` 2014-12-18 always wrap the result in a Promise.resolve() |
| Testing / CI | `7cb98de` 2013-11-08 add a recursion test; `2cf5fe0` 2013-11-24 add a test case for "Generator is already running"; `6c88636` 2014-10-27 add test coverage; `1c72388` 2015-02-05 test on iojs; `e01efb5` 2013-11-12 travis |
| Refactoring / cleanup | `bcbd0b8` 2013-12-19 remove unnecessary co.call(); `cd850e7` 2014-06-30 use a closure instead of .bind(); `d55df9a` 2014-05-03 remove unused toString; `4176407` 2014-12-26 remove unused request dependency |
| Dependencies | `e0eebaf` 2014-06-30 update deps, use bluebird instead of q |
| Benchmarks | `0f193f0` 2013-11-08 add `object`; `0a59d78` 2013-11-09 add generators and delegated generators benchmarks; `eda952a` 2014-10-27 remove benchmarks |
| Documentation | `4f02a4e`, `9194353`, `e198766` (2013-12-19, readme fixes and history notes for 3.0.0); `0cb0263` 2014-01-02 readme: remove references to join; `1ddcda6` 2014-05-03 platform compat notes |
| Code review / merging | 12 merge commits of outside pull requests, e.g. `70ba8e2` (#153), `c8b76ae` (#146), `023ecb4` (#150), `aa59ffd` (#128), `e42133e` (#127) |

Files touched most often: `package.json` (23 commits), `index.js` (21), `History.md` (13), `Readme.md` (8), `component.json` (7), `test/thunks.js` (6).

## How a reviewer can verify this

Anyone with access to the repository can reproduce every figure with:

    git log --all --author=<email:d29caa5c> --oneline | wc -l
    git log --all --author=<email:d29caa5c> --format='%h %ad %s' --date=short

Commit IDs above are short hashes of the real commits. Commit author names and emails are set locally by whoever makes the commit, so this summary shows what the history attributes to this identity. It does not independently prove who typed the changes. An employer or client letter should accompany it.

## Statement

[To be completed and signed by you, in your own words: your role on the engagement, who the client or organisation was, and that the commits listed were made by you.]
