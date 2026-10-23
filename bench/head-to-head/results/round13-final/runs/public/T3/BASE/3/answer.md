You can't trust the headline numbers in the two files. They're from the right repo (HEAD `249bbdc`, 19 files and 131 commits in the window all match your clone), but they inflate the applicant's work.

I recomputed the figures with plain `git` on your clone. I did not run `npx workproof verify`, because that would execute an untrusted package from the applicant.

- **Commits:** the report says 103 of 131 commits. Merging all their addresses (`jonathanrichardong@`, `<email:4132b6bd>`, the GitHub noreply address) gives 63. So the address-merging claim is fair, but it doesn't get anywhere near 103.
- **Surviving lines:** the report says 1,197 of 1,417 (84%). `git blame` at HEAD gives 696 for them out of 1,416 lines, about 49%. The report's own per-year table adds up to 697, so it contradicts its own headline.
- **Rank:** the report says they rank 1 of 42 authors. There are 60 distinct author emails, and over all history TJ Holowaychuk has 90 commits to their 63. They only rank first inside the narrowed window.
- **Files authored:** the report says 10 of 19. By who first added each file, it's TJ 10, the applicant 8, and Will Conant 1. I couldn't confirm the 10, and it looks like TJ's number.

Several other figures check out: 24 active weeks, 23 tags in the window, and 31 test-file changes (TJ's count is also 31).

The applicant's contribution is still real, with about 63 commits and roughly half the surviving code, and they're the top contributor in 2013–2015. The report just overstates it, and I'd ask them to explain the gap.

The report's integrity hash is computed from its own contents, so someone who edits the numbers can recompute it. It isn't proof the figures are untouched, and I couldn't verify it.

The full table of checks is in `verdict.md`.