I've written the findings to `review-notes.md`. The git history does not support Priya's claim.

- **Original author:** Sam Okafor wrote the whole 52-line module on 12 Feb 2024, plus its tests on 20 Feb. Both are about three months before Priya first touched it.
- **Priya's "rewrite":** It changed 45 lines on 3 May 2024, but only the indentation (tabs to spaces). With whitespace ignored, the before and after are identical. A plain attribution tool credits her with 57 of the 69 current lines because of this. Ignoring whitespace, Sam wrote 57 and Priya wrote 12.
- **What Priya did contribute:** She moved the module to its current name, added a depth limit (12 lines), and wrote a documentation page. Sam later added the permission-error handling.
- **Date irregularity:** Priya's "initial prototype" is a 10-line notes file with an author date of 2 Nov 2023, but it was recorded on 9 May 2024. It is dated months before the module existed. Author dates can be set to anything, so this isn't proof of early work, but she should explain it.
- **Limits:**
  - Git shows who made changes and when, not who had the idea or how good the work is.
  - Names and dates can be edited.
  - Nothing here confirms either person's employer.
  - The code is mostly simple data declarations, so there is little design to judge.

Suggested next steps: ask her to explain the authorship and the early-dated note, and ask for her real employer and a reference.

I also wrote `evidence/review-notes-sources.md` with the git commands and commit IDs behind each point, kept out of the notes so they stay readable. I used read-only git rather than `workproof figures`, since this is someone else's claim.