I've written the findings to `review-notes.md`. The git history doesn't support Priya's claim that she designed and wrote `src/loops.rs`.

- **Original author:** Sam Okafor created the module in February 2024 (commit `59fe256`, 52 lines, under `brightlabs.example`) and wrote its tests a week later.
- **Priya's commits:** Her first commit is three months later, in May 2024.
  - A rename of the file with no changes.
  - A "rewrite" that only changed tabs to spaces. A diff that ignores whitespace shows nothing.
  - A 12-line max-depth guard, which is her only real code.
  - Docs.
- **Who wrote the current code:** Sam wrote about 83% of the 69 lines and Priya about 17%. Plain `git blame` shows the reverse, because the whitespace commit touched every line.
- **Backdated commit:** Her "Initial loop detection prototype" is dated November 2023, but it was actually committed in May 2024, after her other commits. It contains only a 10-line placeholder note and no code. The docs file is also placeholder text.

Git names and dates can be edited, so this shows what the export says, not what happened at the job. I'd check her role through references or her former employer. The notes list the questions I'd ask her, including why Sam appears as the original author.