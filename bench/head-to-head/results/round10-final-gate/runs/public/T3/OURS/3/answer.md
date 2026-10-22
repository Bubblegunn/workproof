I've finished checking and written `verdict.md`. The report can't be trusted, because two of its headline numbers are inflated.

`npx workproof verify` says the report's hash is valid and its HEAD (`249bbdc72da2`) matches your clone. The hash only shows the file wasn't altered after it was generated, not that the numbers are true. Recomputing from your clone, two figures differ:

| Figure | Report says | Your clone gives |
|---|---|---|
| Commit share | 103 of 131 (79%) | 63 of 131 (48%) |
| Surviving lines | 1,197 of 1,417 (84%) | 697 of 1,417 (49%) |

- **Multiple email addresses don't explain it.** The author's three addresses add up to about 63 commits and 697 lines. Reaching 103 and 1,197 would need 40 more commits and about 500 more lines from someone else's addresses. The only other author with that much surviving code is TJ Holowaychuk, who has 90 commits, so no set of addresses fits.
- **The report contradicts itself.** Its own cadence figure (24 active weeks at 2.6 commits per week) works out to about 62 commits, not 103.
- **Their lead is much smaller than claimed.** TJ Holowaychuk has 90 commits against the author's 63, so "ranks 1 by commit count" is doubtful. On surviving lines the author is still first, but only narrowly.

Several other figures did match your clone: tenure dates, cadence, commit size and the per-year line split.

I couldn't check the repository fingerprint, which needs a key from whoever made the report. I also can't tell who owns which email address.

I'd ask the applicant for the exact addresses they merged, then run `git log --author=<addr>` on each in your clone.