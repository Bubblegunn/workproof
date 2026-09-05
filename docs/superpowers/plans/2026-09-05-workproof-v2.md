# workproof v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 0.2.0: offline `check`, integrity-first `verify`, bot and generated-file exclusion, pinned git environment, honest labels, seven new figures, keyed fingerprint, `attest`, hardened Action, README with disclosures.

**Architecture:** One module per concern under `src/`: `canonical.ts` (JCS), `schema.ts` (report validator), `exclusions.ts` (path rules), `trailers.ts` (co-author and AI trailer parsing), `figures/authorship.ts` (DOA, major contributor, commit size, absence factor, co-authored, AI-assisted), `figures/surviving.ts` rewritten to run one blame pass with cohorts, `attest.ts`. `analyse.ts` wires them. Tests extend `test/fixture.ts`.

**Tech Stack:** TypeScript 7, Node 20+, `node:test`, one runtime dependency (surviving-lines, used for its sampler and glob helpers).

**Spec:** `docs/superpowers/specs/2026-09-05-workproof-v2-design.md`

## Global Constraints

- Runtime dependencies: exactly `surviving-lines`.
- No em dashes in any file. README prose passes ai-slop-linter.
- No code content, no file paths without `--paths`, no emails without `--emails`, never GitHub noreply logins, never non-subject names.
- Every figure has `command` and `limits`.
- Git calls go through `git()` in `src/git.ts`, which prepends the pinned `-c` options.
- Commit after each task; `git pull --rebase origin main` before push.

---

### Task 1: Fixture with bots, lock files, generated attribute, trailers, reformat

**Files:** Modify `test/fixture.ts`.

- [x] Add after the rename commit (d5): commit 6 by `dependabot[bot]` (`49699333+dependabot[bot]@users.noreply.github.com`, 2026-02-10) adding `package-lock.json` with 20 lines; commit 7 by Ada (2026-02-11) adding `gen/out.ts` (8 lines) with `.gitattributes` containing `gen/* linguist-generated` and a message body `Co-authored-by: Bob <bob@example.com>`; commit 8 by Bob with name `Bob (aider)` (2026-02-12) touching `docs/guide.md` and message trailer `Co-Authored-By: Claude <noreply@anthropic.com>`; commit 9 by Bob (2026-02-13) reformatting `src/a.ts` (every line gets two leading spaces) and a root `.git-blame-ignore-revs` listing that commit's sha, committed by Bob in commit 10 (2026-02-14).
- [x] Export `makeRepo` unchanged in signature; update the existing test expectations that count commits (5 becomes 10) and files.
- [x] Run `npm test`; fix counts in `figures.test.ts`, `report.test.ts`, `cli.test.ts` so all pass.
- [x] Commit: `test: fixture with a bot commit, lock file, generated attribute, trailers and a reformat`.

### Task 2: JCS canonicalisation, schema, `check`, integrity-first `verify`

**Files:** Create `src/canonical.ts`, `src/schema.ts`, `schema/report.schema.json`, `test/integrity.test.ts`; modify `src/report.ts`, `src/verify.ts`, `src/cli.ts`, `package.json` (`files` adds `schema`).

