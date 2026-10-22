I wrote `promotion-evidence.md` in this folder. It covers three features you delivered between January and June 2025, which add up to about 320 lines of new code. Each one went in as a new module, with tests for two of them.

| Feature | Date | Lines |
|---|---|---|
| Table-of-contents extension | 14 Jan | ~90, including 30 of tests |
| LaTeX footnote renderer | 12 Mar | ~120 |
| Math plugin v2, with block-level equations | 15–17 Apr | ~111, including 36 of tests |

I left some commits out of the delivered figures. The file lists them under "not claimed" so the committee can see what was excluded and why:
- **Inline parser speed-up:** you committed it as "30% faster" on 2 April and reverted it on 4 April. There is no benchmark in the history, so I didn't count it.
- **Vendored slug library (6,000 lines):** this is third-party code, so I listed it only as offline-build infrastructure.
- **Formatter header on 37 files:** a one-line mechanical change per file, not feature work.
- **Abbreviation plugin:** committed in November 2024, before the period.
- **Priya's and Dependabot's commits:** not yours.

The history has no usage, performance or customer-impact data, so the file claims no outcomes. If you have any, such as who uses the features or tickets they closed, add them. They would strengthen the case far more than line counts.

I did not write a resume and didn't use the tailor-resume, review-resume or create-resume skills. I applied the rewrite-achievements rules (no invented metrics, plain wording) to the evidence document.

**Question for you:** the 3 February "Fix heading id collision" commit (4 lines in the table-of-contents extension) is signed as you but uses your personal Gmail address. I left it out of the main list because you gave me your work email. If it's yours, I can add it as a bug fix on the table-of-contents extension.