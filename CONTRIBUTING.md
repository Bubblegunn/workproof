# Contributing

workproof turns a private git repository into a verifiable engineering report for one author, without showing any code. Contributions are welcome, and small ones are the easiest to merge.

## Running the tests

```
npm ci
npm test        # tsc build, then node:test over the compiled tests (fixture repositories built in a temp dir)
```

Node 20 or newer and git are required. Note that Node 20's test runner does not expand glob patterns, so test files are named explicitly in `package.json`.

## Adding to the tool

To add a figure: create `src/figures/<name>.ts` exporting a function that returns a `Figure<T>` (`id`, `title`, `value`, `command`, `limits`), call it from `analyseRepo` in `src/analyse.ts`, render it in `figureLines` in `src/report.ts`, and add a test in `test/figures.test.ts` against the fixture repository. Every figure must carry the git command that produced it and what it cannot show.

## Pull requests

- One change per pull request, with a test that fails before and passes after.
- Say in the description what a user sees differently; the template asks for it.
- Keep the package dependency-free unless the issue discussing the dependency was accepted first.
- No em dashes in shipped text (README, help, output). Plain sentences.
- Contributors are credited in the changelog entry for the release that ships their change.

## Releasing

Maintainers only. One command; the workflow does the rest.

1. Write the `## X.Y.Z (unreleased)` entry in `CHANGELOG.md` and merge it.
2. On a clean, green `main`: `npm run release -- X.Y.Z` (or `patch`, `minor`, `major`; add `--dry-run` to see the plan). It dates the entry, sets the version in `package.json`, `CITATION.cff` and the `version` input default in `action.yml`, runs the tests, commits, tags `vX.Y.Z`, pushes, and moves the `v0` tag that `uses: Bubblegunn/workproof@v0` resolves to (a major tag follows the newest release of that major; the workflow cannot move it because release tags are admin-only).
3. Watch the `release` workflow: it publishes to npm with provenance, creates the GitHub release from the CHANGELOG entry, and installs the published version from the registry on three operating systems.

CI runs `scripts/release-gate.mjs` on every push: the version must agree across those files and `npm pack` may ship only the paths in `scripts/pack-allowlist.txt` (regenerate with `node scripts/release-gate.mjs --update` when the package layout changes on purpose).

The workflow uses npm trusted publishing and holds no token. Before the first tagged release the maintainer configures the trusted publisher on npmjs.com: package settings, Trusted publishing, GitHub Actions, repository `Bubblegunn/workproof`, workflow `release.yml`, "Allow npm publish" ticked.