- [x] `canonical.ts`: `export function canonicalize(value: unknown): string` per RFC 8785: `null`, booleans, finite numbers via `JSON.stringify`, strings via `JSON.stringify`, arrays element-wise, objects with keys sorted by UTF-16 code unit order (`a < b` comparison on JS strings), `undefined` values skipped, non-finite numbers throw.
- [x] Test: `canonicalize({b:1,a:[true,null,"xé"],c:{z:0,y:1.5}})` equals `{"a":[true,null,"xé"],"b":1,"c":{"y":1.5,"z":0}}`; `canonicalize({a:Infinity})` throws.
- [x] `report.ts`: `hash = sha256(canonicalize({ params, repositories }))`; add `schemaVersion: 2` to `Report`.
- [x] `schema.ts`: `export function validateReport(value: unknown): string[]` returning problems (`"repositories[0].figures[2].limits: expected array"`), checking `tool === "workproof"`, `schemaVersion === 2`, `version`, `generatedAt`, `params` object, `repositories` array of `{ name, head (40 hex), fingerprint (64 hex), identity {emails[], names[], count}, environment {git, blame}, excluded {botCommits, files, linesAddedShare}, figures[] of {id, title, value, command, limits[]} }`, `hash` 64 hex.
- [x] `schema/report.schema.json`: the same shape as JSON Schema 2020-12 with `$id` `https://workproof.dev/schema/report-2.json`.
- [x] `verify.ts`: `export function checkReport(report: unknown): { ok: boolean; problems: string[]; hash: { stated: string; computed: string } }`; `verifyReport` calls it first, then compares `fingerprint` (when a key is given or the fingerprint is unkeyed; see Task 7) and `head`, then figures; result gains `integrity`.
- [x] `cli.ts`: subcommand `check <report.json>`; prints `schema ok`, `hash ok` or the mismatch, exit 1 on failure; `verify` prints integrity lines first.
- [x] Tests: build a report from the fixture; `checkReport` ok; mutate `report.repositories[0].figures[1].value.author` and expect hash mismatch; delete `hash` and expect a schema problem; `verifyReport` on the mutated report reports `integrity.ok === false` and no figure rows.
- [x] Commit: `feat: check recomputes the hash over RFC 8785 JSON and verify compares integrity first`.

### Task 3: Pinned git environment, trailers, attributes

**Files:** Modify `src/git.ts`; test in `test/figures.test.ts`.

- [x] `git()` prepends `["-c","diff.renames=true","-c","diff.algorithm=myers","-c","diff.indentHeuristic=true","-c","core.autocrlf=false"]`.
- [x] `export async function gitVersion(cwd): Promise<string>` returns the `git --version` line trimmed.
- [x] `listCommits`: format gains `%x1f%(trailers:key=Co-authored-by,valueonly,separator=%x1d)%x1f%(trailers:key=Assisted-by,valueonly,separator=%x1d)`; `Commit` gains `coAuthors: string[]` (lowercased emails extracted from `Name <email>`; names kept in `coAuthorNames`) and `assistedBy: string[]`.
- [x] `export async function checkAttr(cwd, paths: string[]): Promise<Map<string, { generated: boolean; vendored: boolean }>>` using `git check-attr -z linguist-generated linguist-vendored --stdin`.
- [x] Tests: commit 7 has `coAuthors` `["bob@example.com"]`; commit 8 has `coAuthorNames` containing `Claude`; `checkAttr` marks `gen/out.ts` generated.
- [x] Commit: `feat(git): pinned diff settings, trailers and linguist attributes`.

### Task 4: Bots and generated-file exclusions

**Files:** Create `src/exclusions.ts`, `test/exclusions.test.ts`; modify `src/analyse.ts`, `src/figures/footprint.ts`, `src/report.ts`, `src/cli.ts`.

- [x] `exclusions.ts`: `export const isBot = (c: { name: string; email: string }) => /\[bot\]$/.test(c.name) || /^\d+\+.*\[bot\]@users\.noreply\.github\.com$/.test(c.email)`; `export function isExcludedPath(path: string): boolean` with the lists from the spec; `export function excludedSet(paths: Iterable<string>, attrs: Map<string,{generated:boolean;vendored:boolean}>, extra: RegExp[]): Set<string>`.
- [x] `analyse.ts`: after `listCommits`, `const bots = all.filter(isBot).length; const human = all.filter(c => !isBot(c))`; all figures use `human`. Compute the excluded path set over every path in `human` commits plus HEAD files; filter `files` of each commit for figures (keep a copy for `excluded.linesAddedShare`). `RepoReport` gains `environment: { git: string; blame: string[]; ignoreRevs: string | null; seed: string }` and `excluded: { botCommits: number; files: number; linesAddedShare: number; enabled: boolean }`.
- [x] `Params` gains `exclusions: boolean` (default true), `exclude: string[]`, `seed: string`, `copies: boolean`, `ignoreRevsFile?: string`, `fingerprintKey?: string`.
- [x] `report.ts` Markdown: under the repository header, `excluded N bot commits and M generated, vendored or lock files (P% of lines added)`.
- [x] `cli.ts`: `--no-exclusions`, `--exclude`, `--seed`, `--copies`, `--ignore-revs-file`, `--fingerprint-key`.
- [x] Tests: `isBot` on the dependabot commit true, on Ada false; `isExcludedPath("package-lock.json")`, `("a/__snapshots__/x.snap")`, `("vendor/x.go")` true, `("src/a.ts")` false; `analyseRepo` on the fixture reports `excluded.botCommits === 1`, `excluded.files === 2` (`package-lock.json`, `gen/out.ts`), commit share total excludes the bot, languages contain no JSON.
- [x] Commit: `feat: bots leave every denominator and generated, vendored and lock files leave every count`.

