I wrote the verdict to `verdict.md`: you can't trust the headline numbers in the two files. Both files are the same `workproof` report in two formats. I recomputed it with plain `git` in your clone and didn't run `npx workproof verify`, since that would run unreviewed npm code.

**What matches**
- HEAD is the same commit as in your clone.
- The tenure start date matches.
- There are 131 non-merge commits by anyone in the window.
- There are 19 files at HEAD.
- Blame attributes 1,417 lines.

**What doesn't match**
- **Commits:** the report says 103 of 131 (79%). Across all three plausible Jonathan addresses I count 63 of 131 (48%).
- **Surviving lines:** the report says 1,197 of 1,417 (84%). I count about 697 (49%). TJ Holowaychuk alone has 551 surviving lines, so 1,197 for the applicant would leave only 220 for everyone else.
- **Author count:** the report says 42 authors. I count 60 distinct author emails over non-merge history.
- **Multiple emails don't explain it:** the three addresses are `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. Merging all of them gives the 63 and 697 above, not the report's figures. The report hides the emails, so you can't see which addresses it merged. The tool's name-matching merge may have credited other people's commits to the applicant.
- **Hash:** the report's hash only shows the file wasn't edited after it was generated. It doesn't show the figures are right.

Their real contribution is about half of what they presented. I didn't recompute the other figures, such as file authorship and test share. I'd ask the applicant for the exact addresses and command they used.