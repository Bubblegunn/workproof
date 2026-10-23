I found five billed days that the git history doesn't properly support, and four of them are clear-cut. Together the five are 40 billed hours. I checked all 11 rows in `timesheet.csv` against `git log` and `git show`.

**Not supported (32 h)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| 10-03 | 8 | `646d9df` | The author is "Lena **Hofmann**" with an `@other-agency.example` email, not her usual identity. The commit adds a file called `hofmann_tags.rb`. It isn't attributable to her as it stands. |
| 10-06 | 8 | `98288e0` | The "code quality" day is a single whitespace fix: one line changed in `space.rb`. |
| 10-10 | 8 | `01eae32` | This is a merge commit ("Merge branch 'main' into lena/sync"). The only content it brings in is a 1-line `RELEASE_DRAFT.md`, which Chris Meyer wrote in `a00f0e5`. She authored no work that day. |
| 10-13 | 8 | `9f3e1ab` | This commit doesn't exist in the repo. It isn't on any branch or in the reflog. No other commit falls on 10-13. |

**Questionable (8 h)**
- **10-08, 8 h, `5919b6a` (atom links):** The commit date is 10-08, but the author date is 2025-09-29. That points to work done before the billing period and rebased or amended onto 10-08. It's a real 22-line change, so the work exists. The open question is whether it was done on the day billed.

**Supported**
- **10-01, 10-02, 10-07, 10-09, 10-14, 10-15:** These match real commits by her, dated that day, with substantive changes.
- **10-02:** The commit uses a GitHub noreply email and "(#51)" in the message, so it looks like a squash-merge. It's probably her, but it's worth a glance.

**Other caveats**
- A commit can't prove hours. Even the supported days only show that something was committed, not that 8 hours went into it. The 8 h billed for the small 10-01 and 10-14 commits may be worth a question too.
- The remaining two days are lower-confidence than the four above. I'd ask her directly about the 10-03 author identity and the missing `9f3e1ab`. She may have a typo in the hash or an unpushed branch.