Across your three addresses, 63 non-merge commits and 697 surviving lines are yours. I saved that to `mine.md` (written by `npx workproof mine --out mine.md`).

- **Commits:** 63 of the 131 non-merge commits by everyone between your first and last commit (2013-11-07 to 2015-08-22). That is a window, not the repository's total.
- **Surviving lines:** 697 of the 1,417 lines at HEAD (49.2%), counted with `git blame -w -M`. Commits measure activity and surviving lines measure what lasted, so the two shares are separate.

**Which addresses were counted:** three in total.
- **Configured address:** `<email:d29caa5c>`, from `git config`.
- **Same name:** `<email:4132b6bd>`, picked up because its commits carry the same name as the configured one.
- **Merged by rule:** `<email:266aea16>`. The tool merged it because the GitHub login matches the name and address in git config. That is a rule, not proof, and `--no-merge-identities` would drop it.

**Checks:**
- **`check`:** schema and hash are ok, so the report wasn't edited after it was written.
- **`verify`:** the fingerprint is ok and all figures reproduce from this repository.
- **Extra files:** the full run also left `workproof-report.md` and `workproof-report.json` in the directory. Delete them if you only wanted `mine.md`.

**Public repository:** there's no git remote, so nothing says this repository is public. If it is public, anyone can recompute these figures from it.

**Limits:**
- **History:** it could have been rewritten before the report was made.
- **Scope:** the figures say nothing about quality, review, design or mentoring.