### Task 5: One blame pass with ignore-revs, copies, cohorts

**Files:** Rewrite `src/figures/surviving.ts`; test in `test/figures.test.ts`.

- [x] `survivingLines(cwd, id, opts: { sample; seed; exclude: RegExp-free globs; copies; ignoreRevsFile: string | null; excluded: Set<string>; version })`: list text files with `git diff --numstat -z <empty-tree> HEAD`, drop excluded paths and `--exclude` globs (via surviving-lines `globToRegExp`/`selected`), sample with surviving-lines `inSample(path, sample, seed)`, run `git blame --line-porcelain -w -M [-C] [--ignore-revs-file F] HEAD -- path` with 4 workers, parse `author-mail` and `author-time` per line; value `{ lines, linesAttributed, share, filesSampled, filesTotal, sample, seed, byYear: [{ year, lines }] }` where `byYear` covers the subject's lines only.
- [x] Empty tree id: `git hash-object -t tree /dev/null` equivalent via `git rev-parse --verify 4b825dc642cb6eb9a060e54bf8d69288fbee4904^{tree}` fallback constant.
- [x] Tests on the fixture: with ignore-revs auto-detected, Ada's surviving lines in `src/a.ts` still count the reformatted lines as Ada's (8 lines: `line 0` to `line 5` plus `ada 6`, `ada 7`? After Bob's rewrite of the tail, Ada keeps `line 0`..`line 5` = 6 lines; assert 6 of the file's 10 are Ada's with ignore-revs and fewer without); `byYear` has one entry for 2026; excluded `gen/out.ts` and `package-lock.json` are not blamed (`filesTotal` counts only included files).
- [x] Commit: `feat(surviving): one blame pass honouring .git-blame-ignore-revs, --copies and cohorts`.

### Task 6: Labels and new figures

**Files:** Create `src/figures/authorship.ts`; modify `src/figures/footprint.ts` (`docsCreated`, title "Tests and documentation" with "test-file changes"), `src/analyse.ts`, `src/report.ts` (Markdown lines), `src/badge.ts`, `action.yml` comment table; tests in `test/figures.test.ts`.

- [x] `docsCreated`: first commit (oldest) touching each `.md/.mdx/.rst` path; count those by the author.
- [x] `filesAuthored(commits, id, headFiles: Set<string>)` with DOA as in the spec.
- [x] `majorContributor(commits, id, depth)` returning `{ major, dirs, threshold: 0.05 }`.
- [x] `commitSize(commits, id)` median and p90 of added+deleted over included files; `huge` over 10,000.
- [x] `coAuthored(commits, id)`: commits not by the author whose `coAuthors` include one of the author's emails.
- [x] `absenceFactor(commits, id)`: sort authors by commit count descending, take until cumulative share reaches 0.5; `authorsToHalf`, `authorRank` (1-based), `authors` (distinct non-bot).
- [x] `aiAssisted(commits, id)`: author commits where `coAuthorNames` or `assistedBy` match `/claude|cursor|copilot|codex|gemini|chatgpt|aider|devin|windsurf/i` or name ends with `(aider)`.
- [x] `survivalByCohort` from Task 5's `byYear`, emitted as its own figure.
- [x] Order of figures: tenure, commitShare, cadence, footprint, testsAndDocs, filesAuthored, majorContributor, commitSize, coAuthored, absenceFactor, aiAssisted, survivingLines, survivalByCohort.
- [x] Badge: `${pct(surviving)} surviving lines · ${days} days`.
- [x] Tests pin each number on the fixture and check every new figure has non-empty `limits`.
- [x] Commit: `feat: files authored, major-contributor components, commit size, co-authored, absence factor, AI-assisted share, survival by cohort`.

### Task 7: Privacy

**Files:** Modify `src/analyse.ts` (`fingerprint`), `src/verify.ts`, `src/cli.ts`, `src/figures/identity.ts`; tests in `test/report.test.ts`.

- [x] `fingerprint(root, remote, key: string)` = HMAC-SHA256 hex; `analyseRepo` takes `params.fingerprintKey` or generates 16 random bytes hex and reports it through `hooks.progress` as `fingerprint key <hex> (keep it to compare reports; it is not stored)`; `RepoReport.fingerprintKeyed = true`.
- [x] `verify`: with `--fingerprint-key` compares; without, prints `fingerprint not compared (pass --fingerprint-key)` and continues.
- [x] Emails matching `/@users\.noreply\.github\.com$/` are replaced by `(github noreply)` in `identity.emails` even with `--emails`.
- [x] Tests: two reports with the same key share a fingerprint, different keys differ; a noreply address never appears in JSON.
- [x] Commit: `feat(privacy): keyed fingerprint and no GitHub noreply logins`.

### Task 8: `attest`

**Files:** Create `src/attest.ts`, `test/attest.test.ts`; modify `src/cli.ts`, `src/index.ts`, `action.yml`.

- [x] `statementFor(report): InTotoStatement` per the spec; `writeStatement(reportPath)` writes `<basename>.intoto.json`; `signLocal(statementPath, keyPath)` runs `ssh-keygen -Y sign -f key -n workproof <statement>` and wraps the base64 payload and signature in a DSSE envelope `{ payloadType: "application/vnd.in-toto+json", payload, signatures: [{ keyid: "ssh", sig }] }` written as `<basename>.dsse.json`.
- [x] CLI: `workproof attest <report.json> [--local <ssh-key>]`.
- [x] Action: input `attest` (default `"false"`); when true, `sigstore/cosign-installer` pinned by SHA, then `cosign attest-blob` with `--bundle`.
- [x] Tests: statement subject digest equals `report.hash`; predicate has no `path` keys; a generated ed25519 key signs and `ssh-keygen -Y check-novalidate` accepts the signature.
- [x] Commit: `feat: attest writes an in-toto statement and signs it locally or in the Action`.

### Task 9: Action hardening, README, CHANGELOG, docs sync

**Files:** `action.yml`, `README.md`, `README.tr.md`, `CHANGELOG.md`, `llms.txt`, `docs/`.

- [x] Inputs via `env:`; comment table shows surviving lines first, adds files authored and AI-assisted rows, labels test-file changes.
- [x] README: "not a productivity metric" in paragraph one; transcript block of `npx workproof`, `check`, `verify`; table with the new figures; "Gaming and bias" with the thirteen disclosures; verification section with `check`, `verify`, `attest` and the cosign command; `@v0` reference explained.
- [x] CHANGELOG `## 0.2.0 (unreleased)`.
- [x] Run ai-slop-linter on README; fix findings.
- [x] Commit: `docs: 0.2.0 README with disclosures, verification and the new figures`.

### Task 10: Showcase re-run

- [x] Clone langchain-ai/openwiki at `1e6d54c` into the scratchpad, run `workproof --author "Colin Francis" --sample 5`, paste the real output into the README, note the exclusions line.
- [x] Commit: `docs: showcase re-run with 0.2.0 on openwiki at 1e6d54c`.
