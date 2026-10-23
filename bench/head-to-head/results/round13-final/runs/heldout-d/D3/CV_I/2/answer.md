The git history doesn't support Priya's claim that she designed and wrote `src/loops.rs`. I wrote the findings to `review-notes.md`.

- **Who wrote it:** Sam Okafor created the module on 2024-02-12 and added its tests on 2024-02-20. Ignoring whitespace changes, 57 of the file's 69 lines are Sam's. Sam also fixed permission-error handling on 2024-05-20.
- **What Priya did:** In May 2024 she renamed the file, added a 12-line max-depth guard, and wrote the docs. The depth guard is her one real code contribution.
- **The "rewrite" changed nothing:** Her commit titled "Rewrite loop detection module" only converted tabs to spaces. The diff is empty once whitespace is ignored. A plain `git blame` credits her with 57 lines and Sam with 12 because of that reformat, so the file looks like hers at a glance.
- **The backdated commit:** Her "Initial loop detection prototype" commit claims an author date of 2023-11-02. It was actually committed on 2024-05-09, after the module was already written. It contains only a 10-line placeholder notes file and no code, so I wouldn't treat it as evidence that she had the idea first.

Caveats:
- This is one export that Priya supplied. Git history can be rewritten, and author names and dates are self-reported.
- Git shows who wrote the code, not who talked through the design.
- Her commits use a personal email address, not a company one like Sam's. That is odd but not proof of anything.

My suggested next steps are to ask Priya what she contributed, ask her to explain the backdated commit, and confirm with Sam Okafor or the former employer, with her permission. "Extended and documented" would fit the evidence better than "designed and wrote".

I didn't use the cv-builder skills. They draft and review resumes, and this was an authorship check.