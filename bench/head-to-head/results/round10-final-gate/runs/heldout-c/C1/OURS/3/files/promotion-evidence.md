# Promotion evidence: Dana Reyes, January to June 2025

Source: git history of a private Acme repository (`fx`, a Python text-markup library with a plugin system). Source code is not shared. Figures come from `workproof`, which prints the git command behind each figure. They are recomputable by anyone with repository access.

## Summary in plain terms

Between 1 January and 30 June 2025, Dana made 8 of the 12 non-merge commits recorded in the repository in that period (67%). After removing generated and vendored files, that is **400 lines added and 42 deleted**. The commits are small and focused: the median is 42 lines and the 90th percentile is 120. Of the 16,785 lines in the project today, 411 (2.4%) are Dana's, and 6 of 131 files were started by Dana. Four people have written code in the project; Dana ranks first by surviving lines.

## What was delivered

| Date | Work | Size | What it means |
|---|---|---|---|
| 14 Jan | Table-of-contents extension plugin | 90 lines, 2 files | New optional feature: documents can generate a table of contents. |
| 10 Feb | Vendored `python-slugify` 8.0.4 for offline builds | ~6,000 lines, 2 files (excluded from the totals as third-party code) | Lets the project build without network access. Mostly copied code, so it is not counted as authored work. |
| 12 Mar | Footnote renderer for LaTeX output | 120 lines | Footnotes now work when output is produced as LaTeX. This is the largest authored change in the period. |
| 2 Apr | Inline parser optimisation | 42 lines | Attempted speed-up. **Reverted on 4 Apr** (42 lines removed). It is not claimed as delivered; the history cannot show whether the speed-up was real. |
| 15 Apr | Math plugin v2 with block-level support | 75 lines | Extends maths support from inline expressions to standalone blocks. |
| 16 Apr | Tests for math plugin v2 | 36 lines | Tests added within a day of the feature. |
| 6 May | Source-file formatter header applied to all files | 37 files, 1 line each | Mechanical repo-wide consistency change. Wide in reach but small in effort. |

An abbreviation extension plugin (54 lines) was committed on 30 Nov 2024. It is outside this window and not counted. A merge of the math v2 feature branch (`f5fadcb`) is also not counted.

## Scale and pattern

- **Footprint:** 40 files touched, all Python. Dana was a major contributor (at least 5% of commits) in 2 of 2 directories they worked in, and held at least 50% of commits in one of them.
- **Cadence:** Active in 6 of 27 weeks, with about 1.3 commits per active week. Output was episodic, not continuous.
- **Tests:** Both test-file changes in the period were Dana's.
- **Durability:** 357 of the 411 surviving lines date from 2025. They have survived everything written since.
- **Collaboration:** One commit by someone else credits Dana as co-author.
- **AI-assisted work:** No commits declare an AI tool in a trailer. This is not evidence either way about unassisted work.

## How a reader can check this

The report is `workproof-report.json` (hash `5474ee7a…`; the first 8 characters are `5474ee7a`). I ran `npx workproof check workproof-report.json` and `npx workproof verify workproof-report.json --repo .` on it. The check confirmed the file is unedited, and verify recomputed every figure from the repository, including the fingerprint, and found them all unchanged. Any Acme engineer with repository access can repeat this.

## Limits

- Git history can be rewritten before a report is made. A passing check does not prove the history is genuine.
- These figures measure activity and surviving lines. They do not show quality, review, design, mentoring, users or business impact. Please pair this with references from colleagues.
- Commit share and surviving-line share measure different things and should not be merged into a single claim. Neither makes Dana the owner or sole author of the project.
- The figures cover only commits under `dana.reyes@acme-corp.example`. One other address in the repository (`dreyes <dana.reyes@gmail.example>`) has 1 commit and was **not counted**. If it is Dana's, the figures understate the work; it can be added with `--author`.
