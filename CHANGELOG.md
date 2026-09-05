# Changelog

## 0.4.1 (2026-09-05)

A person who signs `Weiß` on one machine and `WEISS` on another was two people, and half their commits fell outside every figure. JavaScript's `toLowerCase` is Unicode's simple case fold and leaves ß alone; the full fold maps it to ss (CaseFolding.txt, status F), which the identity fold now does. The same fold normalises to NFKC, so a name typed in fullwidth Latin letters, which is what a Japanese or Korean keyboard produces without switching modes, matches the ASCII spelling. This changes which commits are counted, not how a name is printed: the report still prints the name git holds.

An Arabic or Hebrew name no longer turns the plain-language paragraph right to left. Names and repository names are wrapped in the U+2068 and U+2069 isolates UAX #9 defines, in the Markdown report only. The JSON keeps the exact string git holds, so the hash is unchanged and a report written before this release still verifies.

The README, in both languages, adds a section on names that are not ASCII and states three choices that are deliberate rather than overlooked: `en-US` number formatting for people, which cannot reach the hash because that is taken over canonical JSON; ISO weeks for cadence, though CLDR gives Monday to only seven of the twenty most populous countries; and mapping identities by address, because git matches a `.mailmap` name ignoring case for ASCII letters only.

## 0.4.0 (2026-09-05)

**The hash was not reproducible on another machine, and that is the one thing this tool exists to promise.** It covered two values that belong to the computer rather than to the repository: the local directory's name, and the git version string. Both were reproduced with real runs. The same repository copied to a second folder and measured with the same command produced two different hashes; so did two reports identical except for `git --version`. Anyone who cloned a repository under a different name, or simply had a different git, could not verify a report they had been given.

Both fields stay in the report, because they explain why two runs might legitimately differ, and both are now outside the hash. What the hash covers is what a stranger can reproduce: the head, the fingerprint, the identity, the exclusion counts, every figure, and the flags the caller chose, including the blame flags, the ignore-revs file and the seed. A test pins the exclusions in both directions, and CI recomputes the same fixture's hash on Linux, macOS and Windows so this cannot decay.

The README now places these figures in the literature that already exists around them: Kalliamvakou, Gousios and Blincoe on the traps in mining a forge, Bird and colleagues on ownership as a defect predictor rather than a measure of credit, and Spinellis and Gurov on how long lines live. None of that work measures a person's share of surviving code, and a first measurement of how far it diverges from commit share now sits in the surviving-lines repository.

**Every existing report's hash changes.** A report made before this release will not verify against one made after, the same way the local-weeks change did in 0.3.0. Regenerate any report you are relying on.

## 0.3.1 (2026-09-05)

A report now says when someone else in the repository looks like the same person. Anyone who has committed from a laptop and a work machine is two authors to git, so the report described half their work and said nothing about the other half, which is a silently wrong number in a tool whose whole claim is that its numbers can be checked. Three signals raise it: the same name on another address, a GitHub noreply login that matches the subject's address or name, and the same address name on another domain. Role addresses such as `dev@` and bot addresses are ignored. The disclosure appears in the Markdown above the figures, as `identity.possiblySplit` in the JSON, and as a warning on stderr during the run; the addresses themselves stay out of the document unless `--emails` is on, as everywhere else. It is a disclosure and not a correction: only the author knows whether two addresses are one person. No figure, hash or verification changed, and a report made before this release still verifies.

## 0.3.0 (2026-09-05)

A repository whose paths are stored decomposed now produces a report instead of failing. Git precomposes command-line arguments on macOS, so a path read out of the tree and handed back as a pathspec matched nothing, ending the run with `fatal: no such path café.ts in HEAD` and no report. `core.precomposeunicode=false` joins the pinned settings, so the path sent is the path git stored. A checkout authored on Linux carrying Korean, French, Turkish, Vietnamese, Portuguese or Spanish filenames was affected; figures for ASCII repositories are byte-identical.

Weeks and tenure days are the author's, not UTC's. Each commit records its own offset in `%aI`, and that was discarded, so a commit made on Monday morning in Auckland landed in the previous UTC week: four commits inside two local weeks were reported as three active weeks with a three-week streak. Calendar figures now read the author's own clock, while anything ordering commits in time still uses the instant. **This changes published figures and therefore report hashes** for any repository whose commits cross a UTC day boundary; on this project's portfolio repository the tenure start moved from 29 July to 30 July, the day the work was actually done. A report produced before this release will not verify against one produced after it.

An author matches across Unicode normalization and Turkish casing. A name typed precomposed did not match the same name stored decomposed, and the error then listed an author that looked identical to what had just been typed. `"İ".toLowerCase()` is "i" followed by a combining dot and `"I".toLowerCase()` is "i" rather than "ı", so `--author "İSMAİL YILMAZ"` matched nothing, including itself. Names and addresses are now folded to NFC with the four dotted and dotless i forms collapsed, and the error says the comparison was made on the folded form. Two names differing only in dotted and dotless i now match each other, which is the deliberate cost.

## 0.2.0 (2026-09-05)

Every repository section of the Markdown report now opens with a plain-language paragraph for the person who will read the report and does not write software. It is assembled from the figures by a fixed rule with no model call, so it is deterministic, states no opinion about quality, keeps commit share and surviving lines apart, and ends with the command that recomputes it. It is derived from the hashed figures rather than added to them, so the hash is unchanged.

`verify` now prints what it proves and what it does not: that the figures were recomputed from the repository and the document was not edited, and not that the repository is honest history or that the work was good. When figures differ it says that a difference is not proof of dishonesty, because every figure except tenure is computed at HEAD and HEAD moves.

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
