# Summary of commit history for one git identity

Generated 2026-10-22 from the local git repository. It contains no source code.

## Identity used

- Git identity configured in the repo: Jonathan Ong <<email:d29caa5c>>
- Only commits whose author email matches this address are counted.
- The repo also has commits under other addresses (<email:4132b6bd>, and GitHub
  noreply addresses). They are not counted here. If they are also yours, say so and
  they can be added.

## Repository

- Package name in package.json: `co`, version 4.6.0, MIT license, `repository: tj/co`.
- 299 commits in total, from many authors.
- Language: JavaScript (Node.js). Files: `index.js`, tests in `test/`, `benchmark.js`,
  `Readme.md`, `History.md`, `package.json`, `component.json`.

## Figures (authored by the identity above)

| Measure | Value |
|---|---|
| Commits authored, excluding merges | 56 |
| Merge commits (merging other people's pull requests) | 12, not counted as authored work |
| Share of the repo's 299 commits | 68 of 299 (23%), merges included |
| Active period (author dates) | 2013-11-07 to 2015-07-09 |
| Lines added / removed (all 68 commits) | 1,151 / 1,075 |
| Distinct files touched | 25 |
| Most-changed files (lines added + removed) | index.js (676), test/thunks.js (282), test/receiver.js (182), benchmark.js (139) |
| Release commits (version bumps, 3.0.1 to 4.6.0) | 15 |

## What the commit messages show

Taken from commit subjects only. No outcomes are claimed beyond what the messages say.

- **Features:** initial support for yielding objects (2013-11); passing context and
  arguments through thunks; support for regular functions that throw; a better error
  message when a non-yieldable value is yielded; preserving key ordering; switching to a
  promise implementation (2014-10); replacing the `q` library with `bluebird`.
- **Bug fixes:** several commits on "Generator is already running" errors, including a
  test case; callbacks passed as arguments to generators; the fix for issue #92; always
  wrapping results in `Promise.resolve()`.
- **Testing and tooling:** added a recursion test, test coverage reporting, Travis CI
  config, iojs in the CI matrix, `npm test`, `component.json`, and benchmarks (later removed).
- **Maintenance:** README and History.md updates, removal of unused code and an unused
  dependency, dependency updates.
- **Releases:** 15 version commits from 3.0.1 to 4.6.0, covering 2013-12 to 2015-07.
- **Review and merging:** 12 merge commits of external pull requests (2014-01 to 2014-10).

`contribution-commit-log.csv` lists all 56 non-merge commits with hash, date and subject.

## Limits of this document

- Author name and email in git are self-declared and can be rewritten. This document
  shows what the history says. It is not independent proof.
- Line counts measure volume, not quality or importance.
- Version-bump commits are counted as commits. They are release work, not feature work.
- To back this up, give the immigration officer or a third party a way to check it: a
  letter from the client or a manager, or a read-only walkthrough of the repo with someone
  authorised to approve it.

## How to reproduce

Run these in the repo:

    git log --author="<email:d29caa5c>" --no-merges --oneline | wc -l
    git log --author="<email:d29caa5c>" --no-merges --numstat --format=

Both commands print counts and file names only.
