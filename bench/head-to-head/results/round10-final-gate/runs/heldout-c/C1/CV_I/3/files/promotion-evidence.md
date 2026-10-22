# Promotion Evidence: Dana Reyes, January to June 2025

Source: git history of the private Acme repo (a Markdown parsing and rendering library), commits authored with dana.reyes@acme-corp.example from 2025-01-01 to 2025-06-30. Sizes are lines of code added. They show scale only, not value.

## Summary

In six months I shipped three new features and one test-backed rewrite of an existing one. That came to about 320 lines of reviewed feature and test code across 5 commits. Each feature has automated tests: 22 test cases across the table-of-contents and math work. I also did some supporting maintenance work, listed separately below.

## Delivered work

| Date | What I delivered | Size | In plain terms |
|---|---|---|---|
| 2025-01-14 | **Table-of-contents extension** | 60 lines of feature code + 30 lines of tests (10 test cases) | Lets documents get an automatically generated table of contents from their headings. |
| 2025-03-12 | **Footnote support for LaTeX output** | 120 lines | Lets documents with footnotes be exported to LaTeX, the format used for academic and print-quality typesetting. |
| 2025-04-15 | **Math plugin v2 with block-level support** | 75 lines | A new version of math formula support. It handles standalone formula blocks as well as formulas inside a sentence. |
| 2025-04-16 | **Tests for math plugin v2** | 36 lines (12 test cases) | Automated checks that guard the new math behavior against regressions. |

## Supporting work

- **Offline-build dependency (2025-02-10):** Vendored a third-party text-slug library (python-slugify 8.0.4), so the project can build without network access. This is a copy of other people's code, about 6,000 lines. It is a build-reliability change, not something I wrote, and it should not count toward volume.
- **Formatter header across the codebase (2025-05-06):** Added a one-line formatter marker to all 37 source files. It is mechanical and low effort, and it is listed here only because it touched every file.

## Deliberately not claimed

- **Inline parser speed-up ("30% faster", 2025-04-02):** I reverted this two days later (2025-04-04), so net impact is zero. I'm not claiming the speed-up. The repo has no benchmark result backing the 30% figure either.
- **Abbreviation extension plugin:** Committed 2024-11-30, which is outside the period.
- **Colleague commits:** Priya Nair's later edits to the footnote renderer (2025-03-20) and the abbreviation plugin (2025-06-02) are hers, not mine.

## What git can't show (add before submitting)

The history records what was built and how much code it took. It has no evidence of outcomes. For the committee, fill in, if true:

- Who asked for each feature, and why (customer request, internal team, roadmap item).
- Who uses it, or how many projects or users adopted it.
- Review feedback, incidents avoided, or time saved.
- Your role in any design decisions or mentoring that doesn't show up as commits.

## Open item

One commit in the window, "Fix heading id collision in toc_ext" (2025-02-03, 4 lines), was authored under `dreyes <dana.reyes@gmail.example>`, not your work email. It looks like yours, since it fixes a bug in your table-of-contents plugin. I left it out because you gave only the work address. If it is yours, add it as a bug fix to the table-of-contents row.
