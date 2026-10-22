# Promotion evidence: Dana Reyes, January to June 2025

Project: `fx`, a Python library that converts Markdown text into HTML and other formats. It is built from a core parser plus optional plugins that add syntax (tables, footnotes, math and so on). The source is private, so this document gives sizes and plain-language descriptions only. It contains no code, file paths or other people's names.

Period covered: 1 January 2025 to 30 June 2025 (181 days). Author identity counted: Dana Reyes, work address.

## What I delivered

| # | Date | Deliverable | What it means | Size |
|---|------|-------------|---------------|------|
| 1 | 14 Jan | **Table-of-contents plugin** | Lets documents generate a navigable table of contents from their headings. | 60 lines of library code, 30 lines of tests |
| 2 | 10 Feb | **Bundled a third-party text-slug library** | Copied a well-known open-source library into the project so builds work without network access. | About 6,000 lines, none written by me. Excluded from every size figure below. |
| 3 | 12 Mar | **LaTeX footnote output** | Footnotes now render correctly when a document is exported to LaTeX, which is used for print and academic output. | 120 lines |
| 4 | 15 Apr | **Math plugin, version 2** | A new version of the math-formula plugin that handles block-level (standalone) formulas as well as inline ones. | 75 lines of library code |
| 5 | 16 Apr | **Tests for math plugin v2** | Automated tests covering the new plugin. | 36 lines |
| 6 | 6 May | **Project-wide file header** | Applied the agreed formatter header to every source file so the codebase is consistent. | 1 line in each of 38 files. Mechanical, so it counts for little in size. |

Items 4 and 5 were merged through the `feature/math-v2` branch. That merge commit was made by me and is not counted in the figures below.

### An attempt that did not ship

On 2 April I added a faster path for the inline parser, and on 4 April I reverted it. The revert is why 42 of my 42 deleted lines in this period are that file. I make no performance claim, because git cannot show speed and the change was withdrawn.

## How big, in numbers

Every figure below comes from a workproof report generated from the git history. It excludes bot commits and generated, vendored or lock files.

- **Commits:** 8 of the 12 non-merge commits recorded in the project in this window (67%). Commits measure activity, not importance.
- **Lines:** 400 added and 42 deleted, after exclusions. The median commit was 42 lines and the 90th percentile was 120, so the work is mostly small and medium changes, with no bulk dumps.
- **Code that lasted:** 411 of the 16,785 lines in the project today are mine (2.4%). That figure covers all my work in the history, including one plugin from November 2024 (54 lines), so it is not limited to this window. 357 of those lines were written in 2025. Of the 4 people who wrote code in the project, I rank 1 by surviving lines.
- **Files:** I started 6 of the 131 files in the project (4.6%) and touched 40 files in the window.
- **Tests:** I made both of the test-file changes in the window (2 of 2).
- **Cadence:** I committed in 6 of the 27 weeks, about 1.3 commits per active week. That is steady, part-time-looking activity, not constant output.
- **Language:** All my lines added were Python.
- **Shared work:** One commit by someone else names me as a co-author.

## How a reader can check this

The committee can't see the repository, but anyone who has it can recompute every figure. I ran both checks on the report that produced this document.

- `npx workproof check workproof-report.json` passed. The hash is `742729ac55bfaa38f6960bb726d0027b8918338225db80ccdb034b548af91f21`, and the file was not edited after it was written.
- `npx workproof verify workproof-report.json --repo .` passed with the fingerprint matched. All figures reproduce from the repository.

I'm keeping `workproof-report.json` and the fingerprint key (`3bf1b63b4fe5d9a89e30082ee788d033`) for anyone who needs to verify this. The report holds no source code.

## What these figures do not show

- **Quality and impact.** Git can't show quality, review, design, mentoring, users or business results. Nothing here claims any of them.
- **Honest history.** A repository whose history was rewritten before the report was made would still reproduce perfectly. Letters from colleagues who saw the work would cover what these figures can't.
- **Identities.** I counted only my work address. The report found one other address in the repository that may be mine. It is not included, so the figures may understate my work.
- **Share figures.** The commit share (activity in the window) and the surviving-lines share (what lasted, across all time) answer different questions and shouldn't be added together or compared.
- **No public link.** The repository has no remote configured, so nothing suggests it is public.
