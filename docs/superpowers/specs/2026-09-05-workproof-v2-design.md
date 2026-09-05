# workproof v2: verification that means something, honest denominators, new figures, attestation

Date: 2026-09-05. Status: approved in conversation. Targets 0.2.0.

## Why

Three findings from reading the 0.1.3 source against the literature drive this release.

1. `verify` never recomputes `report.hash` and never compares `fingerprint`. An edited JSON
   with a stale hash passes, and a report from another repository with the same figures would
   too. A stranger without the repository can verify nothing at all.
2. Every denominator carries noise the reader cannot see: bot commits (`dependabot[bot]`,
   `renovate[bot]`, `github-actions[bot]`) sit in commit share, test-file changes and
   directory ownership; lock files, snapshots, generated and vendored files sit in lines
   added and in blame. On vuejs/core, lock files and `*.snap` are about a third of all
   numstat churn. The README showcase shows `JSON 9.6%` for openwiki, which is mostly
   `package-lock.json` churn.
3. Two labels overclaim. `docsAuthored` counts documents touched. "Test changes" reads as
   test cases.

The fixes below keep the tool's two promises: no code leaves the repository, and every figure
names its command and its limit.

## Scope, in priority order

### 1. `check` and a `verify` that compares integrity first

- `src/canonical.ts`: RFC 8785 (JCS) serialisation with no dependency: object keys sorted by
  UTF-16 code units, numbers in ES6 shortest form (JSON.stringify already does this for
  finite numbers), strings escaped as JSON.stringify does, no whitespace. `report.hash` is
  sha256 of the JCS form of `{ params, repositories }`.
- `schema/report.schema.json`: JSON Schema draft 2020-12 for the report. The report gains
  `schemaVersion: 2`. Validation is done by a small in-repo validator (`src/schema.ts`) that
  checks required keys, types and enums for the report shape; it is not a general JSON
  Schema engine, and the schema file is published for other tools.
- `workproof check <report.json>`: offline. Validates the schema, recomputes the hash, and
  prints `hash ok` or `hash mismatch: report says X, content hashes to Y`. Exit 1 on either
  failure. No git calls.
- `workproof verify <report.json>`: runs `check` first, then compares `fingerprint` and
  `head` against the repository, then recomputes figures. A fingerprint mismatch is reported
  as "this is a different repository" and stops before figures.

### 2. Honest denominators

- Bots. A commit is a bot commit when the author name matches `/\[bot\]$/`, or the author
  email matches `/^\d+\+.*\[bot\]@users\.noreply\.github\.com$/`. The committer
  `GitHub <noreply@github.com>` is never treated as an author (it is the web-flow committer;
  authorship comes from the author fields, which the tool already reads). Bot commits are
  removed from every denominator and counted: the repository section of the report carries
  `excluded.botCommits`. No heuristic bot detection.
- Generated, vendored, lock and snapshot files. `src/exclusions.ts` ports the subset of
  linguist's `generated.rb` and `vendor.yml` that matters for line counts: lock files
  (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `Cargo.lock`,
  `poetry.lock`, `uv.lock`, `Gemfile.lock`, `composer.lock`, `Pipfile.lock`, `go.sum`,
  `packages.lock.json`, `flake.lock`, `mix.lock`, `pubspec.lock`), snapshots (`*.snap`,
  `__snapshots__/`), minified assets (`*.min.js`, `*.min.css`, `*.map`), generated
  protobuf/grpc/swagger outputs (`*.pb.go`, `*_pb2.py`, `*.pb.ts`, `*.g.dart`,
  `*.generated.*`), vendored directories (`vendor/`, `node_modules/`, `third_party/`,
  `Pods/`, `bower_components/`, `.yarn/`), and any path with `linguist-generated` or
  `linguist-vendored` set in `.gitattributes` (read with `git check-attr`). Exclusions apply
  to lines added (languages), files touched, test-file changes, documents, and to the blame
  sample. The report carries `excluded.files` and `excluded.linesAddedShare` (share of all
  lines added in the tenure window that fell in excluded files), and the Markdown prints
  "excluded N generated, vendored or lock files (M% of lines added)". `--no-exclusions`
  turns it off; the flag is recorded in params.
- `--exclude <glob>` (repeatable) and `--seed <text>` pass through to the blame sample with
  the same semantics as surviving-lines. `--copies` adds `-C` to blame.
- `.git-blame-ignore-revs` at the repository root is honoured automatically;
  `--ignore-revs-file <path>` names another. The report records which file was used.

### 3. Pinned environment

- `git --version` is recorded in the repository section as `environment.git`.
- Every git call runs with `-c diff.renames=true -c diff.algorithm=myers
  -c diff.indentHeuristic=true -c core.autocrlf=false`, so two machines with different
  defaults agree. `verify` prints the recorded and the local git version when figures
  differ.
- The sample seed and the blame flags are recorded (`environment.blame`).

### 4. Labels

- `docsAuthored` becomes `docsCreated`: Markdown, MDX and RST files whose first commit in
  the history read is by the author. Markdown says "N documents created".
- The test figure is labelled "test-file changes" in the JSON title, the Markdown, the README
  table and the Action comment.

### 5. New figures

Each figure states its bias in `limits`. Bots and excluded files are already out.

