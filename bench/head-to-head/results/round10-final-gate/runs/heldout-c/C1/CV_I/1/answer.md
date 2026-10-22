I wrote `promotion-evidence.md` in the repo folder. The cv-builder skills are built for resumes, so I only used the achievement-writing rules from `rewrite-achievements`. Those rules mean no invented metrics and open questions kept separate.

Your commits for January to June 2025 come to about 260 lines of new code and 65 lines of tests across 11 commits. They cover:
- a table-of-contents plugin (14 Jan)
- a fix for duplicate heading links (3 Feb)
- a LaTeX footnote renderer, the biggest feature at 120 lines (12 Mar)
- math plugin v2 with block-level support and tests (15 to 17 Apr)

The document explains each in plain terms.

I left some things out or handled them carefully:
- **"30% faster" parser change:** you reverted it two days after committing it. The history has no benchmark or reason for the revert, so I didn't claim the 30%. If the revert was a deliberate call to protect correctness, say so in your own words.
- **Vendored python-slugify (6,000 lines):** third-party code, so I excluded it. Counting it would overstate your output.
- **Formatter header and dependabot bump:** I excluded both as mechanical or automated.
- **Abbreviation plugin:** the commit's author date is Nov 2024, though it landed in May 2025. I didn't count it, so tell me if you finished it in 2025.
- **Your Gmail commit:** the 3 Feb fix is under `dreyes` and a personal address. I included it because it's signed off by you.
- **Feature descriptions:** they come from commit messages and file names. The code in these files looks like repetitive placeholder content, so I couldn't confirm what each feature does. Check the descriptions against what you built.
- **Impact:** git can't show adoption, time saved or other real-world results. Adding those, with real numbers, would help more than line counts.

I didn't commit anything.