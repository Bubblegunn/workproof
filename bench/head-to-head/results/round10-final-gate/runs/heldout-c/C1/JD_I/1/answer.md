I wrote `promotion-evidence.md` in this folder. The jd-resume-tailor skill only tailors resumes, so it declined this request. I built the document directly from the git history instead.

It lists five deliverables from January to June 2025, with plain-language descriptions and sizes:
- **Table-of-contents plugin** (14 Jan): 60 lines of code and 30 of tests.
- **Heading-link bug fix** (3 Feb): 4 lines.
- **LaTeX footnote support** (12 Mar): 120 lines.
- **Math plugin v2** (15 to 16 Apr): 75 lines of code and 36 of tests.
- **Abbreviation plugin** (9 May): 54 lines.

That adds up to about 375 lines of new code, plus the 4-line fix.

I left some commits out on purpose, and the document says so:
- **The vendored third-party library:** 6,000 lines, but not code you wrote.
- **The formatter header change:** a mechanical one-line edit across 37 files.
- **The "30% faster" parser change:** it was reverted two days later.

Please check these before submitting:
- **Abbreviation plugin date:** it was written on 30 Nov 2024 but only landed on 9 May 2025. I counted it as landed in the period, but it falls outside if the committee goes by when the work was done.
- **The 3 Feb bug fix:** it was committed under `dana.reyes@gmail.example`, not your work address. I assumed it's yours, so confirm it or delete that row.
- **Testing:** the footnote and abbreviation work has no tests in this history.
- **What git can't show:** code review, mentoring and user impact. You'll need to add those from other sources.