I wrote `promotion-evidence.md` in the repo root. Your work email matched 10 commits in January–June 2025.

- **Features:** a table-of-contents plugin (about 90 lines including tests), LaTeX footnote output (about 120), math plugin v2 with block-level equations (about 111 including tests, developed on a feature branch and merged), and an abbreviation plugin (about 54).
- **Maintenance:** vendoring `python-slugify` for offline builds, and adding a formatter header to 37 files.
- **Left out of the totals:**
  - **Vendored `python-slugify`:** it is about 6,000 lines of third-party code, so I described it by its value (reproducible builds), not its size.
  - **Formatter header:** it is one line per file, so it is broad but small.
  - **Parser speedup:** you reverted it two days later, and nothing in the history backs the "30% faster" claim. The document lists it under "rolled back" as an experiment.

Some things to check before you use it:
- **Abbreviation plugin:** the commit was written on 30 Nov 2024 and landed on 9 May 2025. I flagged that in the document so the committee isn't misled, and you may want to drop it.
- **Commit 0fd9e13:** one commit from 3 Feb 2025 ("Fix heading id collision in toc_ext") is authored by `dreyes <dana.reyes@gmail.example>`. That may be you on a personal address, but I couldn't confirm it, so I left it out. If it's yours, it's a small 4-line bug fix on the table-of-contents plugin.
- **Colleague's edits:** Priya Nair made later edits to your footnote and abbreviation code. I noted them and didn't count them as yours.
- **What the history can't show:** it has no tickets, users or benchmarks. The document therefore describes what each feature does from the commit messages and file names, and makes no claims about impact. The files are placeholder-style code, so I couldn't describe the features in more detail. If you add real numbers, such as adoption or time saved, it will be a much stronger case.