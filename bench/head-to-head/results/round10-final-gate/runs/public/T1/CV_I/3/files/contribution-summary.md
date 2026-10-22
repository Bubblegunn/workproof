# Contribution summary from git history

**Author identity:** Jonathan Ong <<email:d29caa5c>> (the git identity configured in the repository)
**Period of commits:** 2013-11-07 to 2015-07-09
**Source:** `git log` on the repository, generated 2026-10-22. No source code is included.

## Totals for this identity

| Measure | Value |
| --- | --- |
| Commits authored | 68 (299 in the whole history) |
| Non-merge commits | 56 |
| Merge commits (merging other people's pull requests) | 12 |
| Lines added / removed (non-merge commits) | 1,151 / 1,075 |
| Other main author (by name, non-merge commits) | TJ Holowaychuk, 90; this author's name appears on 60 |

Project: a JavaScript library for generator-based asynchronous control flow (npm package `co`, versions 3.0.1 to 4.6.0 appear in this identity's commits).

## What the commits show

Descriptions below restate commit messages. They make no claim about adoption or measured impact.

**Core library changes**
- Added initial support for yielding objects (2013-11-07).
- Fixed "Generator is already running" errors when no callback is provided, with a test case (2013-11-24).
- Passed context and arguments through thunks; fixed a callback passed as an argument to generators (2013-11 to 2013-12).
- Improved the error message when a non-yieldable value is yielded; preserved key ordering for objects (2014-06-30).
- Switched the implementation to promises, and always wrapped results in `Promise.resolve()` (2014-10-27, 2014-12-18).
- Added support for regular functions that throw (2015-03-17).
- Added support for passing the remaining arguments of `co` to the generator (version 4.6.0, 2015-07-09).

**Releases**
- Release commits for 3.0.1, 3.0.2, 3.0.3, 3.1.0, 4.0.1, 4.0.2, 4.1.0, 4.2.0, 4.3.0, 4.3.1, 4.4.0, 4.5.0, 4.5.1, 4.5.2 and 4.6.0, with History.md updates.

**Testing and tooling**
- Added test coverage reporting and a Travis CI configuration; added testing on io.js (2014-10 to 2015-02).
- Added recursion, object and regression tests; removed an unused dependency (2013-11 to 2014-12).
- Added and later removed benchmarks (2013-11 to 2014-10).

**Documentation and packaging**
- Readme edits, badges, platform compatibility notes, and a `component.json` (2013-11 to 2014-10).

**Maintenance**
- 12 merge commits integrating pull requests from outside contributors.

Full per-commit data (hash, date, subject, files changed, lines added and removed) is in `commit-log.csv`.

## How to read this document

- Counts cover only the email address above. Other addresses in the history (for example <email:4132b6bd>) are not included.
- Git author names and emails are written by whoever makes the commit, so this document shows what the history records, not independent proof of identity. A reviewer can check the commit hashes against the repository if access is arranged.
- Line counts measure change volume, not effort or quality.
