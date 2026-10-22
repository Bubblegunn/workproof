I've written `promotion-evidence.md` in this folder, along with the workproof report files (`workproof-report.md` and `workproof-report.json`) it's built from. The repo has no git user config, so I used `--author dana.reyes@acme-corp.example` and nothing was merged. The tool found one other address that may be yours and left it out, because an explicit `--author` merges nothing else. By rule, that is the same address name on a different domain, with one commit in the history.

**Figures (1 Jan to 30 Jun 2025):**
- You made 8 of the 12 non-merge commits in the window (67%).
- You added 400 lines and deleted 42, after exclusions.
- 411 of the 16,785 lines in the project today are yours (2.4%). That figure covers all your history, not just this window.
- You started 6 of the 131 files and touched 40.

**What the work was:**
- A table-of-contents plugin.
- LaTeX footnote output.
- Math plugin v2, with its tests.
- A project-wide file header.
- A bundled third-party library, whose 6,000 lines are excluded from every size figure.

**Checks:** I ran `check` and `verify` on the report. Both passed, and the fingerprint matched. Keep `workproof-report.json` and the fingerprint key `3bf1b63b4fe5d9a89e30082ee788d033` so a reader can recompute the figures.

**Public repo:** The repo has no remote, so nothing suggests it's public. The document says so in one line.

**Limits:** History can be rewritten before a report is made, and the figures don't show quality, review, design or mentoring.

Two things you may want to change:
- **Reverted speed-up:** Your 2 April inline-parser speed-up ("30% faster") was reverted on 4 April. I listed it as an attempt that didn't ship and made no performance claim.
- **Possible second address:** If the other address (`dreyes`, a personal email) is yours, tell me. I'll re-run with both addresses passed to `--author` and update the file. I didn't assume it.