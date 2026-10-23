**No, you can't trust the headline numbers.** The repo facts in the files are real, but the applicant's own commit and line counts are inflated, and extra email addresses don't explain it. I wrote the full verdict to `verdict.md`.

I recomputed the figures with plain `git log` and `git blame` in your clone. I didn't run `workproof` because it isn't installed.

**What matched:**
- The HEAD commit, the tenure dates, and the 131 non-merge commits in that window.
- The 24 active weeks, the 23 tags in tenure, and the 19 files with 1,417 lines.
- Their identity merging looks legitimate. Jonathan Ong and jongleberry are the same person on four addresses.

**What didn't match:**
- **Commits:** the report says 103 of 131 (79%). Counting every address they could own gives 63 (48%), so the multi-email explanation only gets from 56 to 63.
- **Surviving lines:** the report says 1,197 of 1,417 (84%). `git blame` gives about 697 (49%). The report's own year-by-year breakdown also sums to 697, so the file contradicts its own headline.
- **Rank by commits:** the report says rank 1, but they are rank 2, behind TJ Holowaychuk with 90 commits.
- **Author count:** the report says 42 authors, but there are 59 distinct author names.
- **Test-file changes:** the report says 31 of 43. My rough count is 31 of 74. This one is lower confidence.

Their genuine strongest figure is that they have the most surviving lines (696, against 551 for TJ Holowaychuk).

The report's integrity hash only shows the file wasn't edited after generation. Anyone who edits the figures can recompute it, so it doesn't prove the numbers match the repo.

**Not checked:** the hash itself, the 17 author-owned tags, files touched, the language split, the "files authored" model, and the "2 authors cover half the commits" figure. To test the whole report, run `npx workproof verify` in your clone. I expect it to fail on the figures above.