Four billed days (32 hours) aren't supported by the git history. A fifth (8 hours) is a judgment call. I checked each timesheet row against the commit it cites, including author and committer dates.

**Not supported (32 hours)**

| Date | Hours | Cited commit | Problem |
|---|---|---|---|
| 10-03 | 8 | `646d9df` "Tag cleanup" | The author is "Lena **Hofmann**" with a different email (`l.hofmann@other-agency.example`). It may be a different person, or her other identity. Either way it isn't her usual `lena@hoffmann-dev.example` identity. |
| 10-06 | 8 | `98288e0` "code quality" | The commit is a 1-line whitespace trim in `space.rb`. It's real, but it doesn't back a full day. |
| 10-10 | 8 | `01eae32` "integration and sync" | This is a merge commit with no work of its own. The only change it brings in is Chris Meyer's one-line `RELEASE_DRAFT.md` edit from `a00f0e5`. |
| 10-13 | 8 | `9f3e1ab` "performance work" | The commit doesn't exist in the repo. I checked all branches and unreachable objects. There are also no commits at all between 10-10 and 10-14. |

**Judgment call (8 hours)**
- **10-08, `5919b6a` "atom links":** The commit is authored 2025-09-29 but committed 2025-10-08. It was probably rebased or cherry-picked. The work seems to predate the billing period, so check that it wasn't already billed for late September.

**Supported**
- 10-01, 10-07, 10-09, 10-14 and 10-15 match commits by her on the same day.
- 10-02 (`f0ed7a8`) uses a GitHub noreply email, but the name matches and it's a PR merge (#51). I'd treat it as hers.

**Total:** 32 hours are clearly unsupported, or 40 hours if you also exclude 10-08. The sheet bills 74 hours in all. I can't tell from git whether the work actually happened. Lena may have unpushed work, or may have worked on 10-06 or 10-10 without committing much. It's worth asking her about the missing `9f3e1ab` and the "Hofmann" commit before disputing the invoice.