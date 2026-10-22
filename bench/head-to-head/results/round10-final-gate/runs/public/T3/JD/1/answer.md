I wouldn't trust the report's headline numbers. My verdict is in `verdict.md`.

I recomputed the figures from your clone with plain `git log` and `git blame`. I did not run `npx workproof verify`, because that would execute downloaded code from the network.

- **Matches:** The report describes this repo at HEAD `249bbdc`. Its total of 131 commits in the window also matches.
- **Commits:** The report says 103 of 131 commits (79%). Merging every address that matches their names gives **63** commits (about 48%).
- **Surviving lines:** The report says 1,197 of 1,417 lines (84%). `git blame` gives **696 of 1,416 (about 49%)**. TJ Holowaychuk holds 551.
- **Self-contradiction:** The report's own cohort breakdown (104 + 550 + 43) adds up to 697, which matches my count. The headline figure is exactly 500 higher, and both come from the same blame pass.
- **Dates and rank:** Their last commit under these identities is 2015-07-09, not 2015-08-22. I count about 59 authors, not 42, and TJ has the most commits overall.
- **Their explanation:** Merging their addresses does explain some of the difference, because it moves the count from 56 to 63. It doesn't come close to 103, or to the line count.
- **Unverified:** I didn't check files authored, test-file changes, active weeks, commit size or the language split.
- **Who the report is about:** The report never names the applicant. Its subject, "Jonathan Ong" / "jongleberry", is also your configured git user. Confirm the applicant is actually that person.

The work itself is real: about 63 commits and roughly half the surviving lines. It is not the 79% and 84% claimed. I couldn't tell whether the file was edited after it was generated or built from something other than this history.

Ask the applicant for the exact address list they used, and compare it against `git shortlog -sne` in your clone.