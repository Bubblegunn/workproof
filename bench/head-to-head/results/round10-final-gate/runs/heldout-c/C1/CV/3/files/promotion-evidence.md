# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of a private Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats). Figures are from commits authored under dana.reyes@acme-corp.example. "Lines" means lines of code added; they show rough scale, not quality or difficulty.

## Summary

In six months I shipped four new features for the library, each as an optional plugin. They covered document navigation, academic/scientific output, and math. I also did one build-reliability task and one performance experiment that I rolled back. About 440 lines of new feature and test code, across 5 feature commits.

## Delivered features

| Date | What | Size | Why it matters |
|---|---|---|---|
| 14 Jan 2025 | **Table-of-contents plugin**, with tests | ~60 lines of code + 30 lines of tests | Lets documents generate a navigable table of contents from their headings. |
| 12 Mar 2025 | **Footnote output for LaTeX** | ~120 lines (one new module) | Footnotes now carry through when documents are converted to LaTeX, the format used for academic papers and print. Previously this output format lacked that support. |
| 15–17 Apr 2025 | **Math plugin v2 with block-level support**, with tests, developed on a feature branch and merged | ~75 lines of code + 36 lines of tests | A second-generation math plugin that handles standalone (block-level) equations as well as inline ones. I wrote the tests and merged the branch myself. |
| Landed 9 May 2025 | **Abbreviation plugin** | ~54 lines | Adds support for abbreviation definitions. See the note on dates below. |

## Reliability and maintenance

- **Offline builds (10 Feb 2025):** I vendored (copied in) a pinned version, 8.0.4, of the third-party `python-slugify` library, so the project can be built without network access. This was about 6,000 lines, but all of it is third-party code, so it shows no feature-writing effort. The value is in build reproducibility.
- **Codebase-wide formatting header (6 May 2025):** I added a standard formatter header to all 37 source files in one commit. It was a one-line change per file, so it was broad but not large.

## Performance experiment (rolled back)

On 2 Apr 2025 I added a faster path for the inline parser, with a commit message claiming it was 30% faster. I reverted it on 4 Apr 2025. I can't tell from the history why it was reverted, and the history has no benchmark data behind the 30% figure. I'm **not** counting this as a delivered result.

## Caveats

- **Abbreviation plugin dates:** The commit was authored on 30 Nov 2024 and only committed to the repo on 9 May 2025. The work itself predates the review period, though it landed within it. Cite it as "landed May 2025" or drop it.
- **Size is approximate.** It comes from line counts alone. The history has no ticket links, review comments, usage data or user numbers, so I haven't claimed any impact beyond what the commits show.
- **Others' follow-up work:** A colleague, Priya Nair, later made small changes to code I wrote (a refactor of the footnote renderer on 20 Mar 2025 and a 4-line tweak to the abbreviation plugin on 2 Jun 2025). I haven't counted these as mine.
