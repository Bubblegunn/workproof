I've written `promotion-evidence.md` in the repo folder. It covers January to June 2025, with sizes in lines of code.

**What I counted as your work:**
- **Table-of-contents plugin:** about 90 lines including tests.
- **Heading-ID collision fix:** 4 lines.
- **LaTeX footnote renderer:** about 120 lines.
- **Math plugin v2 with block-level support:** about 111 lines including tests.
- **Total:** roughly 325 lines of code you wrote.

**Judgment calls to check:**
- **Heading-ID fix:** It was committed as `dreyes` from a gmail address, not your work email. It's signed off as Dana Reyes, so I included it and flagged it in the file. Please confirm it's yours.
- **Vendored slugify library:** This was 6,000 lines of third-party code you copied in for offline builds. I listed it as a build-reliability change and said it isn't authored code.
- **Inline-parser speed-up:** It was reverted two days later, so I didn't claim the 30% figure. The file lists it under non-feature work and notes that the repo doesn't say why it was reverted.
- **Formatter header:** It's a one-line change across 37 files. I labeled it housekeeping.
- **Excluded commits:**
  - The abbreviation plugin is dated 30 Nov 2024, outside the window.
  - Priya Nair's two commits aren't yours.
  - The dependabot commit isn't yours.

Git history shows what was committed, not its impact. You'll want to add usage, customer or review evidence from your own records.