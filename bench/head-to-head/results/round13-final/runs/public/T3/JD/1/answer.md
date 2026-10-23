You can't trust the headline numbers in the files. I wrote the verdict to `verdict.md`.

I recomputed everything with plain git on your clone. I didn't run the applicant's tool or `npx workproof verify`.

- **What matches:** The report's HEAD commit, `249bbdc`, is the same as your clone's. It also gets 131 non-merge commits in their tenure window, 19 files and about 1,417 lines right.
- **Commits are overstated:** The report says they made 103 of those 131 commits. Counting every address that looks like theirs (4 addresses across the "Jonathan Ong" and "jongleberry" names), I get 63 by author. Counting by committer gives 82, which still isn't 103.
- **Surviving lines are overstated:** The report says 1,197 of 1,417 lines are theirs (84%). A blame check gives roughly 700 lines, about 50%.
- **Other counts differ:** The report says 42 people wrote code, but the history has about 59–60 distinct authors.
- **The address merging itself is fine.** The addresses do look like one person. But merging them doesn't produce the claimed numbers.
- **I couldn't check the report's integrity hash.** It's a keyed fingerprint I can't recompute without their tool and key. Authorship in git is also self-declared, so it only shows what the commits say.

Their real contribution is still substantial, roughly 63 commits and about half the surviving lines. They are one of the top two code owners in this repo, alongside TJ Holowaychuk.

I'd ask the applicant for the exact list of merged addresses and the command they ran.