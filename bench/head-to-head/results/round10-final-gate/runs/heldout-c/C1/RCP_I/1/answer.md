I wrote `promotion-evidence.md` in this folder. I built it from the git history directly, not with the `/receipts` miner, because that tool reports Claude Code session activity and you asked for repo history. Nothing was sent anywhere.

Between January and June 2025 you delivered three new features with tests:
- **Table-of-contents extension** (Jan 14): about 90 lines including tests.
- **LaTeX footnote renderer** (Mar 12): about 120 lines.
- **Math plugin v2, with block-level equations** (Apr 15–17): about 75 lines, plus about 36 lines of tests.

That is roughly 370 lines of new code and tests across five new files. The report describes each in plain terms with commit IDs, so the committee can have them verified internally.

I made some calls you should check:
- **Left out of the headline numbers:**
  - The vendored slugify library (6,000 lines) is someone else's code, so I listed it separately as build-reliability work.
  - The 37-file formatter header is mechanical, so I listed it separately too.
- **Not claimed:** the "30% faster" parser speed-up, because you reverted it two days later and git has no benchmark for it.
- **Excluded:** Priya's commits, the dependency bot, and the Nov 2024 abbreviation plugin, which falls outside the period.
- **Needs your confirmation:** a 4-line heading-ID fix in the table-of-contents extension was committed under `dana.reyes@gmail.example`, not your work email. It looks like yours, but I didn't count it.

Git can't show who used these features or what outcome they had. The last section lists a few things to add yourself, such as who requested each feature, why the speed-up was reverted, and any reviews or mentoring.