# Verdict: do not trust the headline numbers

The two files in `./received` (`workproof-report.md` and `.json`) describe the same report. Several of its headline figures do not reproduce from this clone, and each one is overstated. The multiple-email explanation does not account for the gap.

## What I checked

I recomputed the figures with plain `git` in this clone. HEAD is `249bbdc`, which matches the report. I did not run `npx workproof verify`, because that would download and execute third-party code. The report's own integrity hash only proves the JSON wasn't edited after it was generated. It says nothing about whether the numbers are right.

I merged every address that plausibly belongs to the named person: `Jonathan Ong <<email:d29caa5c>>`, `Jonathan Ong <<email:4132b6bd>>`, `jongleberry <<email:266aea16>>` and `jongleberry <<email:4132b6bd>>`.

| Claim in report | Recomputed | Result |
|---|---|---|
| Commits in tenure: 103 of 131 (79%) | **63 of 131 (48%)** | Overstated by 40 commits. The window total of 131 matches. |
| Tenure 2013-11-07 to 2015-08-22 (654 days) | Last commit under these identities is **2015-07-09** (about 609 days). No commit by anyone falls near 2015-08-22. | Wrong end date. |
| Surviving lines: 1,197 of 1,417 (84%) | **About 697 of 1,416 (49%)** by `git blame -w -M` | Overstated by about 500 lines. The total matches, so only the author share is inflated. |
| Rank 1 by commits (of 42 authors) | Whole history: TJ Holowaychuk 90, Jonathan (merged) 63. In the tenure window the count is 60 + 3 against TJ's 19, so rank 1 holds only inside the window. | Misleading without that qualifier. |
| Author count 42 | 59 distinct author names | Does not match. |
| Active weeks 24 of 94 | 24 | Matches. |
| Tags in tenure 23 | 23 | Matches. |
| Files at HEAD 19 | 19 | Matches. |

I did not recheck the files-authored (DOA) figure, commit size, test share or language split.

## Reading

- The email-merge explanation does not account for the difference. Merging all of Jonathan Ong's addresses gives 63 commits. The report says 103, and no combination of this person's addresses reaches that number.
- The activity-shaped figures (weeks, tags, window total) match. The figures that make the person look dominant (commit share and surviving-line share) are the ones that are inflated. That pattern suggests the numbers were altered or generated against a different repository state, not that the tool is flaky.
- The report lists no email addresses (`"emails": []`) and hides paths. A reader can't see which addresses were merged.
- The report's own caveat applies here: "same name on another address" and "GitHub login matches" are loose merge rules. They can pull in other people's commits.
- The identity named in the report, "Jonathan Ong / jongleberry", is also the configured git identity in this clone and the repo's real maintainer. Confirm that this is actually your applicant's name and account. If it isn't, the report credits someone else's work.

## What is supportable

If the applicant really is that person, the work is real but modest by this measure. They made 63 commits across about 24 active weeks, and about half of the surviving code is theirs. That is a reasonable contributor record, not a 79% / 84% one.

## Suggested next step

Ask the applicant to list every email address they used. Then recompute with those addresses and compare against `git shortlog -sne`. If they can't produce addresses that account for 103 commits, treat the report as unreliable.
