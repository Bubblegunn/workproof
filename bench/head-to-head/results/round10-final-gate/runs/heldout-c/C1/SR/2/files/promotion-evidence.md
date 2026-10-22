# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of the team's Markdown-processing library (a Python library that converts Markdown text into HTML and LaTeX). The code is private, so this summarizes the work in plain terms. Commits were matched on dana.reyes@acme-corp.example. Line counts are approximate and measure code added, which is a rough proxy for size and not for impact.

## Summary

Over six months I shipped four new features for the library: a table-of-contents plugin, LaTeX footnote output, a second-generation math plugin, and an abbreviation plugin. I wrote tests for two of them. I also vendored a third-party dependency so builds work offline. In total that is roughly 400 lines of new feature code and about 65 lines of tests.

## Delivered features

| When | Deliverable | What it does for users | Size |
|---|---|---|---|
| Jan 2025 | **Table-of-contents plugin** | Automatically builds a table of contents from a document's headings. | ~60 lines of code, ~30 lines of tests |
| Feb 2025 | **Fix for a heading-ID collision in the table-of-contents plugin** | Fixes a bug where headings with the same text got the same ID, which would break links to them. | 4 lines |
| Mar 2025 | **LaTeX footnote renderer** | Lets documents with footnotes be exported to LaTeX (for papers and PDFs), not just HTML. | ~120 lines, in a new, self-contained module |
| Apr 2025 | **Math plugin v2 (block-level support)** | Extends math support from inline formulas to standalone block equations. Developed on a feature branch and merged after review. | ~75 lines of code, ~36 lines of tests |
| May 2025 (see note) | **Abbreviation plugin** | Lets authors define abbreviations once and have them marked up consistently throughout a document. | ~54 lines |

## Supporting engineering work

- **Offline-build support (Feb 2025):** I vendored python-slugify 8.0.4, a third-party library that generates URL-friendly text, into the repository so builds don't need network access. This is a copy of external code, so its roughly 6,000 lines are not my authorship and shouldn't count as output. The value is build reliability.
- **Codebase-wide formatting header (May 2025):** I added a standard formatter header to all 37 source files in one pass. It is a mechanical, one-line-per-file change and shows consistency work, not feature work.

## Things deliberately left out

- **Inline parser speed-up (April 2025):** I committed a change titled "30% faster" and reverted it two days later. The history contains no benchmark, so I'm not claiming a performance improvement. If you have benchmark data, you could cite it separately.
- **Work by colleagues:** Priya Nair's commits (a footnote renderer refactor in March and an abbreviation output tweak in June) are not mine and are not counted.

## Notes to confirm before submitting

1. **Abbreviation plugin dates:** the commit's author date is 2024-11-30, but it was committed to the repository on 2025-05-09. That suggests it was written in late 2024 and landed in May 2025 (a rebase or cherry-pick). It's within the window by landing date, but if the committee cares about when the work was done, say it was written earlier and merged in May.
2. **Possible second identity:** one commit, the heading-ID fix, is under the name "dreyes" with a personal-looking address (dana.reyes@gmail.example). I've included it on the assumption it's yours. Remove it if it isn't.
3. **Impact is not in the history.** Git shows what was delivered and how big it was, not who used it or what it achieved. Adding user counts, adoption, or feedback for these features would make the case much stronger.
