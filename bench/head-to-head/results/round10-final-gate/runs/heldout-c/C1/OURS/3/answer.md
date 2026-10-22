I wrote `promotion-evidence.md` in the repo folder. It covers January to June 2025.

**Addresses merged:** none. Your git config has no email set, so the tool wouldn't run on its own. I passed `dana.reyes@acme-corp.example` explicitly, and an explicit address merges nothing else. The tool did flag one other address as a possible match, because it has the same local part on a different domain. That is `dreyes <dana.reyes@gmail.example>`, with 1 commit in the whole history. I did not count it. If it's yours, tell me and I'll re-run with both addresses.

**Public repository:** the repo has no remote, so nothing suggests it's public. I didn't add a public-repository line to the document.

**Checks:** I ran `check` and `verify` on `workproof-report.json`. The file is unedited, the fingerprint matches, and all figures reproduce. I also left `workproof-report.md` and `workproof-report.json` in the folder if the committee wants them.

**Headline numbers from the report:**
- You made 8 of the 12 non-merge commits in the window (67%).
- That comes to 400 lines added and 42 deleted, after excluding generated and vendored files.
- 411 of the 16,785 lines in the project today are yours (2.4%). You rank first of 4 contributors by surviving lines.
- You were active in 6 of 27 weeks.

**Deliverables listed in the document:**
- a table-of-contents plugin
- a LaTeX footnote renderer, which is your largest authored change at 120 lines
- math plugin v2 with block-level support, plus its tests
- the vendored slugify library, about 6,000 lines of third-party code that is excluded from the totals
- the repo-wide formatter header, 37 files with 1 line each

**Things to know before you submit:**
- The "30% faster" inline parser commit was reverted two days later. I listed it as an attempt and made no speed claim. Git can't show whether the speed-up was real.
- I made no claims about users, quality, impact or seniority. Git can't show any of those.
- The history could have been rewritten before the report was made. Surviving-line share and commit share also measure different things. The document says both, and it suggests pairing it with colleague references.