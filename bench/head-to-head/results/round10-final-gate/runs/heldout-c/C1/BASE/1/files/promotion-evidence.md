# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of a private Markdown-processing library (Python). Code can't be shared, so this describes the work in plain terms. All figures are from commit metadata, and every commit below can be checked by hash if the committee has repo access.

The library converts Markdown text into other formats (HTML, LaTeX). Most features are added as self-contained "plugins".

## Summary

In this period I delivered **four new user-facing features** and **one build-reliability change**. They total about **375 lines of new original code (309 feature code, 66 test code)**, across 7 commits. I also made one repo-wide consistency change touching 37 files.

## Delivered

### 1. Table-of-contents plugin (14 Jan 2025, `5a7d251`)
- Automatically builds a table of contents from a document's headings.
- About 90 lines: 60 of feature code and 30 of tests. It shipped with tests.

### 2. LaTeX footnote output (12 Mar 2025, `1c99ade`)
- Lets documents with footnotes be converted to LaTeX, which is used for print and academic output. Footnotes previously had no LaTeX rendering.
- About 120 lines. This was the largest single feature of the half.

### 3. Math plugin v2 with block-level support (15 to 17 Apr 2025, `16445b4`, `344cbab`, merge `f5fadcb`)
- A new version of math-formula support that also handles standalone formula blocks, not just formulas inside a sentence.
- Built on a feature branch with 75 lines of feature code and 36 lines of tests, then merged. The tests were written as a separate step before merging.

### 4. Abbreviation plugin (landed 9 May 2025, `1c24588`)
- Lets authors define abbreviations once and have them expanded or annotated wherever they appear.
- 54 lines.
- The commit was originally written on 30 Nov 2024 and only landed in the repo on 9 May 2025. The development work falls before this window and the delivery falls inside it. Drop this item if the committee counts by authoring date.

### 5. Offline-build support (10 Feb 2025, `20d87ad`)
- Bundled a specific, pinned version (8.0.4) of a third-party text-slug library into the repo so the project can build without network access.
- The diff is about 6,000 lines, but **it is copied third-party code and I'm not counting it as my output.** The value is a reproducible build that doesn't depend on an external package server at build time.

## Other activity (smaller, for completeness)

- **Formatter header across the codebase (6 May 2025, `c56cf77`).** I added a one-line marker to all 37 source files. It was mechanical and touched many files but is not substantive engineering. I list it only so nobody is surprised by the "37 files" figure.
- **Parser speed-up, tried and reverted (2 and 4 Apr 2025, `a601d34`, `b13daae`).** I implemented an optimization to the inline text parser, labelled as about 30% faster. I then reverted it two days later. **It did not ship, so I'm not claiming a performance win.** The history doesn't record why it was reverted, so add the reason yourself if you want to cite it. Being able to back out a change quickly is worth mentioning, but only if the reason supports it.

## Size at a glance

| Item | Approx. lines | Tests included |
|---|---|---|
| Table-of-contents plugin | 90 | Yes (30) |
| LaTeX footnote output | 120 | No separate tests in the history |
| Math plugin v2 | 111 | Yes (36) |
| Abbreviation plugin | 54 | No separate tests in the history |
| **Total original code** | **375** | **66 test lines** |

Excluded from the total: 6,000 lines of vendored third-party code, the 37-line header change, and the reverted 42-line optimization.

## Caveats for the committee

- Line counts show scale, not quality or impact. They are rough proxies. I'd pair them with anything outside git, such as user feedback, adoption, or review comments.
- This covers only commits under my work email (dana.reyes@acme-corp.example). The history also has a commit under a different identity, `dreyes <dana.reyes@gmail.example>` (3 Feb 2025, `0fd9e13`, a 4-line fix for heading ID collisions in the table-of-contents plugin). **I left it out because I can't confirm from git that it's mine.** If it is yours, it's a small bug fix on feature #1 and you can add it.
- Colleague Priya Nair made two follow-up commits on my work (a refactor of the footnote renderer on 20 Mar, and a small tweak to the abbreviation output on 2 Jun). Those are hers and are not counted here. They do show that others built on my features.
