# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of Acme's private Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats, extended through small "plugins"). Sizes are lines of code added, a rough proxy only. Every item below can be checked against a commit in the repo.

## Summary

Four pieces of new functionality, one bug fix, and one build-reliability change, all within the plugin and renderer layer of the library. Roughly 325 lines of hand-written code (about 259 of product code and 66 of automated tests) across 6 substantive commits, excluding the vendored library.

## What I delivered

### 1. Table-of-contents plugin (14 Jan 2025)
- **What it does:** Lets documents automatically generate a table of contents from their headings.
- **Size:** about 60 lines of code plus 30 lines of automated tests (90 total).
- **Why it matters:** Long documents become navigable. It shipped with tests from the start.

### 2. Fix for duplicate heading IDs in the table of contents (3 Feb 2025)
- **What it does:** Fixes a bug where headings that produced the same ID could collide, which breaks links to those headings.
- **Size:** a small fix (4 lines).
- **Note:** The commit was made from my personal Git identity (dreyes, gmail address) but is signed off as Dana Reyes. Please confirm it before submitting. It is the only commit in this period under that identity.

### 3. Offline-build support via vendored slugify library (10 Feb 2025)
- **What it does:** Bundled a pinned copy of an open-source text-to-URL-slug library (python-slugify 8.0.4) into the repo so builds work without network access.
- **Size:** about 6,000 lines, but this is third-party code I copied in, not code I wrote.
- **Why it matters:** Builds no longer depend on fetching that package. Please don't count the line total as authored work.

### 4. LaTeX footnote renderer (12 Mar 2025)
- **What it does:** Adds footnote support to the LaTeX output format, so documents with footnotes can be turned into print-ready, academic-style output.
- **Size:** about 120 lines of new code, the largest single piece of original work in the period.

### 5. Math plugin v2 with block-level support (15 to 17 Apr 2025)
- **What it does:** A new version of the math plugin that handles standalone display equations (block-level), in addition to inline math.
- **Size:** about 75 lines of code plus 36 lines of tests (111 total), delivered in three steps: implementation, tests, then merged from a feature branch on 17 Apr.

## Smaller or non-feature work (listed for completeness)
- **Formatter header applied to all source files (6 May 2025):** a mechanical one-line change across 37 files for consistency. It was repo-wide housekeeping with little technical complexity.
- **Inline-parser speed-up (2 Apr 2025), reverted (4 Apr 2025):** I wrote a 42-line fast path claiming 30% faster parsing, then reverted it two days later. Net effect on the code is zero, and the repo does not record why it was reverted or any benchmark. Don't cite it as a performance win.

## Not included
- **Abbreviation extension plugin:** committed 30 Nov 2024, which is outside this window.
- **Commits by others:** the "Refactor footnote renderer" (20 Mar) and "Tweak abbr_ext output" (2 Jun) commits are by Priya Nair, and a dependency bump is by an automated bot. Neither is mine.

## Caveats for the committee
- Git history shows what was committed, not impact. It has no usage numbers, customer outcomes, review feedback or design effort, so add those from your own records.
- Line counts understate work like design, review and debugging, and overstate generated or copied code (see the vendored library).
