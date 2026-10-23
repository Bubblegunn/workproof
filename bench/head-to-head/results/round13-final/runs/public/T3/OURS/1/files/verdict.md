# Verdict on the two files received

**Do not trust the headline numbers. The two inflated figures can be shown wrong from the files alone, and they disagree with the repository.** Some of the rest is real, but it does not rescue the claim.

Scope: this checks the two received files (a readable report and its data file) against the clone of the repository. It says what the history shows (who, what, when). It does not say how long the work took or how good it was.

## What holds

- The report was made against the same version of the project as the clone (the latest change matches).
- The applicant did real work here. Their first change is dated 7 November 2013, as claimed.
- The total number of changes by everyone in their stated period is 131, which matches the report.
- Their share of the code still in the project is the largest of anyone's. Their surviving lines (697) are ahead of the project's original author (about 551).
- Their year-by-year breakdown of surviving lines (2013: 104, 2014: 550, 2015: 43) matches my own recount exactly.
- Within their stated period they have the most changes of any one person, so "ranks 1" holds for that period.

## What does not hold

| Claim in the report | What the repository shows |
|---|---|
| 103 of 131 changes were theirs (79%) | **63** changes, counting every address I could tie to them (see below). That is 48% of 131, not 79%. |
| 1,197 of 1,417 surviving lines are theirs (84%) | **697** lines, about 49%. The report's own year breakdown adds up to 697, so the report contradicts itself. The extra 500 lines appear in only one place. |
| Work ran to 22 August 2015 (654 days) | Their last real change is dated 9 July 2015. The 22 August entry is a merge of someone else's contribution, not new work, which adds about six weeks. |
| Several addresses explain the higher numbers | Their addresses do not close the gap. Using all three I found, the totals are 63 changes and 697 lines. The report says four addresses; I found three. |

The only way the inflated figures could be explained by "several email addresses" is if addresses belonging to other people were counted as theirs. The history gives no support for that. Of the 131 changes in the period, the only other person with a large share is the project's original author (19 changes), and even adding all of them does not give 103.

## What I could not check

- The file's integrity hash. I could not run the tool that produced the report, and my attempts to rebuild the hash by hand did not match, which proves nothing either way because I do not know its exact recipe. So I cannot say whether the file was edited after it was generated. The self-contradiction above is evidence enough.
- The repository identifier in the report is a keyed code, so I cannot confirm it is this repository, only that the version matches.
- Weekly activity, release-tag counts, test-file share, and "files authored" (10 of 19). I did not recompute these. Treat them as unverified.
- Whether the person who sent the files is the person who made the changes. History records an address and a name, nothing more.

## Which addresses are counted

Counted as the same person: three addresses, because the name or the GitHub login matches. This is a rule, not proof; please confirm with the applicant that all three are theirs. Even counting all three, the claim fails. Addresses are listed in the chat, not here.

## Suggested next step

Ask the applicant for the exact list of addresses they say they used, and to re-run the report themselves in front of you (or give you the repository access to do it). Also ask them to explain why the report's total lines (1,197) differ from its own year breakdown (697).

## What I counted, and the filter

- Changes: all non-merge changes by the three addresses, over the whole history (63), all of which fall inside the stated period. Merges were not counted.
- Surviving lines: lines in the 19 files in the project today that the history attributes to those addresses, ignoring whitespace changes and moved lines.
- Not counted: 13 merge entries made under their addresses (merging other people's contributions, not new work), and everything by other people.
