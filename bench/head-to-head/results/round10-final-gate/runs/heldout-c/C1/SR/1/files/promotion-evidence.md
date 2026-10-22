# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of the team's private Markdown-parsing library (a Python library that converts Markdown text into HTML, LaTeX and other formats). Sizes are lines of code added, taken from commit statistics. Line counts are only a rough proxy for effort.

## Summary

Over six months I added three new capabilities to the library and put automated tests on two of them:

1. A table-of-contents generator (January)
2. LaTeX output support for footnotes (March)
3. A second-generation math-formula plugin that handles block-level equations (April)

I also fixed a bug in the table-of-contents feature (February) and handled a failed performance experiment responsibly (April). Details are below.

## Delivered features

### 1. Table-of-contents extension (14 Jan 2025)
- **What it does:** Automatically builds a table of contents from the headings in a document.
- **Size:** about 90 lines, made up of roughly 60 lines of feature code and 30 lines of automated tests.
- **Shipped with tests:** yes.

### 2. Footnote support for LaTeX output (12 Mar 2025)
- **What it does:** Documents containing footnotes can now be converted to LaTeX, the format used for academic and print-quality documents. Before this, footnotes had no LaTeX rendering.
- **Size:** about 120 lines, the largest single feature in the period.
- **Follow-on:** A teammate (Priya Nair) later made a small 5-line refactor of this code on 20 Mar. Other people building on the feature is a sign it was usable by others.

### 3. Math plugin v2 with block-level support (15 to 17 Apr 2025)
- **What it does:** A new version of the math-formula plugin. It adds block-level (standalone, display-style) equations alongside inline ones.
- **Size:** about 75 lines of feature code plus about 36 lines of tests, around 110 lines in total.
- **Process:** Built on a separate feature branch, tested, then merged into the main line on 17 Apr (about three days from first commit to merge).

## Quality and maintenance work

### Bug fix: heading ID collision in the table-of-contents feature (3 Feb 2025)
- Fixed a case where two headings could end up with the same internal link ID. This was a fix to my own January feature, found and corrected within three weeks of release.
- Small change (4 lines).
- This commit is under a personal email address, not my work one. It carries a "Signed-off-by: Dana Reyes" line, so it is mine.

### Performance experiment, tried and rolled back (2 to 4 Apr 2025)
- I committed an optimization to the inline parser, labelled "30% faster", then reverted it two days later.
- I am **not** claiming a performance improvement. The change is not in the code today, and the history doesn't contain benchmark data to support the 30% figure.
- What I can say: I identified and tried an optimization, and removed it when it wasn't right, rather than leaving it in.

## Other commits, listed for completeness but not counted as delivered work

- **Formatter header applied to all source files (6 May 2025):** I made this change. It touched 37 files but added only one line to each, so it was mechanical standardization rather than new functionality.
- **Vendored python-slugify 8.0.4 (10 Feb 2025):** I committed about 6,000 lines of third-party code so the project can build offline. The size comes from copying someone else's library. It is a build-reliability task, not 6,000 lines of original work.
- **Abbreviation extension plugin (about 54 lines):** My name is on this commit, and the author date is 30 Nov 2024. It entered the history on 9 May 2025. I have left it out of the main list because the work was written before the period. Treat it as late-2024 work that landed in May 2025.

## Totals (Jan to Jun 2025, my commits only)

| Category | Approx. lines added |
|---|---|
| New features (table of contents, LaTeX footnotes, math v2) | ~285 |
| Tests accompanying features | ~66 (included above) |
| Bug fix | 4 |
| Mechanical or vendored changes (not counted as feature work) | ~6,040 |

Counting only the commits that added features or fixed bugs, that is 5 commits, about 290 lines and 3 shipped features, plus a merged feature branch.

## Notes on how this was compiled
- Taken from `git log` for 1 Jan to 30 Jun 2025, matching my work email (dana.reyes@acme-corp.example) and one personal-email commit with a Signed-off-by line in my name.
- Commits by teammates and by dependency bots are excluded.
- Before submitting, I'd suggest adding context that git can't show: which users or teams used these features, and any review feedback or incident follow-ups.
