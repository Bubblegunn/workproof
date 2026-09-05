<p align="center"><img src="assets/wordmark.svg" width="480" alt="workproof"></p>

<p align="center">English | <a href="README.tr.md">Türkçe</a></p>

<p align="center"><em>Your best work is in private repos. Prove it anyway.</em></p>

<p align="center">
  <img src="https://img.shields.io/npm/v/workproof?style=flat-square&color=111111&label=npm" alt="npm">
  <img src="https://img.shields.io/npm/dm/workproof?style=flat-square&color=111111" alt="npm downloads">
  <img src="https://img.shields.io/github/actions/workflow/status/Bubblegunn/workproof/ci.yml?style=flat-square&color=111111&label=ci" alt="ci">
  <img src="https://img.shields.io/github/stars/Bubblegunn/workproof?style=flat-square&color=111111" alt="stars">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT">
</p>

workproof turns a git repository into a verifiable engineering report for one author,
without showing any code. You run it in the repository you cannot share. The reader gets
thirteen figures, the exact command behind each one, what each one cannot show, and a
hash that anyone can recompute offline. It is not a productivity metric: it measures what
survived and what was touched, and it prints its own limits under every number.

## 30 seconds

```
cd your-private-repo
npx workproof
```

That writes `workproof-report.md` (paste it into a résumé, a portfolio, a visa
application) and `workproof-report.json` (for tools, and for verification). This is the
real transcript of the run behind the example below, on a clone of
[langchain-ai/openwiki](https://github.com/langchain-ai/openwiki) at `1e6d54c`:

```
$ npx workproof --author "Colin Francis" --sample 5
fingerprint key 9dc900a6227a1faaaa17d774565afbf3 (keep it to compare reports or to verify the fingerprint; it is not stored)
openwiki: reading history...
openwiki: 369 commits read
openwiki: blaming files (1 in 5 sample)...
openwiki: blamed 123 of 547 files
wrote workproof-report.md and workproof-report.json in 2.7s

$ npx workproof check workproof-report.json
schema ok
hash ok 63d4fd1373b06b090086a653d52dfed234edcf35645bce3a34137a0447049355

$ npx workproof verify workproof-report.json --fingerprint-key 9dc900a6227a1faaaa17d774565afbf3
schema ok
hash ok 63d4fd1373b06b090086a653d52dfed234edcf35645bce3a34137a0447049355
openwiki: fingerprint ok
all figures reproduce
```

`check` needs the JSON and nothing else. `verify` needs the repository.

## What a report looks like

Real output for one maintainer of openwiki at `1e6d54c`, run on 5 September 2026 with
`--author "Colin Francis" --sample 5`, paths and emails hidden (the defaults). Under every
figure the full report also prints `How:` with the git command and `What this cannot show:`;
they are cut here for length.

```
## openwiki

HEAD 1e6d54cdfeec · fingerprint a1b19a27aab4a577 · identities: Colin Francis

excluded 64 bot commits and 1 generated, vendored or lock file (2.2% of lines added)

### Tenure window
2026-07-06 to 2026-09-03 (60 days)

### Share of commits in tenure
71 of 233 non-merge commits, 30.5%

### Cadence
9 active weeks of 9, 7.9 commits per active week, longest streak 9 weeks
1 of 21 release tags in tenure

### Footprint
693 files touched
16 directories with a commit share at or above the threshold (paths hidden; run with --paths)
languages by lines added: TypeScript 81.4%, JSON 9.7%, Markdown 7.1%, JavaScript 1.6%, YAML 0.2%

### Test-file changes and documents created
393 of 656 test-file changes, 59.9%
101 documents created

### Files authored
455 of 555 files alive at HEAD, 82.0% (degree of authorship)

### Major-contributor components
major contributor in 59 of 65 directories (at least 5% of commits)

### Commit size
median 166 lines, 90th percentile 9,234, 6 commits over 10,000 lines

### Co-authored commits
119 commits by others naming the author in a Co-authored-by trailer

### Absence factor
4 authors cover half the commits; the author ranks 1 of 71 by commit count

### AI-assisted commits
1 commit declares an AI tool in a trailer, 1.4% of the author's commits

### Surviving lines at HEAD
23,317 of 33,038 surviving lines, 70.6% (files 123/547, sample 1 in 5)

### Survival by cohort
2026: 23,317 lines
```

Read the first line and the two shares together. Sixty-four bot commits left the
denominator before anything was counted, which moved this person's commit share from the
24.1% an older version reported to 30.5%. They wrote 30.5% of the human commits in their
window and 70.6% of the lines that are still alive. A commit count alone would have called
them one contributor among seventy-one. That gap, in either direction, is usually the most
honest thing a report can say about someone's work.

## When someone reformatted the code

A repository-wide formatter run rewrites lines it did not write. Plain `git blame` then
credits every one of them to whoever ran the formatter. workproof reads
`.git-blame-ignore-revs` at the root by default, so those commits are skipped and the
lines keep their real author; `-w` handles whitespace-only changes on its own, so the
file matters when a formatter changed quotes, line breaks or trailing commas.

[guidance-ai/guidance](https://github.com/guidance-ai/guidance) at `21b1d90` (21 May 2026)
lists its black and ruff runs in that file. Two runs per author on 5 September 2026 with
`--sample 1`; the second passes an empty `--ignore-revs-file`, which is the only way to
turn the default off:

| author | honouring `.git-blame-ignore-revs` (default) | ignoring it |
|---|---|---|
| Harsha Nori, who ran black over the tree in April 2024 | 2,185 of 49,267 surviving lines, 4.4% | 2,476 of 49,267, 5.0% |
| Scott Lundberg, who wrote most of what black reformatted | 12,368 of 49,267, 25.1% | 12,152 of 49,267, 24.7% |

Without the file, 291 lines of other people's code would have counted for the person who
ran the formatter, 216 of them taken from one author. The report prints the file it used
in every `How:` line and under `environment.ignoreRevs` in the JSON, so two reports are
only comparable when that line matches:

```
How: `git blame --line-porcelain -w -M --ignore-revs-file .git-blame-ignore-revs HEAD -- <file> over a deterministic 1-in-1 file sample (surviving-lines 0.1.1: FNV-1a on path); generated, vendored and lock files excluded`
```

## What it measures

Every figure comes from git and nothing else. Bot commits and generated, vendored, lock and
snapshot files are removed before any of them is computed (see Gaming and bias).

| figure | what it is | what it cannot show |
|---|---|---|
| Tenure window | first to last commit by the author, or `--since/--until` | work before the first commit or after the last |
| Share of commits | non-merge commits by the author over all human non-merge commits in the window | what survived; a typo and a subsystem count the same |
| Cadence | active weeks, commits per active week, longest streak, release tags in tenure and the author's | a week with one commit and a week with forty both count as active |
| Footprint | files touched, directories at or above a commit-share threshold, languages by lines added | anything the exclusion lists miss still counts |
| Test-file changes and documents created | share of test-file changes; `.md`, `.mdx`, `.rst` files whose oldest commit is the author's | test cases, coverage, or the quality of a document |
| Files authored | files alive at HEAD where the author's degree of authorship (Avelino et al.) is at least 3.293 and above 75% of the file's maximum | coefficients fitted on other systems; first authorship outweighs later rewrites |
| Major-contributor components | directories where the author has at least 5% of the commits (Bird et al.) | commit exposure treats a typo and a subsystem alike |
| Commit size | median and 90th percentile of added plus deleted lines per commit; commits over 10,000 lines | size is not value; imports and reformats dominate the 90th percentile |
| Co-authored commits | other people's commits naming the author in a `Co-authored-by` trailer | trailers are written by the merger and can be absent or wrong |
| Absence factor | the smallest set of authors covering half the commits (CHAOSS), and the author's rank | several unmerged emails count as several people |
| AI-assisted commits | author commits whose trailers or name declare Claude, Cursor, Copilot, Codex, Gemini, ChatGPT, Aider, Devin or Windsurf | a missing trailer is not evidence of unassisted work |
| Surviving lines | share of lines alive at HEAD, one `git blame -w -M` pass over a deterministic file sample, honouring `.git-blame-ignore-revs` | merit; code deleted on purpose counts for nobody |
| Survival by cohort | the author's surviving lines by the year of the commit that last touched them | newer cohorts have had less time to die |

## How verification works

Three commands, in increasing order of what the reader needs to have.

- `workproof check report.json` needs only the file. It validates the document against
  [schema/report.schema.json](schema/report.schema.json) and recomputes the hash: sha256
  over the [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785) canonical JSON of the
  parameters and figures. An edited figure prints `hash mismatch: report says X, content
  hashes to Y` and exits 1. No git, no network.
- `workproof verify report.json` needs the repository. It runs `check`, compares the
  fingerprint (with `--fingerprint-key`; without it the comparison is skipped and says so),
  compares HEAD, then recomputes every figure and prints what differs. A report from another
  repository stops at the fingerprint. If HEAD moved since the report, it says so and shows
  which figures changed.
- `workproof attest report.json` writes `report.intoto.json`, an
  [in-toto](https://in-toto.io) v1 Statement whose subject is the report hash and whose
  predicate carries the tool version, parameters, HEAD, keyed fingerprint, git version and
  exclusion counts, and nothing else: no figures, no remote, no paths, no emails.
  `--local ~/.ssh/id_ed25519` signs it with `ssh-keygen -Y sign` in the `workproof`
  namespace and writes the detached signature plus a DSSE envelope. Anyone with your public
  key checks it with:

  ```
  ssh-keygen -Y verify -f allowed_signers -I you@example.com -n workproof \
    -s workproof-report.intoto.json.sig < workproof-report.intoto.json
  ```

  where `allowed_signers` is one line, `you@example.com ssh-ed25519 AAAA...`, and the key is
  the one GitHub serves at `https://github.com/<you>.keys`.

In the GitHub Action, `attest: "true"` signs the same statement keylessly with
[Sigstore](https://www.sigstore.dev): cosign is installed from a SHA-pinned action and
`cosign attest-blob` writes `workproof-report.sigstore.json`. A reader verifies it with:

```
cosign verify-blob-attestation workproof-report.json \
  --bundle workproof-report.sigstore.json \
  --type https://workproof.dev/attestation/v1 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/<owner>/<repo>/'
```

What that proves: this exact JSON was produced by a workflow run in that repository, at
that commit, and has not changed since. What it does not prove: that the figures are
right (run `verify` for that) or that the workflow was honest about which repository it
checked out. Two warnings before you turn it on. The Fulcio certificate names the
repository the workflow ran in, and the Rekor transparency log is public and permanent. For
private code the documented pattern is a small public repository that holds the report and
runs the attest step, so the private repository's name never reaches the log.

## Privacy

- No code content, ever. The tool reads `git log --numstat` and `git blame` and emits counts.
- No file paths by default. `--paths` adds directory names at the configured `--depth`
  (default 2), never files.
- No email addresses by default. `--emails` adds them; without it, even the `--author` you
  typed is replaced by `(email hidden)` in the stored parameters. GitHub noreply addresses
  (`<id>+<login>@users.noreply.github.com`) are never written, with or without the flag,
  because the login is in the local part.
- Non-subject names are never written. The absence-factor figure carries counts only.
- The fingerprint is `HMAC-SHA256(key, root commit + remote)` under a 16-byte key generated
  per report. The key is printed once and stored nowhere, so a public repository cannot be
  looked up from its fingerprint. Pass `--fingerprint-key` to reuse a key across reports of
  the same repository.
- The optional narrative (`--narrate`) sends the figures, and only the figures, to a model
  endpoint you choose (`WORKPROOF_API_URL`, `WORKPROOF_API_KEY`, `WORKPROOF_MODEL`;
  OpenAI-compatible or Anthropic). The paragraph is appended under "Generated narrative
  (not verified)" and is excluded from the hash.

## Options

```
workproof [options] [--repo <dir>]...
workproof check <report.json>
workproof verify <report.json> [--repo <dir>]... [--fingerprint-key <hex>]
workproof attest <report.json> [--local <ssh-key>]

--author <email|name>   identity to report on (repeatable; default: git config user.email)
--repo <dir>            repository to analyse (repeatable; several produce one combined report)
--since / --until       override the tenure window
--sample <n>            blame every n-th file (default: 1; 7 for very large repositories)
--seed <text>           salt for the blame file sample
--exclude <glob>        also drop files matching the glob (repeatable)
--no-exclusions         count bot commits and generated, vendored, lock and snapshot files
--copies                pass -C to git blame so copied lines follow their origin
--ignore-revs-file <f>  blame ignore-revs file (default: .git-blame-ignore-revs at the root)
--fingerprint-key <hex> reuse a fingerprint key so two reports of one repository match
--max-commits <n>       read only the newest n commits (escape hatch for enormous histories)
--depth <n>             directory depth for ownership (default: 2)
--paths                 include directory paths
--emails                include author emails
--narrate               append a model-written paragraph
--badge                 also write <out>.badge.json, a shields.io endpoint document
--out <basename>        output basename (default: workproof-report)
--format <mode>         write markdown, json, or both (default: both); json prints to stdout
--json                  same as --format json
```

A `.mailmap` in the repository merges an author's several addresses. Progress lines go to
stderr while history is read and files are blamed. Every git call runs with
`diff.renames=true`, `diff.algorithm=myers`, `diff.indentHeuristic=true` and
`core.autocrlf=false`, and the report records the git version, the blame flags, the
ignore-revs file and the seed, so two machines with different defaults agree, and `verify`
can tell an environment drift from an edit.

## Badge

`--badge` writes `workproof-report.badge.json` next to the report, in the
[shields.io endpoint format](https://shields.io/badges/endpoint-badge):

```json
{ "schemaVersion": 1, "label": "workproof", "message": "70.6% surviving lines · 60 days", "color": "1f3fbf" }
```

Commit it to a public repository (your portfolio, a gist) and point shields at the raw URL:

```
![workproof](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/<you>/<repo>/main/workproof-report.badge.json&style=flat-square)
```

A badge is a claim, not evidence. Keep the JSON report next to it; the report is what a
reader verifies, the badge is only how they find it.

## GitHub Action

The repository ships a composite action that runs workproof on a checkout, runs `check`,
writes the in-toto statement, puts the Markdown report in the job summary, uploads the
report files as one artifact, and posts one sticky comment on the pull request with the
headline figures. `fetch-depth: 0` is required, or the history the figures come from is
missing; `author` is required because a GitHub login does not map reliably onto commit
identities.

```yaml
name: workproof
on:
  pull_request:
permissions:
  contents: read
  pull-requests: write
  id-token: write # only for attest: "true"
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: Bubblegunn/workproof@v0
        with:
          author: ada@example.com
          sample: "1"
          attest: "false"
```

`@v0` is a moving tag the maintainer points at the newest 0.x release; pin a commit SHA if
you want the action to never change under you. Inputs reach the shell through environment
variables, never by interpolation into the script. The comment is updated in place on later
pushes (it carries a marker). The full Markdown report appears on the run's summary page,
and `workproof-report.md`, `.json`, `.intoto.json` and `.predicate.json` are uploaded as the
`workproof-report` artifact, so a report survives the workspace and can be downloaded from
the run. Set `comment: "false"` to skip the comment and keep the summary and the artifact.

## Gaming and bias

Partly gameable, and built so the gaming shows. These are the thirteen things a reader
should know before trusting a number.

1. Commit spam moves commit share and cadence, and nothing else. Surviving lines come from
   `git blame` at HEAD, so a thousand empty commits add zero surviving lines, and the two
   shares are printed side by side.
2. Vendoring a library inflates lines added. Vendored directories, lock files, snapshots,
   minified assets and generated outputs are excluded by built-in lists and by
   `linguist-generated` or `linguist-vendored` in `.gitattributes`, and the report prints how
   much was excluded. Anything the lists miss still counts; `--exclude` covers it, and the
   glob is recorded in the parameters.
3. Bot commits (`dependabot[bot]`, `renovate[bot]`, GitHub app identities) leave every
   denominator. A bot with a human-looking name is not detected; there is no heuristic.
4. A reformat commit takes every line it touched unless it is listed in
   `.git-blame-ignore-revs`. The report says which file was used, or that none was.
5. `--since`, `--until`, `--sample`, `--seed` and `--exclude` are all ways to choose a
   flattering window or sample. Every one of them is stored in the parameters and hashed.
6. Rewriting history to change authorship changes the root commit or HEAD, so the fingerprint
   and HEAD in an older report stop matching.
7. Degree of authorship uses coefficients fitted on other systems. First authorship weighs
   more than later rewrites, so a file rewritten from scratch by someone else can stay with
   its creator.
8. `Co-authored-by` trailers are written by whoever merges. They can be missing, wrong, or
   added by a squash-merge UI, and pairing without a trailer is invisible.
9. AI-assisted means a trailer or author name said so. The absence of a trailer is not
   evidence of unassisted work; blame credits the human for every line, so authorship no
   longer implies comprehension. These commits are never excluded from any other figure.
10. The absence factor counts email addresses. An author with several unmerged addresses
    counts as several people; add a `.mailmap`.
11. Documents created counts files whose oldest commit is the author's. A one-line README
    and a design document count the same.
12. Test-file changes are file changes matching test paths, not test cases, assertions or
    coverage.
13. The verifier runs against the same repository. A report that does not reproduce is worse
    than no report, which is the incentive the tool relies on. What no figure catches is a
    genuinely large, low-value contribution. That is what references are for.

## For candidates

Run it in each repository you are proud of and cannot show. Put the Markdown in your
portfolio next to the sentence you would have written anyway ("I built the frontend"), and
let the numbers carry the sentence. Keep the JSON and the fingerprint key; the JSON is what
a reviewer verifies.

## For hiring managers

Ask for the JSON. `npx workproof check` tells you in a second whether it was edited. Then
ask someone inside the candidate's former company to run `npx workproof verify` on it. The
table either reproduces or it does not. If the repository has moved on, the tool says which
figures changed and why that is expected.

## For visa and immigration evidence

workproof was built for a UK Global Talent application, where the strongest work was in
private repositories and "trust me" is not evidence. A report is a measurement with its
method attached, not an endorsement; pair it with letters from people who were there, and
with an attestation if the reader cannot reach the repository.

## What it does not do

It measures survivorship and activity, not quality, review, design or mentoring. It does
not rank people. It does not replace references. It is not a legal document.

## Where it comes from

The method is written up in
[How to show engineering ownership when the repositories are private](https://efe-genc-portfolio.vercel.app/writing/showing-ownership-private-repositories/).
The sampler and glob helpers are [surviving-lines](https://github.com/Bubblegunn/surviving-lines),
workproof's only dependency. Degree of authorship follows Avelino, Hora and Valente
(2016), major contributors follow Bird et al. (2011), and the absence factor is the CHAOSS
Contributor Absence Factor.

## Development

```
npm ci
npm test        # tsc build, then node:test over the compiled tests (fixture repositories built in a temp dir)
```

MIT.
