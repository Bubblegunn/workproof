You can't trust the headline numbers in those files. I've written the verdict to `verdict.md`.

**What I checked**
- **Which repo:** the report was made against the same latest change as your clone.
- **Commits:** I counted the applicant's commits by author across their addresses.
- **Surviving lines:** I counted the lines they wrote that still survive, using `git blame`.
- **Merges, dates and period:** I excluded merges, and looked at the dates and the stated period.
- **Report arithmetic:** I checked the report's figures against each other.

**What holds**
- Their first commit is dated 7 November 2013, as claimed.
- The total of 131 commits in their period is correct.
- The year-by-year split of their surviving lines matches my recount.
- They have the most surviving lines, and the most commits within their period.

**What doesn't hold**

| Claim | What I found |
|---|---|
| 103 of 131 commits (79%) | **63** commits, using every address I could tie to them. That is 48%. |
| 1,197 surviving lines (84%) | **697** lines, about 49%. The report's own year breakdown adds up to 697, so the file contradicts itself. |
| Worked until 22 August 2015 | Their last real commit is 9 July 2015. The 22 August entry is a merge of someone else's pull request. |
| "Multiple addresses" explains it | I found three addresses, and the report says four. Even all three together give 63 commits and 697 lines. Adding every commit by the project's original author in that period (19) still doesn't reach 103. |

**What I couldn't check**
- **Integrity hash:** the tool wasn't installed, and my hand attempts to rebuild the hash didn't match. That is inconclusive, because I don't know its exact recipe.
- **Other figures:** I did not recompute weekly activity, release tags, test-file share or "files authored".
- **Identity:** nothing here shows the sender is the person who made the commits.

**Please confirm the identities.** I counted these three addresses as the same person, because the name or GitHub login matches. That is a rule, not proof:
- `<email:d29caa5c>`
- `<email:4132b6bd>`
- `<email:266aea16>`

It's worth asking the applicant for their exact address list. Also ask them why the report's 1,197 lines differ from its own 697 breakdown.