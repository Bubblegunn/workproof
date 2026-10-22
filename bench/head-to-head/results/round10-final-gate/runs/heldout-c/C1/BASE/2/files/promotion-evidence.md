# Promotion Evidence: Dana Reyes, January–June 2025

**Project:** an open-source-style Markdown parsing and rendering library (Python). The repository is private, so this summary describes the work in plain terms and is drawn from the git history (commits authored under dana.reyes@acme-corp.example).

## Summary

Over six months I shipped four new user-facing capabilities (a table-of-contents feature, LaTeX footnote output, a second-generation math feature, and an abbreviations feature), with tests for the table-of-contents and math features. I also made two supporting changes: bundling a dependency so the project builds offline, and applying a consistent file header across the codebase. Roughly 400 lines of new, hand-written feature and test code, across about 8 new files.

## What I delivered

| Date | Deliverable | What it does, in plain terms | Size |
|---|---|---|---|
| Jan 14 | **Table-of-contents plugin** | Lets documents automatically generate a navigable table of contents from their headings. Shipped with its own tests. | ~90 lines (60 feature, 30 tests), 2 new files |
| Mar 12 | **LaTeX footnote renderer** | Lets footnotes in a document come out correctly when the output format is LaTeX (used for print and academic-style documents). | ~120 lines, 1 new file |
| Apr 15–17 | **Math plugin v2 with block-level support** | A new version of the math-formula feature that handles standalone, display-style equations as well as inline ones. Developed on a feature branch, tested, and merged. | ~110 lines (75 feature, 36 tests), 2 new files |
| 2025 (see note) | **Abbreviation plugin** | Lets authors define abbreviations once (e.g. "HTML") and have them marked up wherever they appear. | ~54 lines, 1 new file |

### Supporting work

- **Offline-build support (Feb 10):** bundled a third-party text-slug library (python-slugify 8.0.4) into the repository so the project can be built without network access. This is about 6,000 lines of *third-party code that I added, not code I wrote*, so I'm not counting it toward the size of my own output. The value is build reliability, not authored volume.
- **Codebase-wide formatting header (May 6):** applied a standard header to all 37 source files. This is mechanical, with one line per file. It's a consistency change, not a feature.

## Size, in context

- **Feature and test code I wrote:** about 400 lines in the four deliverables above (roughly 90 + 120 + 110 + 54 = 374 lines).
- **Tests:** two of the four features (table of contents, math v2) shipped with dedicated test files, about 66 lines in total.
- **Files touched:** 9 distinct commits' worth of work in this period; about 8 new source or test files created, plus the 37-file header change.
- Line counts are a rough proxy for scope. Each feature is a self-contained plugin or renderer that plugs into the library's existing extension mechanism.

## Things to be aware of before submitting

These are points where the git history is ambiguous or could be read against the claims, so you can decide how to present them.

1. **Abbreviation plugin date.** The commit is stamped as authored on 2024-11-30 but was committed to this repository on 2025-05-09, probably after a rebase or cherry-pick. It falls in your window by commit date but not by author date. Confirm which is accurate, or drop this row.
2. **Performance experiment not counted.** On Apr 2 I added an inline-parser speed-up (the commit message claims "30% faster"). I reverted it on Apr 4. It isn't listed as a delivery, and the 30% figure isn't claimed anywhere, because the history doesn't show it surviving. If there's a story there (e.g. you found a correctness problem and rolled back responsibly), you could add it as a sentence, but I haven't invented one.
3. **Possible additional commit.** A 4-line fix for a heading-ID collision in the table-of-contents plugin (Feb 3) is committed under the name "dreyes" with a different email (dana.reyes@gmail.example), not your work address. It may be yours, but I haven't included it. If it is, it's a small bug-fix follow-up to your own feature.
4. **Work by others excluded.** Priya Nair made small follow-up edits to your footnote renderer (Mar 20, +5/−1 lines) and the abbreviation plugin (Jun 2, +4 lines). These are not counted as your work. You could present them as evidence that others build on your code, if that's accurate.
5. **What git can't show.** This document covers volume and scope only. It says nothing about design decisions, code review, mentoring, user impact, or adoption. Those would make the case much stronger, and you'd need to add them from your own knowledge (for example, who uses the TOC feature, or what problem math v2 solved).
