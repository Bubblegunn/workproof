# Promotion evidence: Dana Reyes, January to June 2025

Source: git history of the Acme Markdown-processing library (private repository). The library converts Markdown text into other formats such as HTML and LaTeX, and it supports optional plugins that add new syntax. Sizes are lines of code added. They show scale only, not quality or effort.

## Summary

Over six months I shipped four new features for the library. Each one adds a capability users can switch on. I also fixed one bug in my own work. In total that is about 375 lines of new code (about 240 of product code and 135 of tests) plus a 4-line fix.

## What I delivered

| Date | Deliverable | What it does for users | Size |
|---|---|---|---|
| 14 Jan | **Table-of-contents plugin** | Builds a navigable table of contents automatically from a document's headings. | 60 lines of code, 30 lines of tests |
| 3 Feb | **Fix for table-of-contents bug** | Fixed a bug where two headings with the same name got the same link target, so links jumped to the wrong section. | 4 lines |
| 12 Mar | **Footnote support for LaTeX output** | Footnotes now carry through when documents are converted to LaTeX, the format used for academic and print publishing. | 120 lines of code |
| 15 to 16 Apr | **Math plugin v2** | Adds support for standalone equation blocks, not only equations inside a sentence. Delivered with its own test suite. | 75 lines of code, 36 lines of tests |
| 9 May | **Abbreviation plugin** | Lets authors define an abbreviation once and have it expanded wherever it appears. | 54 lines of code |

## Scope and context

- **Range of work:** all four features are new, self-contained plugins or renderers. They touch different parts of the library (document structure, output formats, and math), so the work was not confined to one corner of the codebase.
- **Testing:** the table-of-contents and math v2 plugins shipped with tests. The footnote and abbreviation work in this history has no tests of its own. I'd treat that as a gap and not claim it.
- **Collaboration:** a teammate, Priya Nair, later made small follow-up changes to the footnote renderer (6 lines) and the abbreviation output. Both build on my work, and the footnote commit credits me as co-author.

## Left out on purpose

These commits appear under my name but I didn't count them as deliverables, so the committee doesn't read them as inflated:

- **Vendoring of a third-party library (6,000 lines, 10 Feb):** this copied an existing open-source package into the repository so builds work offline. It is large in line count but not code I wrote.
- **Formatter header on all source files (37 lines, 6 May):** a mechanical one-line change applied across every file.
- **Inline parser speed-up (2 Apr):** committed as "30% faster", then reverted two days later (4 Apr). Nothing shipped, and the git history doesn't show why it was reverted or whether the 30% figure was measured. I haven't claimed it.

## Caveats to check before submitting

1. **Abbreviation plugin dates:** the commit was written on 30 Nov 2024 but only landed in the repository on 9 May 2025. I counted it as landed within the period. If the committee goes by when the work was done, it falls outside the period.
2. **Bug-fix commit under a personal email:** the 3 Feb fix was committed as "dreyes" with dana.reyes@gmail.example, not your work address. I included it on the assumption that it's yours. Please confirm, or remove that row.
3. **What git can't show:** this document covers code only. Code review, design discussions, mentoring, incident response and user impact aren't visible in commit history. You'd need to add those from other sources, such as usage numbers, tickets or reviewer feedback, to make the case stronger.
