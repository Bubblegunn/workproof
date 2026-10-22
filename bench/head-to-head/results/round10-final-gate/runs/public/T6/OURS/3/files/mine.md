# My work in fx

- Commits: 63 non-merge commits are mine, out of 131 non-merge commits by everyone between my first and my last commit (2013-11-07 to 2015-08-22).
- Surviving lines: 697 of the 1,417 lines at HEAD are mine (49.2%), counted with git blame -w -M.

## Which addresses are counted

Three addresses in total:
- <email:d29caa5c> (the one in git config)
- <email:4132b6bd> (carries the same name, "Jonathan Ong")
- <email:266aea16> (merged by rule: a GitHub noreply address whose login matches the name or the address in git config)

The rule is not proof and can be wrong; `--no-merge-identities` counts only the configured address and same-name addresses.

This repository looks public, but that changes nothing here: the figures count only the addresses above, and other contributors' work is not included.

## Verification

`npx workproof check` (schema ok, hash ok) and `npx workproof verify` (all figures reproduce from this repository) both passed. Report hash: 176163d46efffd02f0f5167853e86d9c5ada57a210cccb7457288785af88d9da.

## What this does not show

Commits measure activity and surviving lines measure what lasted; neither measures quality, review or design.