| id | value | definition | limit text (summary) |
|---|---|---|---|
| `filesAuthored` | `{ authored, total, share }` | Avelino et al. degree of authorship: `DOA = 3.293 + 1.098*FA + 0.164*DL - 0.321*ln(1 + AC)`, FA = 1 if the author made the first commit to the file, DL = the author's later non-first commits to it, AC = other people's commits. Author of a file when normalised DOA (divided by the file's maximum DOA) is above 0.75 and absolute DOA is at least 3.293. Over files alive at HEAD. | coefficients fitted on other systems; first authorship outweighs later rewrites |
| `majorContributor` | `{ major: n, dirs: n, threshold: 0.05 }` next to the existing owned list | directories (at `--depth`) where the author's commit share is at least 5% (Bird et al.) | commit exposure treats a typo and a subsystem alike |
| `commitSize` | `{ median, p90, huge }` | added + deleted lines per non-merge author commit in the window, after exclusions; `huge` counts commits over 10,000 lines | size is not value; imports and reformat commits dominate p90 |
| `survivalByCohort` | `[{ year, lines }]` | the author's surviving lines bucketed by the author-time year of the blamed commit, from the same blame pass | newer cohorts have had less time to die; comments and licence headers survive indefinitely |
| `coAuthored` | `{ trailerCommits }` | commits in the window where the author appears only in a `Co-authored-by` trailer | trailers are written by the merger and can be absent or wrong |
| `absenceFactor` | `{ authorsToHalf, authorRank, authors }` | smallest set of authors covering 50% of non-merge commits in the window (CHAOSS Contributor Absence Factor) and where the subject sits by commit count | multiple emails inflate the count; drive-by commits |
| `aiAssisted` | `{ commits, share }` | author commits carrying `Co-Authored-By` naming Claude, Cursor, Copilot, Codex, Gemini, ChatGPT, Aider, Devin or Windsurf, an `Assisted-by:` trailer, or an author name ending in `(aider)` | absence of a trailer is not evidence of unassisted work; blame credits the human for every line; authorship no longer implies comprehension; never excluded |

Trailers need commit bodies. `listCommits` adds `%(trailers:key=Co-authored-by,valueonly)` and
`%(trailers:key=Assisted-by,valueonly)` to the log format.

### 6. Privacy

- The fingerprint becomes keyed: `HMAC-SHA256(key, root + "\n" + remote)` with a 16-byte
  random key generated per report. The key is printed once to stderr and stored nowhere;
  `--fingerprint-key <hex>` reuses one so two reports of the same repository match, and
  `verify` asks for it (`--fingerprint-key`) or skips the fingerprint comparison with a
  warning. An unkeyed hash of a guessable public root SHA is a lookup table.
- Emails of the form `<id>+<login>@users.noreply.github.com` are never written, even with
  `--emails`; the login is the local part.
- Non-subject author names are never written. The absence-factor figure carries counts only.

### 7. `attest`

- `workproof attest <report.json>` writes `report.intoto.json`: an in-toto v1 Statement
  with `subject = [{ name: "workproof-report", digest: { sha256: <report.hash> } }]`,
  `predicateType = "https://workproof.dev/attestation/v1"`, predicate
  `{ fingerprint, identity.names, tool: { version }, environment, head, params,
  generatedAt }`. No remote URL, no paths.
- `--local <ssh-key>` wraps the statement in a DSSE envelope signed with
  `ssh-keygen -Y sign -n workproof` and writes `report.dsse.json`; the README shows the
  matching `ssh-keygen -Y verify` line against the signer's public GitHub key.
- The Action gains `attest: "true"`: installs cosign via SHA-pinned `sigstore/cosign-installer`
  and runs `cosign attest-blob workproof-report.json --predicate <predicate> --type <URI>
  --bundle workproof-report.sigstore.json --yes`. The README's verification section gives the
  exact `cosign verify-blob-attestation` command with issuer and identity regexp, states what
  it proves and what it does not, and warns that the Fulcio certificate names the repository
  the workflow ran in and Rekor is permanent, with the public attest-repository pattern as the
  documented default for private code.

### 8. Action and README

- `action.yml`: inputs reach the script through `env:`, never interpolated into `run:`.
  Marketplace metadata complete (`branding`, description, inputs documented). The README
  references `Bubblegunn/workproof@v0` and explains that `v0` is a moving tag the maintainer
  updates on each release (not created in this change).
- README: badge switched to surviving lines and tenure (commit share dropped from the badge),
  a "Gaming and bias" section with the thirteen disclosures, the line "not a productivity
  metric" in the first paragraph, a static transcript of run, check and verify (VHS is not
  installed; the transcript is real output), the new figures in the table, the showcase
  re-run on the same repository and commit.

## Out of scope

A hosted verifier, quality or impact scores, a compare command, ML bot detection,
verifiable-credential wrappers, time-of-day charts, and public-Sigstore attestation as the
default for private repositories.

## Testing

`node --test` over the fixture repository. New fixture content: a bot commit, a lock file,
a `.gitattributes` with `linguist-generated`, a commit with a `Co-authored-by` trailer, and
a `.git-blame-ignore-revs` reformat commit. Each figure and each exclusion has a test that
pins the number and the reason.
