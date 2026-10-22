I've written `promotion-evidence.md` in the repo folder. I just fixed some miscounted totals in it and I'm done editing.

It covers four features you shipped between January and June 2025:
- **Table-of-contents plugin:** about 60 lines plus 30 lines of tests.
- **LaTeX footnote renderer:** about 120 lines.
- **Math plugin v2:** about 75 lines plus 36 lines of tests, merged on 17 April.
- **Abbreviation plugin:** about 54 lines.

Across all four that comes to roughly 375 hand-written lines, 66 of them tests. Only the table-of-contents and math v2 features have tests from you in this period.

It also covers the repo-wide formatter header you applied to 37 files on 6 May. That change is consistent but small, one line per file.

Things to check before you submit it:
- **Abbreviation plugin date:** it was authored in November 2024 but only committed on 9 May 2025. I counted it by commit date, and the file says so.
- **Vendored library:** the 6,000-line `python-slugify` commit is third-party code you imported. I listed it as build-reliability work, not as code you wrote.
- **Reverted speed-up:** the "30% faster" inline parser change was reverted two days later. There's no benchmark or reason in the history, so I left it out of the headline items.
- **Possible missing commit:** there's a 4-line bug fix to the table-of-contents plugin under `dreyes <dana.reyes@gmail.example>`. It isn't your work email, so I excluded it. If it's yours, add it.
- **Priya Nair's commits:** she made two small follow-up commits on your footnote and abbreviation work. I didn't count them as yours.

Git history can't show design decisions, reviews, mentoring or how much the features were used. You'll need to add those from your own records.