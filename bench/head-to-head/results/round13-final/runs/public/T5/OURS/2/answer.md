I saved the paragraph to `self-review.md`. It's 101 words, under your 120 limit.

It says you did not create the codebase. TJ Holowaychuk started it and wrote the largest share of the history. Here is what it claims for you:

- **Commits:** you authored 61 of the 230 non-merge commits, about 27%, between November 2013 and July 2015. It also says you made 12 merge commits for outside contributions, and one of your commits was later reverted.
- **Surviving code:** about half of the 950 lines of code and tests still in the project (472) are attributed to you, and about 38% to TJ.
- **Your work:** reworking the core to use promises, passing context and arguments through, supporting objects and recursion, and adding tests.

- **Identity (please confirm):** your git identity is Jonathan Ong, `<email:d29caa5c>`. I also counted `<email:4132b6bd>` as you, because it has the same name. I left out commits from `jongleberry <<email:266aea16>>`. That's 2 more commits, and counting them would make it 63. Tell me if that one is also you. Your work address, `<email:38e0984e>`, matches no commits.
- **Line counts:** the 950 and 472 are my own count of who wrote each surviving line. The tool doesn't produce them, so its check flagged 950 as unmatched. I ignored whitespace and did not remove third-party code. The tool counts your edits as 1,274 lines added and 1,759 deleted, so you removed more than you added. That's why I used surviving lines instead.
- **Not counted:** merge commits are in their own figure, not in the 61, and the reverted commit stays in your commits.

Check it with `git log --author="Jonathan Ong" --no-merges --oneline | wc -l`. It should print 61, and I haven't run that exact command.