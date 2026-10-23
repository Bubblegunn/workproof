No, you can't trust the headline numbers. The report is accurate about the repo itself but inflates the applicant's share. I wrote the full verdict to `verdict.md`.

I recomputed the figures with plain `git` in your clone. I didn't run `npx workproof verify`, because that would run code the applicant's tooling supplied.

**What matches**
- The HEAD commit, the 131 commits in the tenure window, the tenure dates, the 19 files, and the 1,417 total attributed lines all match.

**What doesn't**

| Claim | Report | Recomputed |
|---|---|---|
| Applicant's commits | 103 (79%) | 63 (about 48%) |
| Applicant's surviving lines | 1,197 (84%) | 697 (about 49%) |

- I merged all three of the applicant's addresses (`<email:d29caa5c>`, `<email:4132b6bd>` and the GitHub noreply address). That still gives only 63 commits and 697 lines, so the several-addresses explanation doesn't close the gap.
- The report contradicts itself. Its own "Survival by cohort" table adds up to 104 + 550 + 43 = 697 lines, which is the real number, while its headline says 1,197. That suggests the headline was edited or inflated after the figures were computed.
- The closest I got to 103 was 82, counting commits the applicant *committed* (mostly merging other people's work) rather than *authored*. That still doesn't reach 103.
- The report says there are 42 authors, but I count 59–60.

**What holds up:** even at the real numbers, the applicant is a major contributor. They have the most surviving lines of anyone (697, against 551 for the original author TJ Holowaychuk), but only about half the commits and lines in their window.

The report's integrity hash only shows the file wasn't changed after generation, not that the figures are right.

I'd ask the applicant for the list of commits behind their 103.