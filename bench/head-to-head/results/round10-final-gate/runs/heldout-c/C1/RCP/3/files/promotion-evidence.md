# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of the team's private Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats). Sizes are lines of code added, taken from the commits. They show rough scale only, not quality or impact.

## Summary

In six months I shipped four new user-facing capabilities for the library: a table-of-contents generator, LaTeX footnote output, a second-generation math plugin, and an abbreviation plugin. I also fixed a bug in the table-of-contents feature, made the project buildable offline, and standardised file headers across the codebase. That is roughly 400 lines of new feature code and tests, plus 6,000 lines of vendored third-party code and a 37-file mechanical change that I don't count as feature work.

## Delivered features

| Date | What it does | Size |
|---|---|---|
| 14 Jan 2025 | **Table-of-contents extension.** Automatically builds a navigable contents list from a document's headings. Shipped with its own tests. | ~90 lines (60 code, 30 test) |
| 12 Mar 2025 | **LaTeX footnote renderer.** Footnotes now come out correctly when documents are converted to LaTeX, the format used for academic and print output. Before this, footnotes were not handled in that format. | ~120 lines |
| 15–16 Apr 2025 | **Math plugin v2 with block-level support.** Rewrote the math-formula plugin so it handles standalone formula blocks as well as inline formulas, then added tests. | ~110 lines (75 code, 36 test) |
| 9 May 2025 (landed) | **Abbreviation extension.** Lets authors define abbreviations once and have them expanded wherever they appear. See the date caveat below. | ~54 lines |

## Quality and maintenance

- **Bug fix (3 Feb 2025):** fixed a heading-ID collision in the table-of-contents plugin. Two headings with the same text got the same ID, so contents links could jump to the wrong section. It was a small fix of 4 lines, found after the Jan release. See the authorship note below.
- **Offline builds (10 Feb 2025):** added a pinned copy (python-slugify 8.0.4) of a third-party text-to-URL library, so the project builds without network access. This is about 6,000 lines, but it is third-party code that I copied in, not code I wrote. It is useful for build reliability, and I'm not counting it as engineering volume.
- **Consistent file headers (6 May 2025):** applied the formatter header to all 37 source files in one pass. It is a one-line mechanical change per file, and it gives the codebase a uniform standard.
- **Collaboration:** a teammate, Priya Nair, refactored my footnote renderer on 20 Mar 2025 and credited me as co-author. She also made a small output tweak to my abbreviation plugin on 2 Jun 2025, so others were able to build on my code.

## Experiment that was rolled back

On 2 Apr 2025 I committed a change to the text parser that was meant to make it about 30% faster. I reverted it two days later (4 Apr). I'm listing it for completeness and I'm not claiming a performance gain. The history doesn't say why it was reverted.

## Caveats

- **Size is not impact.** Line counts are a rough proxy. The history doesn't show user adoption, bugs prevented, or time saved. If you have numbers such as downloads, tickets closed, or feedback from users, add them here.
- **Abbreviation plugin dates.** The commit is authored 30 Nov 2024 but was committed to the repo on 9 May 2025, which suggests it was rebased or cherry-picked. It landed in the H1 window, but the work may have started earlier. Decide how to present it.
- **Authorship of the 3 Feb bug fix.** This commit is under the name "dreyes" with a personal email address (dana.reyes@gmail.example), not your work address. It is signed off as Dana Reyes, so I've included it, but please confirm it's yours.
