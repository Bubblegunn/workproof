I wrote `promotion-evidence.md` in the repo folder. It covers your January–June 2025 work, with sizes as approximate lines of code.

**What it claims**
- **Four features:**
  - table-of-contents extension, about 90 lines
  - LaTeX footnote renderer, about 120 lines
  - math plugin v2 with block-level equations, about 75 lines plus about 36 lines of tests
  - abbreviation plugin, about 54 lines
- **Maintenance work:**
  - the offline-build setup
  - the 37-file formatter header change, described as mechanical
  - a small heading-ID collision fix

**What it leaves out or discounts**
- The vendored python-slugify copy is about 6,000 lines of third-party code. I said that explicitly so it doesn't read as authored code.
- The "30% faster" parser change was reverted two days later, so it isn't counted as delivered.
- Priya Nair's commits and the Dependabot bump are excluded.

**Please check before you submit**
1. The heading-ID fix was committed under `dana.reyes@gmail.example`, not your work email. It's signed off as Dana Reyes, so I included it, but confirm it's yours.
2. The abbreviation plugin was originally authored in Nov 2024 and only landed in the history on 9 May 2025. I counted it in this period and noted that in the file.
3. Git history shows scale but not impact. Add user numbers or time saved yourself if you can back them up.