I made an evidence package in `./evidence/`: a report with no source code, file paths or email addresses. I ran `check` and `verify` on it. `check` passed with the hash intact, and `verify` recomputed every figure from the repository and found they all match. The fingerprint matched too.

**Figures (author dates, 7 Nov 2013 to 22 Aug 2015):**
- **Commits:** 63 of 131 non-merge commits (48%).
- **Surviving lines:** 697 of 1,417 lines still in the project (49%).
- **Lines added and deleted:** 1,276 added and 1,762 deleted.
- **Files started:** 10 of 19 files in the project.
- **Not counted:** 13 merge commits, plus one commit that was later reverted.

**Addresses:**
- **Merged automatically:** the GitHub noreply address was merged into your configured one, because its GitHub login matches yours.
- **Included, please confirm:** the second `Jonathan Ong` address (`<email:4132b6bd>`) was included because it carries the same name. The report lists it as "included: same name", and I need your confirmation that it is yours.
- **Without it:** your configured address alone gives 56 commits.
- **Left out:** 19 commits written by other people but committed under your addresses. They aren't yours.

**Limits:**
- History can be rewritten before a report is made.
- The figures show activity and surviving lines, not quality, review, design or mentoring.
- The report ranks you 1st of 42 contributors by surviving lines. That is a measure of what survived, not a claim that you are the main author.
- I'd pair this with a letter from someone who worked on the project.

**Public repository:** the repo has no remote, so nothing says it is public. `gh` isn't signed in, so I couldn't check further.

**Files in `evidence/`:**
- `workproof-report.md` is the readable report to attach.
- `workproof-report.json` is the same figures with the hash.
- `README.md` is a short plain-language cover note.
- `HOW-TO-VERIFY.txt` has the commands a reader would run.

Keep the JSON and the fingerprint key `636391e00e9edec14079d034bd488387`. Someone with repository access needs both to re-verify.

The figures checker flagged 131 and 13 in the README as matching no computed figure. Both come from the three-address report, while the checker's own run used one address. I explained this in `HOW-TO-VERIFY.txt`.