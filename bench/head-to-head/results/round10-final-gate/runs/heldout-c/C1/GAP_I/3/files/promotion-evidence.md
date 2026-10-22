# Promotion Evidence: Dana Reyes, January to June 2025

Source: commit history of a private Acme repository (author email dana.reyes@acme-corp.example). The code can't be shared, so this describes the work in plain terms. Sizes are lines of code added. They show rough scale, not quality or impact.

## Context

The repository is a software library that converts Markdown (simple formatted text, like README files) into other formats such as web pages (HTML) and LaTeX, which is used for academic and print documents. It is built on an existing library, and the team adds capabilities as optional "plugins". My work in this period was adding and fixing plugins.

## What I delivered

| Date | Deliverable | Plain-language description | Rough size |
|---|---|---|---|
| Jan 2025 | Table-of-contents plugin | Lets documents get an automatically generated table of contents from their headings. Shipped with its own automated tests. | ~60 lines of feature code, ~30 lines of tests |
| Feb 2025 | Table-of-contents bug fix | Fixed a bug where two headings could end up with the same internal link ID. | ~4 lines (small, targeted fix) |
| Mar 2025 | LaTeX footnote output | Lets documents with footnotes convert correctly to LaTeX. It is a new self-contained component. | ~120 lines |
| Apr 2025 | Math plugin v2 | Second version of the math-formula support, adding formulas that sit on their own line (block-level) as well as inline. Developed on a feature branch and merged after review. | ~75 lines of feature code |
| Apr 2025 | Tests for math plugin v2 | Automated tests covering the new math behavior, added before merging. | ~36 lines |
| May 2025 | Codebase-wide formatting marker | Added a one-line formatter marker to all 37 source files. It was mechanical and consistent across the project. | 37 files, 1 line each |

**Total new, hand-written work in the period:** about 325 lines across 4 new components or features and 1 bug fix, and about 66 lines of those are automated tests. That is modest in raw size. It's a steady stream of small, self-contained features that each shipped with tests or a clear fix.

## Items that need your call

I left these out of the totals above because the history doesn't settle them.

- **Abbreviation plugin (~54 lines):** Authored Nov 30, 2024 but committed on May 9, 2025, so it was probably rebased or cherry-picked. It falls in the window only by commit date. A teammate (Priya Nair) later made a 4-line tweak to it. Count it only if you did the work and it landed in this period.
- **Heading-collision fix, Feb 3:** The commit is under a personal email (dana.reyes@gmail.example) and signed off as Dana Reyes. It is included above on the assumption that it's yours. Confirm that.
- **Performance work, Apr 2–4:** I added a faster path for text parsing, labeled "30% faster", and reverted it two days later. Nothing in the history measures the speedup, and the change is not in the product. I did not list it as a delivery, and I would not cite the 30% figure. If you can say why it was reverted, such as a correctness problem you caught, that could be framed honestly as risk management. Only use it if you have the benchmark or the story to back it up.

## Deliberately excluded

- **Vendored third-party library (Feb 2025, ~6,000 lines):** I bundled a copy of an existing open-source text library so builds can run offline. The ~6,000 lines are someone else's code. The work was packaging, not authoring, so I'm not counting it as output.
- **Others' commits:** Priya Nair's footnote refactor (Mar 20) and abbreviation tweak (Jun 2), and an automated dependency bump from a bot. The footnote refactor changed code I wrote, but the change was hers.

## What the history cannot show

The commit history shows what was built and how much. It does not show who used it, how much time it saved, or whether anyone asked for it. For the committee, consider adding from your own knowledge:

- Which teams or customers use these plugins, and any adoption numbers.
- The problem each one solved, such as a request from a team or a customer need.
- Review feedback, design decisions, or mentoring that left no mark in the code.

I can't support any of these from the repository, so I haven't stated them.
