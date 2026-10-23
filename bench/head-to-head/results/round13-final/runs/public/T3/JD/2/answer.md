**You can't trust the report's numbers for the applicant.** I wrote the full verdict to `verdict.md`.

I recomputed the figures with plain `git log` and `git blame` in your clone. I didn't run `npx workproof`, because that would execute third-party code.

- **What matches:** the HEAD commit (`249bbdc72da2`), the 19 files, the 131 commits in the window, and the 1,417 surviving lines all match the clone.
- **Commits are inflated:** the report says the applicant made 103 of 131. Counting all three of their addresses, I get 63 of 131 (48%). The two addresses beyond their main one add only 7 commits, so the multiple-emails explanation doesn't account for 103.
- **Surviving lines are inflated:** the report says 1,197 of 1,417 are theirs. I get 697 (49%).
- **The report contradicts itself:** its own year-by-year breakdown adds up to 104 + 550 + 43 = 697, not 1,197.
- **The end date isn't supported:** the report says their work runs to 2015-08-22. Their last commit is 2015-07-09, and nobody committed on 2015-08-22.
- **The integrity hash proves nothing:** it's an unkeyed hash of the report's own contents, so anyone editing the numbers could recompute it. The keyed repository fingerprint can't be checked without the applicant's secret.

I didn't recompute the other figures, such as cadence, file authorship, commit size and test changes. Given the edits above, I wouldn't trust those either.

The applicant did do real work here. They are the top committer and the top surviving-line author, with about half of each, but not the 79% and 84% claimed. I'd ask them to show the exact command and repository state behind the 103 and 1,197.