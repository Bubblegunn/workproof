# Promotion evidence: Dana Reyes, January to June 2025

Source: the git history of a private Acme repository (`fx`, a Python Markdown-processing library). The repository can't be shared. This summary comes from a hashed report that contains no source code, file paths or email addresses. Figures were produced by the `workproof` tool, not counted by hand.

## What was delivered (1 Jan to 30 Jun 2025)

| Date | Delivered | Size (lines) |
|---|---|---|
| 14 Jan | Table-of-contents extension: a plugin that builds a table of contents for documents | 90 added, 2 files |
| 10 Feb | Vendored a third-party text-slug library (python-slugify 8.0.4) so builds work offline | 6,000 added, 2 files (third-party code, excluded from the totals below) |
| 12 Mar | Footnote renderer for LaTeX output, so documents with footnotes can be exported to LaTeX | 120 added |
| 2 Apr | Inline-parser speed-up (commit message claims 30% faster) | 42 added |
| 4 Apr | Reverted that speed-up | 42 deleted |
| 15 Apr | Math plugin v2 with block-level support (a major rework of how maths is handled) | 75 added |
| 16 Apr | Tests for math plugin v2 | 36 added |
| 6 May | Applied the standard formatter header to every source file (a repo-wide consistency change) | 37 files, 1 line each |

Also in the window: Dana merged the `feature/math-v2` branch. Merge commits are not counted in the figures.

## How big it was

- **Commits:** 8 of the 12 non-merge commits in the window (67%). This is the window's share, not the repository's all-time total.
- **Lines:** 400 added and 42 deleted, after removing generated and vendored files. The 42 deleted lines are the reverted speed-up, which cancels the 42 lines added on 2 April. The excluded vendored library was 6,000 more lines added and 0 deleted.
- **Typical commit:** median 42 lines, 90th percentile 120.
- **Files touched:** 40. All the code is Python. 2 of 2 test-file changes in the window were Dana's.
- **Cadence:** active in 6 of 27 weeks.
- **What lasted:** 411 of the 16,785 lines in the project today are Dana's (2.4%). 357 of those were written in 2025. 6 of the 131 files were started by Dana (4.6%). By surviving lines, Dana ranks 1 of 4 people who wrote code in the period.
- **Reach:** the plugin work covers three areas (tables of contents, math and LaTeX footnotes), and Dana also did a repo-wide formatting change.

Commits measure activity and surviving lines measure what lasted. They are separate measures and shouldn't be read as one.

## What this does not show

- The 30% speed-up is only a claim in a commit message. The change was reverted two days later, so no performance gain is claimed here.
- Git doesn't show quality, review, design, mentoring, users or business impact. Those need letters or references from colleagues.
- History can be rewritten before a report is made, so a passing check proves the figures match this history, not that the history is honest.
- The figures cover only the work email dana.reyes@acme-corp.example. No other addresses were merged. One other address in the history looks similar (same name on another domain). It was left out because I couldn't confirm it is Dana's. If it is, re-run with that address and the figures will rise.

## How a reader can check it

- Report hash: `4b3adc43b36f16b9b693c946ef679a36a0613b7865e78d3ba20c647f067bee55`
- `npx workproof check workproof-report.json` confirms the JSON wasn't edited. It ran and passed.
- `npx workproof verify workproof-report.json --repo .` recomputes every figure from the repository. It ran and reported that all figures reproduce and the repository fingerprint matched.
- Keep `workproof-report.json`, `workproof-report.md` and the fingerprint key, which is `dbc4e483271814ed67e25bf5492a40c7`. Someone with repository access can verify the figures.
