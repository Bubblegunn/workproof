Across the three emails you have **76 commits** on master and **673 surviving lines**. I saved this to `mine.md`.

| Email | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 68 | 556 |
| <email:4132b6bd> | 5 | 116 |
| <email:266aea16> | 3 | 1 |

- **Matching:** I matched on email only. Some commits use the name "jongleberry" instead of "Jonathan Ong", and `git shortlog` lists them as separate entries.
- **Commits:** The 76 includes merge commits. Without them it is 63.
- **Unreachable commit:** One more commit of yours, the `4.3.0` release commit, isn't reachable from master. Counting it makes 77.
- **Lines:** I counted lines with `git blame` on HEAD across all tracked files.