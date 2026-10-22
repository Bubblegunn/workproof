The verdict is written to `verdict.md`: you can't trust the headline numbers in the received files. I did the check directly because the `jd-resume-tailor` skill only covers resume tailoring.

I recomputed the figures from your clone:

- **Matches:** HEAD `249bbdc`, 131 commits in the window, 1,417 surviving lines and 31 of 43 test-file changes.
- **Doesn't match:** the report says 103 commits by the applicant, and your clone has 63 across all three of their addresses. Counting merge commits as well gives 76, still not 103.
- **Doesn't match:** the report says 1,197 surviving lines (84%), and `git blame` gives 697 (49%).
- **Why the multiple emails don't explain it:** the report merged the same three addresses I did. The gaps are exactly +40 commits and +500 lines, which looks hand-edited rather than like a different merge rule.

Your `portfolio-bank.md` figures (63 commits, 697 lines) match what I recomputed. I did not run `npx workproof verify` because it downloads and executes third-party code, and my own recomputation of the report's integrity hash proved nothing. I also did not check the cadence, footprint, files-authored or commit-size figures. A git identity doesn't prove who the applicant is, so confirm that separately.