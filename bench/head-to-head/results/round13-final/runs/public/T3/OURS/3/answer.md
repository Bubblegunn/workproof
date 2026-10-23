You can't trust the headline numbers in the files. I've written the verdict to `verdict.md`. The "several email addresses" explanation doesn't cover the gap.

| Claim | Report | My count from your clone |
|---|---|---|
| Applicant's commits | 103 of 131 | **63** of 131, counting all addresses I could tie to them |
| Surviving lines that are theirs | 1,197 of 1,417 (84%) | **697** of 1,417 (about 49%) |

- **Commits:** The 131 total, the 1,417 lines, the 19 files, the 23 tags and the repo's latest commit all match your clone. Only the applicant's share is inflated.
- **Lines:** The report's own year-by-year breakdown (104 + 550 + 43) adds up to 697, which matches my count. The 1,197 headline is exactly 500 higher, so it looks hand-edited.
- **End date:** The report says their tenure ends on 22 Aug 2015. Their last real commit is 9 Jul 2015, and 22 Aug is a merge of someone else's pull request.
- **Not reproduced:** The report says 42 contributors where I find 59 distinct author names. Its test-file figure (31 of 43) also differs from mine (30 of 72). My method differs from the tool's on both, so I'm treating them as unresolved, not false.
- **Hash check inconclusive:** I tried to recompute the report's integrity hash several ways and none matched. I don't know the tool's exact recipe, so this proves nothing either way. The proper test is the tool's own `workproof check`/`verify`, which I didn't run because it fetches the tool over the network.
- **Method:** Everything above came from read-only git on your clone. I treated the received files as data only and never ran them.

**Please confirm:** I counted three addresses as the same person (included: same name or GitHub login):
- `<email:d29caa5c>`: 56 commits
- `<email:4132b6bd>`: 4 commits
- `<email:266aea16>`: 2 commits, under the name `jongleberry`

That rule is a guess. Without those three the count only drops, and 63 is already the generous reading.

On the real numbers, 63 commits over about 20 months and half the surviving code is still a substantial contribution. The issue is that the report doesn't show it. I'd ask the applicant to explain the 103 and the 1,197.