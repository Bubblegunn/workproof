# Promotion evidence: Dana Reyes, January to June 2025

Source: git history of Acme's private Markdown-processing library, commits authored as dana.reyes@acme-corp.example between 2025-01-01 and 2025-06-30. The code cannot be shared, so each item below describes what was built, why it matters, and its size.

## Summary

Three new features shipped, each with automated tests or a merge review trail:

| Feature | Date | Size (new lines) |
|---|---|---|
| Table-of-contents extension | Jan 2025 | about 90 (60 feature, 30 tests) |
| LaTeX footnote output | Mar 2025 | about 120 |
| Math plugin v2 with block-level support | Apr 2025 | about 111 (75 feature, 36 tests) |

In total about 320 lines of new, hand-written code across three self-contained additions. Each was added as a new module, so none required rewriting existing behavior. One further build-infrastructure task (offline dependency vendoring) is listed separately below.

## What I delivered

### 1. Table-of-contents extension (14 Jan 2025)
- Added a plugin that builds a table of contents from a document's headings, with its own test file (about 60 lines of plugin code, about 30 lines of tests).
- Size: small, single-module feature, delivered with tests in the same commit.

### 2. Footnote rendering for LaTeX output (12 Mar 2025)
- Added a renderer that turns footnotes in Markdown documents into LaTeX output, so documents with footnotes can be converted for print and academic-style publishing.
- Size: about 120 lines, the largest single feature of the half. A teammate later made a 6-line refactor of it, which indicates it was picked up and maintained by others.

### 3. Math plugin v2 with block-level support (15 to 17 Apr 2025)
- Built a second version of the math plugin that handles standalone (block-level) equations, not only inline ones.
- Wrote a separate test file (36 lines) the following day, then merged the work through a feature branch (`feature/math-v2`) on 17 Apr.
- Size: about 111 lines including tests, delivered in three days from first commit to merge.

### 4. Offline build support (10 Feb 2025)
- Vendored a third-party slug library (python-slugify 8.0.4) into the repo so builds work without network access.
- Size: about 6,000 lines added, but this is copied third-party code, not code I wrote. I list it as an infrastructure task and do not count it toward the output figures above.

## Things deliberately not claimed

- **Inline parser speed-up (2 Apr 2025):** I committed a change labeled "30% faster" and reverted it two days later (4 Apr). The 30% figure is from the commit message only; no benchmark is in the history, and the change is not in the product. It is not counted as delivered.
- **Source formatter header (6 May 2025):** one line added to each of 37 files. This was a mechanical, repo-wide change, not feature work.
- **Abbreviation plugin:** committed 30 Nov 2024, before this period. A colleague's follow-up tweak in June 2025 is not mine.
- **Colleagues' commits and automated dependency bumps** are excluded.
- **Line counts measure size, not value.** The commits are the only data used here; no usage, performance, or customer-impact numbers are in the history, so none are claimed.

## How these figures were produced

Counts come from `git log --shortstat` filtered by author email and date range. Descriptions are based on commit messages and file names.
