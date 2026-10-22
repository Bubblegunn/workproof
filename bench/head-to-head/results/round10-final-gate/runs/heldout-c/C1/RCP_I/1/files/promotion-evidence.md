# Promotion Evidence: Dana Reyes, January – June 2025

Source: git history of the team's Markdown-processing library (a Python library that converts Markdown text into HTML and other formats). Commits authored as dana.reyes@acme-corp.example, 1 Jan – 30 Jun 2025. The code is private, so this describes the work in plain terms; commit IDs are given so the committee can have them verified internally.

## Summary

Three new features and one set of tests were delivered and remain in the product, totalling roughly 370 lines of new code and tests across 5 new files. Each added a capability that did not exist before:

| # | Delivered | When | Size | What it means |
|---|-----------|------|------|---------------|
| 1 | **Table-of-contents extension** (`5a7d251`) | Jan 14 | ~90 lines (60 code, 30 tests), 2 files | Documents can now generate an automatic table of contents from their headings. Shipped with its own tests. |
| 2 | **LaTeX footnote renderer** (`1c99ade`) | Mar 12 | ~120 lines, 1 file | Footnotes now convert correctly when output is produced for LaTeX, the format used for academic/print-quality documents. Previously unsupported. |
| 3 | **Math plugin v2 with block-level support** (`16445b4`, merged `f5fadcb`) | Apr 15–17 | ~75 lines, 1 file | A second-generation math plugin that handles full-paragraph equations, not only inline ones. Developed on a feature branch and merged. |
| 4 | **Tests for math plugin v2** (`344cbab`) | Apr 16 | ~36 lines, 1 file | Automated checks covering the new plugin. |

Counting only these four items, that is about 320 lines of new code plus tests, or ~370 including the table-of-contents tests. Lines are insertions from `git log --shortstat`, not a measure of difficulty. These are new, self-contained modules rather than edits to existing code.

## Other work in the period (smaller or mechanical)

- **Offline-build support** (`20d87ad`, Feb 10): added a bundled copy of a third-party text-slug library so builds work without network access. It is about 6,000 lines, but that is someone else's code copied in, so **it is not counted as authored output above**. The value is build reliability, not code volume.
- **Codebase-wide formatting header** (`c56cf77`, May 6): applied a standard header to all 37 source files in one commit. Mechanical and low-effort, but it touched the whole codebase.

## Things I deliberately left out

- **Inline parser speed-up** (`a601d34`, Apr 2): its title claims "30% faster", but it was reverted two days later (`b13daae`), so nothing from it is in the product. I'm not citing the 30% figure: git history gives no benchmark evidence for it, and the change was withdrawn. If a benchmark and a reason for the revert exist, that would be a reasonable story to tell in person.
- **Abbreviation extension plugin** (`1c24588`): dated 30 Nov 2024, outside the period.
- **Commits by colleagues** (Priya Nair: footnote refactor, abbreviation tweak) and an automated dependency bot are not Dana's work.
- **Heading-ID collision fix in the table-of-contents extension** (`0fd9e13`, Feb 3, 4 lines): this was committed under a personal email (dana.reyes@gmail.example, name "dreyes"), not the work email, so I couldn't attribute it from the work identity alone. It appears to be a bug fix to feature #1. If it is yours, add it as a follow-up fix after launch. Please confirm before including it.

## Caveats for the committee

- Everything here is derived from commit metadata only. Git shows what was added, not the effort, the users affected, or the business outcome.
- No usage, performance, or customer-impact figures are claimed, because none are in the history.
- The 6-month output is modest in volume (about 10 authored commits). The case is strongest if framed around *what capability each piece unlocked* and supplemented with context that git can't show.

## Suggested additions (from you)

- Who asked for the table of contents, LaTeX footnotes and block math, and who uses them (internal teams, customers, requests closed)?
- Why the parser speed-up was reverted, if it was a deliberate quality call (that can read as good judgment).
- Any code reviews, mentoring, design docs or on-call work, which don't show up in commits.
