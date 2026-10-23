Four of the 11 billed days aren't properly supported, which is **32 of 79 billed hours**. Two more days (14 hours) are borderline. This is from `timesheet.csv` checked against each cited commit and the full git history. I didn't run the receipts report, because that skill summarizes Claude Code usage and doesn't audit timesheets.

**Not supported (32 h)**

| Date | Hours | Cited commit | Problem |
|---|---|---|---|
| Oct 3 | 8 | `646d9df` | The author is "Lena **Hofmann**" with an `@other-agency.example` email, and the file is `hofmann_tags.rb`. It was committed by someone else, or at least not under her contractor identity. |
| Oct 8 | 8 | `5919b6a` | The author date is **Sep 29**, before the invoice period. It was committed Oct 8, so this is earlier work billed again, or a backdated or rebased commit. |
| Oct 10 | 8 | `01eae32` | This is a merge commit. Its only content is Chris's `RELEASE_DRAFT.md` from `a00f0e5`. It has no work by Lena. |
| Oct 13 | 8 | `9f3e1ab` | The commit doesn't exist in the repo. It isn't on any branch or in unreachable objects, and no commit is dated Oct 13. |

**Borderline (14 h)**

- **Oct 6, 8 h** ("code quality", `98288e0`): the commit is a one-line whitespace trim in `space.rb`. It's real, but it doesn't back a full 8-hour day.
- **Oct 9, 4 h** (`790a212`): this one is fine. The commit is an 18-line summary-truncation feature, which fits the 4 hours billed.
- **Oct 2, 8 h** (`f0ed7a8`): the author email is a GitHub `noreply` address, not her usual `hoffmann-dev` one. The name matches and the message ends in `(#51)`, so it looks like a squash-merged PR. I counted it as supported, but check that PR if you want to be sure.

I'd put Oct 6 and Oct 2 in the "ask Lena" bucket. Oct 6 is the weaker of the two.

**Supported:** Oct 1, 7, 9, 14 and 15 each have a genuine Lena commit dated that day. Oct 2 is counted as supported with the caveat above.

**Totals:** 79 hours billed. Unsupported is 32 h (40%). Adding the Oct 6 day gives 40 h at most.

A commit only shows that something was committed. It can't show hours worked, so ask Lena about Oct 3 (the other agency), Oct 13 (the missing hash) and Oct 8 (the Sep 29 author date).

The timesheet's commit hashes and the dates in the log are all 2025. That matches the invoice period, so I read "October" as Oct 2025.