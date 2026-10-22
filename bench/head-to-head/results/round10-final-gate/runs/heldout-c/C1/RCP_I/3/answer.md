I wrote `promotion-evidence.md` in this folder, built from the git history. I didn't run the receipts miner, because it reports on Claude Code session activity over a trailing window and your question was about commits from Jan–Jun 2025.

**What it covers:**
- **Features:** a table-of-contents extension (~90 lines including tests), LaTeX footnote output (~120 lines), and math plugin v2 with block-level equations (~110 lines including tests).
- **Smaller items:** a heading-ID bug fix, bundling a third-party library so builds work offline, and a formatting header applied to 37 files.
- **Size:** about 320 lines of new feature and test code in total.

**Choices I made that you should check:**
- **Vendored library:** the ~6,000-line commit is third-party code copied into the repo. I listed it as a build-reliability change and said not to count it as output.
- **Reverted speed-up:** the "30% faster parser" change was reverted two days later, so I left it out of the deliverables and flagged it. The history doesn't say why it was reverted, so add that context if you have it.
- **Abbreviation plugin:** its authored date is Nov 2024 (it only landed in this branch in May 2025), so I excluded it. Tell me if it shipped in the window and I'll add it.
- **Personal-email commit:** the Feb 3 bug fix is under `dana.reyes@gmail.example`. I assumed it's yours and included it, so remove it if it isn't.

Git can't show adoption or impact. The file ends with a prompt for you to add who uses these features and what problems they solved.