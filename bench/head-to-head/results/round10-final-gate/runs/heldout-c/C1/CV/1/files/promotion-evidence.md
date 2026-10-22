# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of Acme's private Markdown-parser library (a Python library that converts Markdown text into HTML and other formats). Commits were attributed by author email `dana.reyes@acme-corp.example`. Sizes are lines of code added, which is only a rough proxy for effort.

## Summary

In this period I shipped three user-facing features: a table-of-contents plugin, LaTeX footnote output, and a second-generation math plugin. Each feature came with automated tests, except the footnote renderer (see note below). I also made a small fix to the table-of-contents plugin and added a dependency for offline builds.

## Delivered features

### 1. Table-of-contents plugin (January 2025)
- **What it does:** It automatically builds a navigable table of contents from the headings in a document. Authors no longer maintain one by hand.
- **Size:** about 60 lines of plugin code and 30 lines of tests.
- **Follow-up:** In February I fixed a bug where two headings with the same text produced clashing link anchors (4 lines).

### 2. LaTeX footnote rendering (March 2025)
- **What it does:** Documents with footnotes can now be exported to LaTeX, the format used for academic and print-quality output. Before this, footnotes were not supported in that output format.
- **Size:** about 120 lines of new code in one self-contained module.
- **Follow-up:** A teammate (Priya Nair) later made a small 5-line refinement. No tests were added in this commit.

### 3. Math plugin v2 with block-level support (April 2025)
- **What it does:** It is a rewrite of the math plugin. It adds support for standalone equation blocks, where the original handled only equations inside a line of text.
- **Size:** about 75 lines of plugin code and 36 lines of tests. I developed it on a feature branch and merged it after the tests were written.

### 4. Offline-build support (February 2025)
- **What it does:** I vendored (bundled a copy of) the third-party `python-slugify` library, version 8.0.4, so the project can build without network access.
- **Size:** about 6,000 lines, but this is **third-party code I copied in, not code I wrote**. The value is in build reliability, not authorship.

## Total authored output (excluding items below)
About 285 lines of new feature code and tests, plus a 4-line bug fix, across 3 features. The count excludes the vendored library.

## Work deliberately excluded
These items would overstate the numbers, so I left them out:
- **Performance change (April 2025):** I added a fast-path for the inline parser, with a commit message claiming it was 30% faster. I reverted it two days later. Nothing in the history verifies the 30% figure, so I don't count it as a delivered result.
- **Formatter header (May 2025):** One line added to each of 37 files. This was mechanical and is not significant engineering work.
- **Abbreviation plugin (November 2024):** This falls outside the January to June window.

## Notes for the committee
- The numbers measure code volume, not impact. If you can add adoption figures, bug reports closed, or user feedback, they would strengthen this a lot. Git history doesn't contain them.
- One February commit (the heading-collision fix) is authored under a different identity (`dreyes`, a personal email address). I believe it is mine and included it, but please confirm before submitting.
