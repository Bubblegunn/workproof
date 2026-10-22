Across your three addresses you have **76 commits** and **695 surviving lines**. I saved the breakdown to `mine.md`.

The gaptogrowth skill is a resume-tailoring tool, so it had nothing to do with this. I counted straight from git history instead.

- **Addresses:** `<email:d29caa5c>` (the one in git config), `<email:4132b6bd>`, and `<email:266aea16>`.
- **Commits:** 76 are on master, the checked-out branch. Counting every ref gives 77. Of the 76, 13 are merge commits.
- **Surviving lines:** I ran `git blame -w` on every tracked file at HEAD, ignoring whitespace-only changes. That gave 583 lines for the gmail address, 111 for `<email:4132b6bd>` and 1 for the noreply address.

One thing to check: a `jongleberry` author name also appears on commits under `<email:4132b6bd>`. I matched on email, not name.