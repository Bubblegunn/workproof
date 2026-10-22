I wrote `promotion-evidence.md` in this folder. It describes your work in plain terms, with a size table, for a reader who hasn't seen the code.

It covers these deliverables, using commits under your work email from January to June 2025:
- **Table-of-contents plugin (January):** about 90 lines, including tests.
- **LaTeX footnote export (March):** about 120 lines, the largest feature in the period.
- **Math plugin v2 (April):** 75 lines of code plus 36 lines of tests.
- **Maintenance:** a 37-file formatting header in May, and a vendored library in February for offline builds.

Total original work comes to roughly 360 lines.

Some things are left out or only mentioned in the document, so check them before you submit:
- **Excluded:**
  - The 6,000 vendored lines of the slugify library, which is third-party code.
  - The abbreviation plugin, which is dated November 2024, before your window.
- **Reverted speedup:** your "30% faster" parser change was reverted two days later, and the history gives no reason. The document says that, and it doesn't claim a performance gain. If you know why it was reverted, add it.
- **Gmail commit:** one 4-line bug fix on February 3 was committed under a personal Gmail address. I left it out of the numbers and flagged it. If it's yours, you can add it.
- **No impact data:** git can't show adoption or business impact. Add that yourself, since it will carry more weight with the committee than line counts.