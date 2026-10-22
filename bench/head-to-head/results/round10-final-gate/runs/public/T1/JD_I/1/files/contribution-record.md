# Contribution Record: Jonathan Ong

Generated 2026-10-22 from the git history of a local repository (package name `co`, v4.6.0, a generator-based async control-flow library for Node.js).
Only metadata is included: no source code, diffs or file contents.

## Identity matched
- Git identity configured in the repository: Jonathan Ong <<email:d29caa5c>>
- Only commits whose author email is exactly this address are counted below.

## Summary (author email <email:d29caa5c>)
| Measure | Value |
|---|---|
| Commits authored |       68 of 299 total in repository |
| Share of repository commits |       68/299 |
| First / last commit | 2013-11-07 / 2015-07-09 |
| Lines added / deleted | 1151 / 1075 |
| Most-touched files | package.json (22 commits), index.js (21), History.md (12), Readme.md (8), component.json (7), test/thunks.js (6) |

## Work areas (from commit subjects)
- Core library (`index.js`): object-yield support, "Generator is already running" fixes, callback/context passing, key-ordering preservation, clearer errors for non-yieldable values, switch to a Promise-based implementation (4.0.0), wrapping results in `Promise.resolve()`, support for regular functions that throw (4.5.0).
- Testing and CI: recursion test, regression tests, Travis CI, io.js testing, test coverage.
- Releases and maintenance: version releases 3.0.1 to 4.6.0, History.md changelog, dependency updates and removals.
- Documentation and benchmarks: README edits, badges, benchmark additions and removal.

## Full list
See `commit-log-jonathan-ong.csv` (hash, date, subject for each commit).

## Verification
Anyone with access can reproduce with:
    git log --author=<email:d29caa5c> --format='%H,%ad,%s' --date=short
