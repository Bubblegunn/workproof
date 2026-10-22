I wrote `promotion-evidence.md` from the git history. It covers three delivered features, a bug fix, and the other commits that need explaining.

**Delivered features**
- **Table-of-contents extension (Jan):** about 90 lines, including tests.
- **LaTeX footnote rendering (Mar):** about 120 lines.
- **Math plugin v2 with block-level equations (Apr):** about 110 lines, including tests. It was built on a feature branch and merged.

**Bug fix:** a 4-line fix for heading ID collisions in the table-of-contents extension (Feb).

**Judgment calls to check**
- **The "30% faster" parser change:** it was reverted two days later, and I found no benchmark data. The document does not claim a speedup. It describes the change as a tried-and-rolled-back optimization, so don't present it as a win.
- **The 6,000-line vendored library (Feb):** I listed it separately as build-reliability work. It is copied third-party code, so it isn't counted as feature work.
- **The formatter header commit (May):** it touched 37 files but added one line to each. I listed it separately, as mechanical standardization.
- **The abbreviation plugin:** its author date is Nov 2024 and it only landed in May 2025. I left it out of the main list and flagged it. Move it in if you consider it 2025 work.
- **The Feb bug fix's author address:** the commit is under `dana.reyes@gmail.example`, not your work address. It has a "Signed-off-by: Dana Reyes" line, so I counted it as yours. Please confirm.

Priya Nair's small refactor of your footnote code is mentioned as a sign others built on it. The size figures are lines of code, which is only a rough proxy for effort. Git can't show who used these features or what review feedback you got, so adding that would strengthen the case.