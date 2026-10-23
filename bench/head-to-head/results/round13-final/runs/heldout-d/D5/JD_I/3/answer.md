Four billed days (22 hours) aren't properly supported by the git history. Two more days (12 hours) are borderline and need your call.

I checked all 11 billed days (Oct 1–15, 2025, 73 hours) against the commit hash on each row.

**Not supported: 22 hours**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| Oct 3 | 8 | `646d9df` | The author is "Lena **Hofmann**" at `l.hofmann@other-agency.example`, not Lena Hoffmann or her usual address. The file is a 15-line `hofmann_tags.rb` of placeholder text ("tag line 1…"). It looks like someone else's work, or filler. |
| Oct 6 | 8 | `98288e0` | The commit only removes trailing whitespace on one line (1 line changed). That's minutes of work, not 8 hours. |
| Oct 10 | 4 | `01eae32` | This is a merge commit. Its only content is Chris Meyer's `RELEASE_DRAFT.md`, which came in from main. She wrote no code that day. I counted the row as 4 hours, though the CSV may say otherwise. |
| Oct 13 | 8 | `9f3e1ab` | This commit doesn't exist in the repo. There are no branches or reflog entries for it, and no commits at all on Oct 13. |

I had to guess at the Oct 10 hours. The CSV rows are ordered by date. By that ordering, Oct 7 is 6 hours, Oct 9 is 4 and Oct 10 is 8. So Oct 10 is probably 8 hours, not 4, which would make the unsupported total **26 hours**. Please confirm against the file's hours column before using either number.

**Borderline: 12 hours**
- **Oct 8, 8 hours (`5919b6a`):** It was authored on Sep 29 and committed on Oct 8. The work may be real, but it was done before the billing period, or the date was changed by a rebase or amend. Ask her about it.
- **Oct 9, 4 hours (`790a212`):** The commit is real and authored by her that day, but it is only an 18-line file. Whether 4 hours is reasonable is your judgment.

**Fine**
- Oct 1, 2, 7, 14 and 15 match real commits by her on the right dates.
- The Oct 2 commit uses a GitHub noreply email, which is probably the same person via PR #51.

Her Oct 12 commit (`12cab59`) isn't billed. A commit also doesn't prove hours worked in either direction. This only shows which claims the repo can't back up.