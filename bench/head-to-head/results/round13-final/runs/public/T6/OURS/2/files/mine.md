# My contribution to this repository

Across my three addresses I have **63 commits** and **673 surviving lines**.

- Commits: non-merge commits, by author date, from the start of history to HEAD (249bbdc). Merge commits are left out (13 more by the same addresses). One of the 63 is a revert commit, and the commit it undoes is also among the 63.
- Surviving lines: lines in the current files that `git blame` attributes to one of the three addresses. Blame ignores nothing, so whitespace edits count. With whitespace ignored (`blame -w`) the figure is 695, because reformatted lines are credited to their original author.

| Address | Commits | Surviving lines |
|---|---|---|
| <email:d29caa5c> | 56 | 556 |
| <email:4132b6bd> | 5 | 116 |
| <email:266aea16> | 2 | 1 |
| **Total** | **63** | **673** |

The `<email:4132b6bd>` row is 4 commits under the name "Jonathan Ong" plus 1 under "jongleberry". The commit counts match `git shortlog -sne --no-merges` and `npx workproof figures`.

For comparison, the tool's lines added over history are 1276 raw and 1200 with whitespace ignored. Lines added over history are not the same as lines that survive.
