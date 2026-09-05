<p align="center"><img src="assets/wordmark.svg" width="480" alt="workproof"></p>

<p align="center">English | <a href="README.tr.md">Türkçe</a></p>

<p align="center"><em>Your best work is in private repos. Prove it anyway.</em></p>

<p align="center">
  <img src="https://img.shields.io/npm/v/workproof?style=flat-square&color=111111&label=npm" alt="npm">
  <img src="https://img.shields.io/github/stars/Bubblegunn/workproof?style=flat-square&color=111111" alt="stars">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT">
</p>

workproof turns a git repository into a verifiable engineering report for one author,
without showing any code. You run it in the repository you cannot share. The reader
gets six figures, the exact command behind each one, what each one cannot show, and a
hash. Anyone with the same repository can rerun `verify` and see whether the numbers
reproduce.

## 30 seconds

```
cd your-private-repo
npx workproof
```

That writes `workproof-report.md` (paste it into a résumé, a portfolio, a visa application)
and `workproof-report.json` (for tools, and for verification). To check someone's report:

```
npx workproof verify workproof-report.json
```

## What a report looks like

This is real output for one maintainer of [langchain-ai/openwiki](https://github.com/langchain-ai/openwiki)
at `1e6d54c`, run on 5 September 2026 with `--author "Colin Francis" --sample 5`, paths and
emails hidden (the defaults):

```
## openwiki

HEAD 1e6d54cdfeec · fingerprint 82aa401bbba056f1 · identities: Colin Francis

### Tenure window
2026-07-06 to 2026-09-03 (60 days)

### Share of commits in tenure
71 of 295 non-merge commits, 24.1%

### Cadence
9 active weeks of 9, 7.9 commits per active week, longest streak 9 weeks
1 of 21 release tags in tenure

### Footprint
694 files touched
16 directories with a commit share at or above the threshold (paths hidden; run with --paths)
languages by lines added: TypeScript 80.4%, JSON 9.6%, Markdown 7.0%, JavaScript 1.6%, YAML 1.4%

### Tests and documentation
393 of 657 test-file changes, 59.8%
116 documents authored

### Surviving lines at HEAD
23,317 of 33,038 surviving lines, 70.6% (files 123/548, sample 1 in 5)
```

Under every figure the report prints two more lines: `How:` with the git command that
produced it, and `What this cannot show:`. The last section is `Integrity`: the report
hash and the repository fingerprint.

Read the two shares together. This person wrote 24.1% of the commits in their window and
70.6% of the lines that are still alive. A commit count would have called them a minor
contributor. That gap, in either direction, is usually the most honest thing a report can
say about someone's work.

## What it measures

All six figures come from git and nothing else.

| figure | what it is | what it cannot show |
|---|---|---|
| Tenure window | first to last commit by the author, or `--since/--until` | work before the first commit or after the last |
| Share of commits | non-merge commits by the author over all non-merge commits in the window | what survived; a typo and a subsystem count the same |
| Cadence | active weeks, commits per active week, longest streak, release tags in tenure and the author's | a week with one commit and a week with forty both count as active |
| Footprint | files touched, directories at or above a commit-share threshold, languages by lines added | generated and vendored files inflate whoever committed them |
| Tests and docs | share of test-file changes, documents authored | test cases, coverage, or the quality of a document |
| Surviving lines | share of lines alive at HEAD, `git blame -w -M` over a deterministic file sample, via [surviving-lines](https://github.com/Bubblegunn/surviving-lines) | merit; code deleted on purpose counts for nobody |

## How verification works

- The JSON carries the repository's HEAD, a **fingerprint** (sha256 of the root commit and
  the normalised remote URL, so the repository is identified without being named), the
  identity names used, the `surviving-lines` version, every parameter, and a **hash** of
  the parameters and figures.
- `workproof verify report.json` recomputes every figure in the repository you point it at
  and prints a match table. If HEAD moved since the report, it says so and shows which
  figures changed.
- A hiring manager needs two things: the report and read access to the repository (or a
  colleague inside the company who will run one command). Nothing leaves the repository.

## Privacy

- No code content, ever. The tool reads `git log --numstat` and `git blame`, and emits
  counts.
- No file paths by default. `--paths` adds directory names at the configured `--depth`
  (default 2), never files.
- No email addresses by default. `--emails` adds them; without it, even the `--author`
  you typed is replaced by `(email hidden)` in the stored parameters.
- The optional narrative (`--narrate`) sends the figures, and only the figures, to a
  model endpoint you choose (`WORKPROOF_API_URL`, `WORKPROOF_API_KEY`, `WORKPROOF_MODEL`;
  OpenAI-compatible or Anthropic). The paragraph is appended under
  "Generated narrative (not verified)" and is excluded from the hash.

## Options

```
workproof [options] [--repo <dir>]...
workproof verify <report.json> [--repo <dir>]...

--author <email|name>  identity to report on (repeatable; default: git config user.email)
--repo <dir>           repository to analyse (repeatable; several produce one combined report)
--since / --until      override the tenure window
--sample <n>           blame every n-th file (default: 1; 7 for very large repositories)
--max-commits <n>      read only the newest n commits (escape hatch for enormous histories)
--depth <n>            directory depth for ownership (default: 2)
--paths                include directory paths
--emails               include author emails
--narrate              append a model-written paragraph
--out <basename>       output basename (default: workproof-report)
--json                 print the JSON to stdout instead of writing files
```

A `.mailmap` in the repository merges an author's several addresses. Progress lines go to
stderr while history is read and files are blamed, so a long run is visibly alive; on a
history of hundreds of thousands of commits, `--max-commits` bounds the read and the report
records that it did.

## Can it be gamed?

Partly, and the report is built so the gaming shows.

- Commit spam moves commit share and cadence, and nothing else. Surviving lines come from
  `git blame` at HEAD, so a thousand empty commits add zero surviving lines, and the gap
  between the two shares is printed side by side.
- Vendoring a library inflates lines added. The languages figure and the owned-directory
  list (with `--paths`) show where those lines landed, and a reviewer sees a directory
  named `vendor` or `node_modules` owning most of them.
- Rewriting history to change authorship changes the root commit or HEAD, so the
  fingerprint and HEAD in an older report stop matching.
- The verifier runs against the same repository. A report that does not reproduce is worse
  than no report, which is the incentive the tool relies on.

What it cannot catch: a genuinely large, low-value contribution. That is what references
are for.

## For candidates

Run it in each repository you are proud of and cannot show. Put the Markdown in your
portfolio next to the sentence you would have written anyway ("I built the frontend"),
and let the numbers carry the sentence. Keep the JSON; it is what a reviewer verifies.

## For hiring managers

Ask for the JSON and for someone inside the candidate's former company to run
`npx workproof verify` on it. The table either reproduces or it does not. If the
repository has moved on, the tool says which figures changed and why that is expected.

## For visa and immigration evidence

workproof was built for a UK Global Talent application, where the strongest work was in
private repositories and "trust me" is not evidence. A report is a measurement with its
method attached, not an endorsement; pair it with letters from people who were there.

## What it does not do

It measures survivorship and activity, not quality, review, design or mentoring. It does
not rank people. It does not replace references. It is not a legal document.

## Where it comes from

The method is written up in
[How to show engineering ownership when the repositories are private](https://efe-genc-portfolio.vercel.app/writing/showing-ownership-private-repositories/).
The blame sampling is [surviving-lines](https://github.com/Bubblegunn/surviving-lines),
workproof's only dependency.

## Development

```
npm ci
npm test        # tsc build, then node:test over the compiled tests (fixture repositories built in a temp dir)
```

MIT.
