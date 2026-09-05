# Changelog

## 0.1.3 (unreleased)

`--badge` writes a shields.io endpoint document next to the report; a composite GitHub Action (`Bubblegunn/workproof@main`) runs the report on a pull request and posts one sticky comment with the six figures.

From outside the project, both by @edwardsong08: the language map now covers Elixir, Scala, Haskell, Lua, R, Objective-C and Zig (#3), and `--format markdown|json|both` lets a pipeline ask for one file instead of two, with `--json` kept as an alias (#9, closes #1).

## 0.1.2 (2026-09-05)

Progress lines on stderr while reading history and blaming; `--max-commits` for enormous histories; elapsed time in the summary line; a multi-repository test; README sections on gaming and a Turkish README; contributing guide, issue templates, roadmap and a provenance release workflow.

## 0.1.1 (2026-09-05)

Clear errors: a plain sentence outside a repository, and when the default identity has no commits the error lists the top authors so you know what to pass to --author; the configured user.name is tried after user.email.

## 0.1.0 (2026-09-05)

First release: six figures (tenure, commit share, cadence, footprint, tests and docs, surviving lines), Markdown and JSON reports, sha256 hash and repository fingerprint, verify, optional model narrative, multi-repository reports.
