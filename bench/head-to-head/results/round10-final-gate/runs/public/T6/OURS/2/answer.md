Across all three addresses you have **63 commits** and **697 surviving lines**. I saved the answer to `mine.md` in the current directory.

- **Commits:** 63 of the 131 non-merge commits by everyone, from your first commit (2013-11-07) to your last (2015-08-22). That is the span of your own commits, not the whole history.
- **Surviving lines:** 697 of the 1,417 lines at HEAD (49.2%), counted with `git blame -w -M`.

**Which addresses were counted:** three in total.
- The configured address.
- One address carrying the same name.
- `<email:266aea16>`, merged by rule because its GitHub login matches. This is a rule, not proof. If it's wrong, `--no-merge-identities` counts only the configured address and the same-name address.

**Checks:** I ran the full report into `/tmp/wp-out2`, outside the repo. `check` passed (schema and hash OK). `verify` passed too: the fingerprint matched and all figures reproduce from the repository. The fingerprint key is `e83158939c4c659335d5af4371f76f2d`. It isn't stored anywhere, so keep it if you want to verify again.

**Public repository:** this repo has no git remote, so nothing says it is public. If it is public, anyone can recompute these figures themselves.

**Limits:**
- History can be rewritten before a report is made, and `verify` can't detect that.
- Commits measure activity and surviving lines measure what lasted. Neither shows quality, review, design or mentoring.