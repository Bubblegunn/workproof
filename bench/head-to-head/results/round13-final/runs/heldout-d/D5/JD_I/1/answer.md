Four billed days aren't supported, and a fifth is weak. The four add up to **32 billed hours**, and the weak one adds another 8. I checked all 11 rows of `timesheet.csv` against the commit each row cites.

**Not supported (32 h)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| Oct 3 | 8 | `646d9df` | The author is "Lena **Hofmann**" (one "f") with the email `l.hofmann@other-agency.example`. That is a different name and a different agency from Lena Hoffmann's `lena@hoffmann-dev.example`. |
| Oct 8 | 8 | `5919b6a` | The author date is **Sep 29**, before the billing period. It was only committed on Oct 8, probably after a rebase or amend. The work wasn't done on Oct 8. |
| Oct 10 | 8 | `01eae32` | This is only a merge commit ("Merge branch 'main' into lena/sync"). It changes one line of `RELEASE_DRAFT.md`, which came from Chris Meyer's `a00f0e5` commit. It contains none of her own work. |
| Oct 13 | 8 | `9f3e1ab` | This commit doesn't exist. It isn't in the repo, on any branch or in the reflog, and nothing else is committed on Oct 13. |

**Weak support (8 h)**
- **Oct 6, 8 h, `98288e0`:** The commit only trims trailing whitespace on one line (`space.rb`). It is real and in her name, but a one-line change doesn't obviously back a full 8-hour day. I'd ask her what else she did that day.

**Supported (the other 6 days, 38 h)**
- These are Oct 1, 2, 7, 9, 14 and 15. Each commit is hers, dated that day, and has substantive code.
- The Oct 2 commit uses a GitHub noreply email instead of her usual one. It reads as a PR squash-merge (#51), so I treated it as fine.

The CSV and `git log` both use 2025 dates, even though today is Oct 23, 2026. Check that the invoice period matches.

I left your repo untouched.