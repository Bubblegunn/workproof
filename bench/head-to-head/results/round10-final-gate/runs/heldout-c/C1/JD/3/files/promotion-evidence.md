# Promotion Evidence: Dana Reyes, January – June 2025

Source: git history of the team's private Markdown-parsing library (a Python library that converts Markdown text into HTML, LaTeX and other formats, extended through small "plugins"). Sizes are lines of code added in the commit history; they show scale, not quality or impact.

## Summary

Between January and June 2025 I delivered three new user-facing capabilities for the library: a table-of-contents plugin, a LaTeX footnote renderer, and a second-generation math plugin with block-level support. I also tested the math plugin, fixed a bug in the table-of-contents plugin, and added offline-build support for a third-party dependency. Together, the original feature work is roughly 320 lines of new code plus about 66 lines of tests.

## Delivered features

| Date | What I delivered | Size | What it means in plain terms |
|---|---|---|---|
| 14 Jan 2025 | **Table-of-contents plugin** | ~60 lines of code, ~30 lines of tests | Lets documents built with the library generate an automatic table of contents from their headings. Shipped with its own tests. |
| 12 Mar 2025 | **Footnote renderer for LaTeX output** | ~120 lines (one new module) | Footnotes in a Markdown document now come out correctly when the document is converted to LaTeX, the format used for print and academic typesetting. This was the largest single feature of the period. |
| 15–17 Apr 2025 | **Math plugin v2 with block-level support** | ~75 lines of code, ~36 lines of tests | A rewrite of the math-formula plugin. It adds support for standalone (block-level) equations, not only formulas inline in a sentence. Developed on a feature branch, tested, then merged on 17 Apr. |

## Supporting work

- **Bug fix, table-of-contents plugin (3 Feb 2025):** fixed a collision where two headings could receive the same identifier, which would break links to them. Small change (~4 lines).
- **Offline-build support (10 Feb 2025):** vendored (copied in) version 8.0.4 of the open-source `python-slugify` library so the project can build without network access. This is about 6,000 lines of third-party code that I imported, not code I wrote. The effort was in integration, not authorship.
- **Repo-wide formatting (6 May 2025):** applied the standard formatter header across all 37 source files in one commit. It is mechanical and low in complexity, but it brought the whole codebase into line with a convention.

## Experiment that did not ship

On 2 Apr 2025 I added an inline-parser fast path with a 30% speedup claim, then reverted it on 4 Apr. I don't have benchmark evidence in the repo for the 30% figure, so I'm not counting it as a delivered result. I'm listing it for completeness. If I raise it with the committee, I should describe it as an experiment, and explain why it was pulled if I can.

## Notes on how I counted

- Only commits authored under my Acme address (dana.reyes@acme-corp.example) are counted as mine. One February commit, the heading-collision fix, was authored under a personal email and username (dreyes), so I've listed it as supporting work. Confirm it's yours before submitting.
- The abbreviation plugin (`abbr_ext`) is not included. My commit is dated 30 Nov 2024, which is outside this window. Priya Nair's later "Tweak abbr_ext output" (June 2025) and her footnote-renderer refactor (March 2025) are her work. The dependency bump of `text-unidecode` was automated (Dependabot).
- Line counts come from git and don't capture design effort, review, or user impact. Adding adoption numbers, user requests, or reviewer feedback for these features would make the case stronger.
