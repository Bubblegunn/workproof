# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of the team's Markdown-processing library (a Python library that converts Markdown text into other formats such as HTML and LaTeX). Commits are attributed by author email dana.reyes@acme-corp.example. Line counts come from the commit history and are a rough size indicator only, not a measure of value.

## Summary

Over six months I shipped three new user-facing capabilities for the library (a table-of-contents extension, LaTeX footnote output, and a second-generation math plugin with block-level support), with automated tests accompanying two of them. I also made a codebase-wide formatting change and made a sound call to roll back a performance change that did not hold up.

## Delivered

### 1. Table-of-contents extension (January 2025)
- **What it is:** An optional plugin that automatically builds a table of contents from a document's headings.
- **Size:** About 90 new lines (60 of plugin code, 30 of tests).
- **Follow-up:** In February I fixed a bug where two headings with the same text produced clashing link anchors (4-line fix).

### 2. LaTeX footnote rendering (March 2025)
- **What it is:** Support for footnotes when the library produces LaTeX output, which is used for print and academic-style documents. Before this, footnotes were not handled in that output format.
- **Size:** About 120 new lines in a new, self-contained module.

### 3. Math plugin v2 with block-level support (April 2025)
- **What it is:** A rewrite of the math-formula plugin. Block-level support means that standalone, display-style equations can be handled, not only formulas inside a sentence.
- **Size:** About 75 lines of plugin code and 36 lines of tests, developed on a feature branch and merged on 17 April.

### 4. Codebase-wide formatting header (May 2025)
- **What it is:** A standard header applied to every source file (37 files in one commit).
- **Size:** Broad in reach but mechanical: 37 lines in total. I'm listing it as housekeeping, not as a major deliverable.

## Judgment call: performance experiment, reverted
In early April I committed an inline-parser optimization that I measured at about 30% faster, then reverted it two days later. I am **not** claiming this as a delivered improvement. The revert shows I pulled back a change I wasn't confident in rather than leave it in the product. The history doesn't record why it was reverted, so add that context from memory if you cite it.

## Overall scale
Roughly 360 lines of new, hand-written feature and test code across 4 substantive commits, plus the repo-wide header change. That is modest in volume. The case for promotion rests on the breadth (three separate features, each in a different area of the library) and on the end-to-end ownership shown by features, tests, a bug fix and a revert, not on lines of code.

## Deliberately excluded
- **Vendored python-slugify 8.0.4 (Feb 2025, about 6,000 lines):** This was third-party code copied in so builds work offline. I did not write it, so it is excluded from the totals. You could mention the work of enabling offline builds separately.
- **Abbreviation extension plugin:** Committed on 30 Nov 2024, which is outside the January–June window. It also received a small output tweak from a teammate (Priya Nair) in June.
- **Colleague and bot commits:** Priya Nair's footnote-renderer refactor (March) and abbreviation tweak (June), and an automated dependency bump (March).

## Items to check before submitting
- **One commit under a different identity:** The February heading-anchor fix (`0fd9e13`) is authored as "dreyes" with a personal Gmail address, not your work email. I counted it as yours because it fixes your own TOC plugin, but please confirm.
- **Impact is not in the git history:** The history records what was built, not who used it, what it saved, or what customers or teammates said. Adding those details will make this much stronger: usage numbers, requests the features answered, reviewer feedback.
- **Test coverage:** I found tests for the TOC plugin and math v2 but none in your commits for the LaTeX footnote renderer. Don't claim it was tested unless you know it was.
