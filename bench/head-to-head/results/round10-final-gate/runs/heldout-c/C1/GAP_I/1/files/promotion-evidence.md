# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of Acme's private Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats). Figures are lines of code and tests committed. They show scale, not quality or impact.

## Summary

In six months Dana added four new capabilities to the library, about 380 lines of new code and tests in total. Each one is a self-contained add-on, a "plugin" or "renderer", that users can switch on without affecting the rest of the library.

## What was delivered

### 1. Table-of-contents plugin (Jan 2025, plus a Feb bug fix)
- **What it does:** automatically builds a table of contents from the headings in a document.
- **Size:** about 60 lines of code and 30 lines of tests, in 2 files.
- **Follow-up:** in Feb 2025 Dana fixed a bug where two headings with the same text produced clashing link anchors (4 lines). This fix was committed from a personal email address (see Notes).

### 2. LaTeX footnote support (Mar 2025)
- **What it does:** lets documents with footnotes be exported to LaTeX, the format used for academic and print-quality typesetting.
- **Size:** about 120 lines of new code in one new module.
- **Note:** a teammate, Priya Nair, later refactored it (a 6-line change). Dana wrote the original.

### 3. Math plugin v2 with block-level support (Apr 2025)
- **What it does:** a second-generation plugin for mathematical formulas. It adds support for standalone formula blocks, not just formulas inside a sentence.
- **Size:** about 75 lines of code and 36 lines of tests, 111 lines in total.
- **Process:** built on a feature branch (Apr 15 to 16), tested, and merged on Apr 17. That is two days from first commit to merge, with tests written alongside the code.

### 4. Abbreviation plugin (landed May 2025)
- **What it does:** lets authors define abbreviations once (for example, "HTML = HyperText Markup Language") and have them marked up wherever they appear.
- **Size:** about 54 lines of code.
- **Note:** the commit is dated Nov 2024, but it was added to the main history on May 9, 2025. See Notes. Priya Nair made a 4-line output tweak in June.

## Totals

| Item | Approx. lines |
|---|---|
| Table-of-contents plugin and tests | 90 |
| TOC anchor fix | 4 |
| LaTeX footnotes | 120 |
| Math v2 plugin and tests | 111 |
| Abbreviation plugin | 54 |
| **Total** | **about 380** |

Overall: 4 features shipped, about 380 lines. Three were new plugins and one was a new output renderer. About 55% of the lines are code and the rest are tests, but only the table-of-contents and math v2 features have tests in this history.

## Other work, deliberately not counted

- **Vendored python-slugify 8.0.4 (Feb 2025, about 6,000 lines):** this is a third-party library copied in so the project can build offline. It is a useful maintenance step, but Dana did not write the code, so it is left out of the sizes above.
- **Formatter header on all source files (May 2025, 1 line in each of 37 files):** a mechanical, repo-wide change. It is real housekeeping, but it adds nothing to the volume of work.
- **Inline parser speed-up (Apr 2, reverted Apr 4):** the commit message claims "30% faster". The change was reverted two days later, so it did not ship. The history has no benchmark showing the 30% figure. Do not cite it as a delivered result.
- **Merge commit (Apr 17):** counted once, under math v2, to avoid double counting.

## Notes to check before submitting

1. **Personal-email commit.** The Feb 3 TOC bug fix was committed as `dreyes <dana.reyes@gmail.example>`, not the work email. I counted it as Dana's, since it fixes Dana's own plugin. Please confirm. If it is not yours, subtract 4 lines and remove that follow-up.
2. **Abbreviation plugin date.** It was written in Nov 2024 and merged in May 2025. I included it because it landed in the window. If the committee wants work started in the window, drop it. That leaves about 326 lines.
3. **What git cannot show.** It does not show who used these features, design discussions, code reviews of others' work, or on-call or mentoring work. Adding a sentence or two on user impact (for example, which team or customer asked for each feature) would make this much stronger.
4. **Count limits.** Line counts do not measure difficulty. The rest of the repo's history is not part of this document.
