I wrote the note to `invoice-check.md`. The short version is that the history shows some real work but can't confirm the hours, and it doesn't support two of the four items as billed.

The history records what was saved and when, not time spent, so only Luka's own timesheets can confirm any hours figure.

- **Sitemap exclusion flag (20 h):** This is real, finished work. It is about 58 lines of code, committed in a roughly two-hour window on 9 Sep, so 20 h looks high.
- **Multi-language support (24 h):** This was started and left unfinished. It sits on a side branch that was never merged, and the last commit is labelled "WIP" (work in progress).
- **Sitemap caching (12 h):** The commit is under a different person's name, Nora Fisher, who has the same company email domain. The code looks like placeholder functions rather than a working cache. I only read the first 50 lines of that file, so this is my reading and not a test.
- **CI fix (6 h):** The commit is dated 3 Oct, outside the September billing period. It also deleted a lot of the existing test setup, including older Ruby versions and the gem-build check.

The note ends with questions to put to Luka and suggests holding payment on the unsupported parts. I didn't run any of the code. Commit dates also come from Luka's own computer and can be set to anything.