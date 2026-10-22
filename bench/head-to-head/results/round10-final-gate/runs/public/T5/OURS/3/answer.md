I saved the paragraph to `self-review.md`. It's 92 words.

In `fx`, in your tenure window (7 Nov 2013 to 22 Aug 2015), you made 63 of the 131 non-merge commits (48%). 697 of the 1,417 lines still in the code today are yours (49%). The paragraph keeps those two figures apart, because the first counts activity and the second counts what survived.

- **Checks:** I ran `npx workproof check` and `verify` on the report. The hash is `7ccfbd8c…`, and every figure reproduced from the repo.
- **How your manager can check it:** the paragraph gives the hash prefix and the command `npx workproof verify workproof-report.json --repo .`. They will need `workproof-report.json`, which is in this directory, so send it with the paragraph.
- **Merged address:** the tool counted one other address as you, `<email:266aea16>`, because the GitHub login matches. That is a rule, not proof. If it's wrong, rerun with `--no-merge-identities`.
- **Merge commits:** 13 merge commits of yours were not counted.
- **Limits:** the paragraph says the figures show activity and survival, not quality, review, design or mentoring. It also says git history can be rewritten before a report is made.
- **Public repo:** there is no git remote, so nothing suggests this repo is public.

The report also ranks you 1st of 42 contributors by surviving lines. I left that out because it invites the "top contributor" reading, and the 2013–2015 commit dates will show up in any check.