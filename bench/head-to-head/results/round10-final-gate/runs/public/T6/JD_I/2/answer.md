Across your three emails you have 76 commits on `master` and 697 surviving lines. I saved the breakdown to `mine.md`.

The jd-resume-tailor skill only tailors resumes, so it didn't apply to this request. I counted with git directly.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 68 | 585 |
| <email:4132b6bd> | 5 | 111 |
| <email:266aea16> | 3 | 1 |
| **Total** | **76** | **697** |

- **Other ref:** one more commit under the gmail address, `0591262` ("4.3.0"), is on a ref other than `master`. Counting all refs, the total is 77.
- **Merge commits:** 12 of the gmail commits are merge commits, and they're included in the count.
- **How I counted:** I matched by author email, and the repo has no `.mailmap`. Surviving lines come from `git blame -w -M -C` at HEAD.