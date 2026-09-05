# Changelog

## 0.2.0 (unreleased)

`npm run bench:adversarial` runs the gaming instead of describing it: commit padding, whitespace churn, an unmarked generated file, the same file marked `linguist-generated`, and a co-author trailer against its own control, each applied to a copy of the fixture with every gaming commit dated inside the existing tenure so the window does not move. Sixty padding commits take cadence from 1.0 to 21.0 a week and add one surviving line while the median commit halves; re-indenting every line moves nothing because blame runs with `-w`; 2,000 machine-written lines under a name the lists miss take surviving lines from 51.6% to 99.3%, and marking the file removes them again; the trailer moves only the co-authored count. The README carries the table and `test/adversarial.test.ts` pins the last two findings.

Verification that means something: `workproof check` validates the report against a published JSON Schema and recomputes the hash offline over RFC 8785 canonical JSON; `verify` runs it first and refuses to recompute figures for an edited document, then compares the repository fingerprint (a mismatch stops before figures) and HEAD. `attest` writes an in-toto statement whose subject is the report hash, signs it with an SSH key (`--local`) into a DSSE envelope, and the Action signs it keylessly with Sigstore when `attest: "true"`.

Honest denominators: bot commits leave every figure; lock files, snapshots, minified assets, generated outputs and vendored directories (built-in lists plus `linguist-generated` and `linguist-vendored` in `.gitattributes`) leave every count and the blame sample; the report prints how much was excluded. `--no-exclusions`, `--exclude`, `--seed`, `--copies` and `--ignore-revs-file` are new, and `.git-blame-ignore-revs` at the root is honoured automatically. Every git call runs with pinned diff settings and the report records the git version, blame flags, ignore-revs file and seed.

Seven new figures, each with its bias in its limits: files authored (degree of authorship), major-contributor components, commit size, co-authored commits, absence factor, AI-assisted commits and survival by cohort. Two labels stop overclaiming: "documents authored" is now "documents created" (oldest commit is the author's) and the test figure is titled test-file changes. The badge reads surviving lines and tenure days.

Privacy: the fingerprint is keyed (HMAC-SHA256 under a per-report key printed once and stored nowhere; `--fingerprint-key` reuses one) and GitHub noreply addresses are never written. Reports carry `schemaVersion: 2`; 0.1.x reports fail `check` by design.

The Action writes the Markdown report to the job summary and uploads the report files as the `workproof-report` artifact, so a run leaves something readable behind even without a pull request to comment on. `npm run release` now also moves the `v0` tag that `uses: Bubblegunn/workproof@v0` resolves to, and the release workflow starts on full version tags only, so the moving tag cannot start a second publish.

## 0.1.3 (2026-09-05)

`--badge` writes a shields.io endpoint document next to the report; a composite GitHub Action (`Bubblegunn/workproof@main`) runs the report on a pull request and posts one sticky comment with the six figures.

From outside the project, both by @edwardsong08: the language map now covers Elixir, Scala, Haskell, Lua, R, Objective-C and Zig (#3), and `--format markdown|json|both` lets a pipeline ask for one file instead of two, with `--json` kept as an alias (#9, closes #1).

## 0.1.2 (2026-09-05)

Progress lines on stderr while reading history and blaming; `--max-commits` for enormous histories; elapsed time in the summary line; a multi-repository test; README sections on gaming and a Turkish README; contributing guide, issue templates, roadmap and a provenance release workflow.

## 0.1.1 (2026-09-05)

Clear errors: a plain sentence outside a repository, and when the default identity has no commits the error lists the top authors so you know what to pass to --author; the configured user.name is tried after user.email.

## 0.1.0 (2026-09-05)

First release: six figures (tenure, commit share, cadence, footprint, tests and docs, surviving lines), Markdown and JSON reports, sha256 hash and repository fingerprint, verify, optional model narrative, multi-repository reports.
