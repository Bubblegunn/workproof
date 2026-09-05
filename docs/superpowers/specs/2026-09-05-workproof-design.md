# workproof: design

Date: 2026-09-05. Status: approved in conversation, pending spec review.

## What it is

A CLI and library that turns a private git repository into a verifiable engineering report for
one author, without showing any code. `npx workproof` in a repository writes
`workproof-report.md` and `workproof-report.json`; anyone with the same repository runs
`npx workproof verify workproof-report.json` and sees whether the numbers reproduce.

Hook: "Your best work is in private repos. Prove it anyway."

## Why

Most engineers' strongest work is in repositories they cannot show. Commit counts are the number
everyone reaches for and the wrong one. Efe Genc built this method to describe his own share of
two private codebases for a UK Global Talent application; `surviving-lines` is the first piece,
published 2026-09-05. workproof is the whole report.

## What it measures

All figures come from git. Each carries the exact command, its parameters and its limits.

1. **Surviving lines.** Share of lines alive at HEAD attributed to the author, `git blame -w -M`
   over a deterministic 1-in-n file sample, via the `surviving-lines` package (the only
   dependency).
2. **Commit share in tenure.** Non-merge commits by the author against all non-merge commits
   between the author's first and last commit (the tenure window, detected automatically,
   overridable with `--since/--until`).
3. **Cadence.** Commits per active week, active weeks over tenure, longest streak of active
   weeks, release tags created during tenure and how many were the author's.
4. **Footprint.** Files touched, directories where the author's commit share is at or above a
   threshold (depth-limited, default 2), language mix by lines authored (extension map).
5. **Tests and docs.** Share of test-file changes authored (paths matching test conventions),
   markdown documents authored.
6. **Method appendix.** For each figure: command, parameters, what it cannot show.

## Integrity and privacy

- The report records HEAD sha, the repository fingerprint (sha256 of the root commit sha plus
  the normalised remote URL; the URL itself is not printed), the author identities used, the
  `surviving-lines` version, and a sha256 of the JSON body.
- `verify` recomputes everything at the recorded HEAD (or the current HEAD with a warning) and
  prints a per-figure match/mismatch table.
- No code content, ever. No file paths by default; directory aggregates only when `--paths` is
  given, and never below the configured depth. Author emails are printed only with `--emails`.

## Optional narrative

`--narrate` sends the JSON figures (never code, never paths) to an OpenAI-compatible or
Anthropic endpoint chosen by environment variables (`WORKPROOF_API_URL`, `WORKPROOF_API_KEY`,
`WORKPROOF_MODEL`) with plain `fetch`, and appends a section titled "Generated narrative (not
verified)" that restates the numbers in prose. The section is excluded from the verifiable hash.

## CLI

```
workproof [--author <email|name>]... [--repo <dir>]... [--since <date>] [--until <date>]
          [--sample <n>] [--depth <n>] [--paths] [--emails] [--narrate] [--out <basename>] [--json]
workproof verify <report.json> [--repo <dir>]
```

Multiple `--repo` values produce one combined report with a per-repository table plus totals.
Defaults: author = `git config user.email` plus `.mailmap` aliases; sample = 1 (all files) for
repositories under 5,000 files, 7 above.

## Repository layout

```
workproof/
  src/
    index.ts        library entry: analyse(), verify(), render()
    cli.ts          argument parsing, commands
    git.ts          git helpers (log, tags, numstat, mailmap identities)
    figures/*.ts    one module per figure, each returning { value, command, limits }
    report.ts       markdown and JSON rendering, hashing
    narrate.ts      optional LLM narrative via fetch
  test/             fixture repositories built in a temp dir; deterministic output; verify round trip
  README.md, LICENSE (MIT), CHANGELOG.md, .github/workflows/ci.yml (3 OS x Node 20/22/24)
  docs/superpowers/specs/  this file
```

TypeScript, Node 20+, dependency: `surviving-lines`.

## What it does not do

It measures survivorship and activity, not quality, review, design or mentoring; the report says
so. It does not rank people. It does not replace references. It is not a legal document.

## Testing

Fixture repositories with two authors, a rename, a binary, release tags and a test directory;
assertions on every figure; a verify round trip that passes on the same HEAD and reports
mismatches after an extra commit; narrative tested against a local stub server.

## Launch

Friday 11 September 2026, 14:00 UTC: Show HN, dev.to (#showdev #career), LinkedIn,
r/ExperiencedDevs and r/cscareerquestions within their self-promotion rules, newsletters.
Example report in the README: Efe's own portfolio repository, real output.
