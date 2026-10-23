Five of the 11 billed days aren't properly supported by the git history. That is 40 of the 82 hours billed (about 49%).

I checked every commit hash in `timesheet.csv` against the repo. The receipts skill builds a usage report from your own Claude Code sessions, so it couldn't help with this.

| Date | Hours | Problem |
|---|---|---|
| Oct 3 | 8 | The commit `646d9df` is by "Lena **Hofmann**" (one "f") at `l.hofmann@other-agency.example`. It isn't her identity (`lena@hoffmann-dev.example`). It adds 15 lines of placeholder text ("tag line 1…15") in a file named `hofmann_tags.rb`. |
| Oct 10 | 8 | The commit `01eae32` is a merge of `main` into her branch. Its only content is a one-line `RELEASE_DRAFT.md` change written by Chris Meyer. None of it is her work. |
| Oct 13 | 8 | The commit `9f3e1ab` doesn't exist in the repo, including on other branches and in the reflog. There are no commits at all on Oct 13. |
| Oct 6 | 8 | The commit `98288e0` is a one-line whitespace trim in `space.rb`. It's real, but it can't account for 8 hours. |
| Oct 8 | 8 | The commit `5919b6a` was authored Sep 29 and only committed on Oct 8. The 22 lines of work predate the billed day, probably from a rebase or amend. It's worth asking when the work was actually done. |

- **Clearly unsupported (Oct 3, 10, 13):** 24 hours.
- **Weakly supported (Oct 6, 8):** 16 hours.

The other six days (Oct 1, 2, 7, 9, 14, 15) match real commits by her on the right dates, with plausible content. The Oct 2 commit uses a GitHub noreply email (a squash-merged PR, #51). It's the same name and is probably fine. Git dates and authors can be edited, so this shows the commits exist and match, not that the hours were worked.

The timesheet is dated 2025, matching the commits.

Next, you could ask Lena for the real hash for Oct 13 and an explanation of the Oct 3 "Hofmann" commit.