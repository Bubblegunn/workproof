I ran the report and both checks, and the files are saved in the current directory.

**Result:**
- **Commits:** you made 63 of the 131 non-merge commits in your window (7 Nov 2013 to 22 Aug 2015), which is 48%.
- **Surviving lines:** 697 of the 1,417 lines still in the project are yours, which is 49%. The commit share and the surviving-lines share measure different things, so I kept them apart.
- **Lines changed:** you added 1,276 lines and deleted 1,762 in that window.
- **Merge commits:** 13 merge commits by you were not counted: 4117a48, 70ba8e2, c8b76ae, 023ecb4, aa59ffd, e42133e, 9aef83e, 8413e5d, 9cdbfeb, 50ed090, 7ad53ac, b47f068, 1bb08e7.
- **Exclusions:** no bot commits and no generated or vendored files were removed.

**Merged addresses:** one other address was merged into your identity (`<email:266aea16>`). The rule was that a GitHub noreply address whose login matches your git identity is treated as you. It is a rule, not proof. If that address isn't yours, tell me and I'll rerun with `--no-merge-identities`.

**Checks:**
- **`check`:** passed. The schema and hash are intact, so the file hasn't been edited since it was written.
- **`verify`:** passed. Every figure was recomputed from the repository, and the repository fingerprint matched.

**Public-looking repository:** this repo has no git remote, so nothing indicates it is public. I couldn't run the `gh` visibility check because it isn't installed here. If it were public, anyone could recompute these figures themselves.

**Limits to keep with it:**
- History can be rewritten before a report is made, and `check` can't detect that.
- The figures show activity and what survived. They don't show quality, review, design or mentoring.
- A reader who can't see the repo can only confirm the file is unedited. They can't confirm the figures. Consider pairing it with a letter from the client or a colleague.

**Files to attach:**
- `workproof-report.md` is the readable report.
- `workproof-report.json` is the version a reader can check with `npx workproof check workproof-report.json`.

Keep the fingerprint key `9e3585fa2b6d832f0715706556bc820e`. It isn't stored anywhere, and you need it to verify against the repo later.

The report names no files, paths or email addresses, and no source code. It does list the 13 merge commit ids and your identity names (Jonathan Ong, jongleberry).