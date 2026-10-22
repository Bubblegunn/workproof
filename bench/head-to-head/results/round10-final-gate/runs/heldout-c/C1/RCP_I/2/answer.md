I wrote `promotion-evidence.md` in this folder. I didn't run the receipts miner. It reports Claude Code session activity over a rolling window, and you wanted a January–June 2025 account built from git history. So I used `git log` directly.

The report credits you with three features, about 320 lines across 5 files and 4 commits:
- **Table-of-contents plugin (14 Jan):** about 90 lines including tests.
- **LaTeX footnote output (12 Mar):** about 120 lines. The history shows no tests for it.
- **Math plugin v2 with block-level support (15–16 Apr):** about 110 lines including tests.

Judgment calls to check:
- **The 30% parser speedup (2 Apr):** you reverted it on 4 Apr, and nothing in the repo backs the 30% figure. I left it out of the deliveries and flagged it in the document, since a committee member could find the revert. If the benchmarks were real and you reverted it for a good reason, write that story yourself.
- **Offline-build vendoring (10 Feb):** the commit adds about 6,000 lines, but they are copied from the upstream package. I listed it as a smaller item and noted the lines aren't your own code.
- **Header standardisation (6 May):** one line in each of 37 files, a mechanical cleanup. I listed it as a smaller item, not a feature.
- **Out of range or not yours:** the abbreviation plugin is dated Nov 2024, and the later commits from Priya Nair and the dependency bot are not yours. I left all of these out.

One question for you: the 3 Feb heading-ID fix in the table-of-contents plugin was committed under `dana.reyes@gmail.example`, not your work email. I kept it out of the totals and marked it for you to confirm. If it's yours, it counts as a small bug fix on the table-of-contents feature.

Git can't show design work, reviews, usage numbers or why a feature mattered. The document says so and suggests adding that evidence yourself. I didn't estimate hours saved or business value.