I ran `npx workproof` and then `check` and `verify`. All three passed. The report is ready to attach, with one caveat: the report's own text says it does not describe this repo as private.

**Files** (in the current directory)
- `workproof-report.md` is the readable report.
- `workproof-report.json` is the machine-checkable version.
- Hash: `94138ed6854dd67ab2b0020f700ee96591e40f51c803048664a3c4b466eac752`.
- Neither file contains source code, file paths or email addresses.

**Addresses merged:** one other address was merged into your configured identity. It is a GitHub noreply address, and the tool merged it because the GitHub login matches your name or address in git config. This is a rule-based match, not proof. If it's wrong, I can re-run with `--no-merge-identities`. The report lists the identities as "Jonathan Ong, jongleberry". It does not print the address itself.

**Figures** (window 7 Nov 2013 – 22 Aug 2015, 654 days)
- **Commits:** you made 63 of 131 non-merge commits in that window (48%).
- **Surviving lines:** 697 of 1,417 lines still in the project are yours (49%).
- **Files started:** you started 10 of the 19 files.
- **Lines changed:** you added 1,276 lines and deleted 1,762 lines.
- **Merge commits:** 13 merge commits by you were not counted: 4117a48, 70ba8e2, c8b76ae, 023ecb4, aa59ffd, e42133e, 9aef83e, 8413e5d, 9cdbfeb, 50ed090, 7ad53ac, b47f068, 1bb08e7.
- **Exclusions:** no bot commits and no generated, vendored or lock files were excluded.

**Checks**
- `check` passed. The schema and hash are fine, so the file wasn't edited after it was written.
- `verify` passed with the fingerprint key. It recomputed every figure from the repo and all of them matched.
- Keep the JSON and the fingerprint key `0740850f0597498c3adc092be48bc86b`.
- A reader with the repo can run `npx workproof check workproof-report.json`.

**Public or private:** the repo has no git remote, so nothing indicates it is public. I treated it as not public and added nothing about a public link.

**Limits**
- The git history could have been rewritten before the report was made. A passing `verify` doesn't rule that out.
- The figures count activity and surviving lines. They don't show quality, review, design or mentoring.
- Because of these limits, a visa officer may want a supporting letter from someone who worked with you on the project.