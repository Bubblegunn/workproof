Across your three emails you have 76 commits and 695 surviving lines. I saved both numbers to `mine.md`.

- **Emails matched:** `<email:d29caa5c>`, `<email:4132b6bd>` and `<email:266aea16>`. I found the second and third by listing every author in the log, not by guessing.
- **Commits:** 76 where one of those emails is the author. 63 of them are left if you exclude merge commits.
- **Surviving lines:** 695 of the 1,417 lines in tracked files at HEAD are attributed to you by `git blame`.

I counted commits by author. A few commits by other people (for example from Jorge Bucaran and zensh) show your gmail address as committer, probably because you merged them. I left those out. I didn't pass `-w` for the total-lines count, but I did for yours. That could make your count slightly lower than a like-for-like comparison.