# Promotion Evidence: Dana Reyes, January–June 2025

Source: git history of the (private) Markdown-parsing library repository, filtered to commits authored with dana.reyes@acme-corp.example between 2025-01-01 and 2025-06-30. The library converts Markdown text into HTML or LaTeX, and is extended through small "plugins". Size figures are lines of code added, a rough proxy only.

## Summary

In six months I shipped four new plugins or renderers, plus tests for two of them. That is about 375 lines of new feature code and about 65 lines of tests, in 9 substantive commits. I also tried a performance optimization and reverted it when it didn't hold up. All new features were additive: they extend what the library can produce without changing existing behavior.

## What I delivered

| When | Deliverable | What it does for users | Size |
|---|---|---|---|
| Jan 2025 | **Table-of-contents plugin** | Automatically builds a table of contents from a document's headings. Shipped with its own tests. | ~60 lines + ~30 lines of tests |
| Mar 2025 | **LaTeX footnote renderer** | Lets documents with footnotes be exported to LaTeX (for print and academic-style output), not just HTML. | ~120 lines (the largest single feature) |
| Apr 2025 | **Math plugin v2 (block-level support)** | Second version of math-formula support. It adds standalone, block-level formulas instead of inline-only. Developed on a feature branch, with a dedicated test file, then merged. | ~75 lines + ~36 lines of tests |
| Nov 2024 (authored) / May 2025 (landed) | **Abbreviation plugin** | Supports abbreviation definitions in documents, so terms are expanded or annotated automatically. | ~54 lines |

Note: the abbreviation plugin was written in Nov 2024 and only landed on the main branch in May 2025, so it is dated outside the window by author date. Include it or drop it as you prefer.

## Quality and judgment

- **Tested my work:** the table-of-contents and math v2 features each shipped with a dedicated test file (about 66 lines of tests in total).
- **Measured, then backed out an optimization:** in early April I added an inline-parser speedup (commit titled "30% faster") and reverted it two days later. I don't have the reason from the history. If it was a correctness or stability concern, that is a positive point about catching a regression quickly. Fill in the real reason before using it.
- **Offline build support:** in Feb 2025 I vendored a third-party slugging library (python-slugify 8.0.4) so the project can be built without network access. This was a build-reliability change, not new code. The ~6,000 lines are third-party code and should not count as my output.
- **Codebase-wide housekeeping:** in May 2025 I applied the standard formatter header across all 37 source files. It is a one-line change per file and mostly mechanical, but it did touch the whole codebase.

## Collaboration

Teammate Priya Nair made small follow-up changes on two of my features (a 5-line footnote renderer refactor and a 4-line abbreviation output tweak). That suggests the code was readable enough for others to build on.

## Caveats

- Lines of code measure volume, not impact. I have no usage, adoption, or customer data from git. Add those numbers, such as users, tickets closed, or build-time savings, if you have them.
- One bug fix in Feb 2025 (4 lines, fixing a heading ID collision in the table-of-contents plugin) was committed under a different identity (`dreyes`, a personal email), so I left it out of the totals above. If it's yours, it fits as a bug fix on your own feature.
- The history shows no code reviews, design documents, mentoring, or on-call work. Add those from other sources.
