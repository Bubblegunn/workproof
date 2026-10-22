# Promotion Evidence: Dana Reyes, January – June 2025

**Project:** Acme's Markdown-processing library (Python). It converts Markdown text into HTML, LaTeX and other formats. It has a core parser and a set of optional plugins that add features.

**Source:** Acme's private git history, filtered to commits authored by Dana Reyes between 1 Jan and 30 Jun 2025. Sizes are approximate lines of code added.

## Summary

Over six months Dana added four new user-facing capabilities, each shipped as a self-contained plugin or renderer. Dana also shipped an offline-build fix, a bug fix, and a codebase-wide consistency change. Together this is about 450 lines of hand-written code across 8 pieces of work.

## Delivered features

| Date | What was delivered | Approx. size | Why it matters |
|---|---|---|---|
| 14 Jan | **Table-of-contents extension.** It builds a table of contents automatically from a document's headings. | ~90 lines | Lets documents get navigation without manual maintenance. |
| 12 Mar | **LaTeX footnote renderer.** It outputs footnotes correctly when documents are converted to LaTeX, for print and academic-style output. | ~120 lines | Opens up a new output format for footnoted documents. |
| 15–17 Apr | **Math plugin v2 with block-level support**, plus a dedicated test file. The earlier plugin handled only inline formulas; v2 also handles standalone display equations. The branch was reviewed and merged on 17 Apr. | ~75 lines of feature code and ~36 lines of tests | Extends math support from inline formulas to standalone equations, with automated tests guarding it. |
| 9 May | **Abbreviation extension plugin.** It handles abbreviation definitions such as "HTML = HyperText Markup Language". | ~54 lines | Adds another Markdown feature. The code was first written in Nov 2024 and landed in the main history on 9 May 2025. |

## Infrastructure and maintenance

- **Offline builds (10 Feb).** Dana bundled a pinned copy of a third-party text-slug library (python-slugify 8.0.4) into the repository so the project can be built without network access. The ~6,000 lines are third-party code copied in, not written by Dana. The effort was in dependency selection and build setup, so don't count it as authored code.
- **Codebase-wide consistency change (6 May).** Dana applied the standard formatter header to all 37 source files in one pass. This is a mechanical change (37 lines, one per file). It matters for consistency but isn't feature work.
- **Bug fix (3 Feb).** Dana fixed a heading ID collision in the table-of-contents plugin, which could produce duplicate anchors. It is a small fix (~4 lines).

## Work not claimed

- **Parser performance experiment (2–4 Apr).** Dana added a fast path for the inline parser, which was reported as 30% faster, then reverted it two days later. The feature is not in the product, so it is not counted as a delivery. If useful, the committee could be told it was evaluated and rolled back.
- Commits by other people, including a colleague's 20 Mar footnote refactor and 2 Jun abbreviation tweak, and an automated dependency bump, are excluded.

## Caveats to check before submitting

1. **Line counts show scale, not value.** The numbers are rough indicators for readers who can't see the code. Impact statements such as users affected or time saved are not in the git history. Add those from your own knowledge if you can back them up.
2. **The 3 Feb bug fix was committed under a personal email** (`dana.reyes@gmail.example`, signed off as Dana Reyes), not the work email. It looks like yours, but I included it on that assumption. Confirm it is yours or remove it.
3. **The abbreviation plugin's original authoring date is Nov 2024.** I counted it in this period because it was committed to the main history in May 2025. If the committee is strict about dates, mention that.
