# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of a private Markdown-processing library (a Python library that converts Markdown text into HTML, LaTeX and other formats). Figures are lines of code added, taken from commits authored with dana.reyes@acme-corp.example between 2025-01-01 and 2025-06-30. Line counts show rough size only, not quality or impact.

## Summary

Over six months I shipped three new user-facing capabilities, each with a different scope, and tested two of them. I also made a data-driven call to back out a performance change. In total that is roughly 360 lines of original work, including 66 lines of tests.

## What I delivered

### 1. Table-of-contents plugin (January 2025, ~90 lines including tests)
Added an optional plugin that builds a table of contents from a document's headings. It shipped with its own tests (30 of the 90 lines). Scope: a small, self-contained new feature.

### 2. LaTeX footnote output (March 2025, ~120 lines)
Added a renderer so documents containing footnotes can be exported to LaTeX, the format used for academic and print-quality documents. This was the largest single feature in the period and extended the library to an output format that handled footnotes poorly before. A colleague (Priya Nair) later refactored this code. That was ordinary follow-on maintenance.

### 3. Math plugin v2 with block-level support (April 2025, ~111 lines including tests)
Wrote a second-generation math plugin (75 lines) that supports standalone math blocks, not only inline formulas. I added a test file (36 lines) and merged the work through a feature branch.

### 4. Performance experiment, evaluated and reverted (April 2025)
Implemented an inline-parser fast path (42 lines) with a claimed 30% speedup, then reverted it two days later. The history doesn't record why. I'm not claiming a performance gain, and I'd add the reason myself if it is relevant (for example, a correctness or regression concern found after review).

### 5. Maintenance and build work
- **Offline build support (February):** Added a vendored copy of the python-slugify 8.0.4 library so the project can be built without network access. The 6,000 lines are third-party code, so this is small effort and shouldn't be read as a large contribution. The value is build reliability.
- **Code-wide formatting header (May):** Applied a standard header to all 37 source files. The change is mechanical (37 lines).

## Size at a glance

| Item | Month | Approx. lines added |
|---|---|---|
| Table-of-contents plugin + tests | Jan | 90 |
| LaTeX footnote renderer | Mar | 120 |
| Math plugin v2 | Apr | 75 |
| Math plugin v2 tests | Apr | 36 |
| Formatting header (37 files) | May | 37 |
| **Total original work** | | **~358** |

I left out the 6,000 vendored lines and the reverted 42-line experiment.

## Notes on what is not claimed
- The abbreviation plugin (54 lines) is dated 2024-11-30, before this window. I haven't counted it. Its later output tweak was by Priya Nair.
- One heading-ID collision fix for the table-of-contents plugin (4 lines, Feb 3) was committed under a personal Gmail address (dana.reyes@gmail.example), not my work address. I haven't counted it in the figures. Confirm it is yours before citing it. It would be a small bug-fix follow-up to item 1.
- The history shows nothing about adoption, users, or business outcomes. Add those from your own knowledge (for example, who uses the LaTeX export), since they will carry more weight than line counts.
