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

Maintainers only.

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit, then `git tag vX.Y.Z && git push origin main --tags`.
3. The `release` workflow runs the tests and publishes to npm with provenance (`npm publish --provenance`), so every published tarball is linked to the exact commit and workflow run that built it.

The workflow uses npm trusted publishing and holds no token. Before the first tagged release, the maintainer configures the trusted publisher on npmjs.com: package settings, Trusted publishing, GitHub Actions, repository `Bubblegunn/workproof`, workflow `release.yml`.
