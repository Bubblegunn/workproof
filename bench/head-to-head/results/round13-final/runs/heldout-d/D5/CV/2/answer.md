I checked each billed day in `timesheet.csv` against the git history. Four days (28 hours) aren't supported, and two more (16 hours) are weak enough that I'd question them. The timesheet is 2025-10-01 to 2025-10-15, 11 days and 86 hours in total.

**Not supported: 4 days, 28 hours**

| Date | Hours | Referenced commit | Problem |
|---|---|---|---|
| 10-03 | 8 | `646d9df` "Tag cleanup" | The author is "Lena **Hofmann**" (one "f") with an `@other-agency.example` email, not Lena Hoffmann's `lena@hoffmann-dev.example`. The commit adds a 15-line file, `hofmann_tags.rb`. It looks like someone else's commit. |
| 10-10 | 8 | `01eae32` "integration and sync" | This is a merge commit. Its only change is one line in `RELEASE_DRAFT.md`, which came in from Chris Meyer's commit `a00f0e5`. No work of hers is in it. |
| 10-13 | 8 | `9f3e1ab` "performance work" | That commit doesn't exist in the repo (git calls it a malformed object name). There are also no commits at all between 10-12 and 10-14. |
| 10-06 | 8 | `98288e0` "code quality" | The commit is real and hers, but it only removes trailing whitespace on one line of `space.rb`. Eight hours for that isn't credible. |

I counted 10-06 as unsupported. If you'd rather treat it as "real commit, hours disputed", the firm total drops to 20 hours across 3 days.

**Weak, worth asking her about: 2 days, 16 hours**

- **10-08, 8h** (`5919b6a`): The commit was authored on 09-29, before the billing period, and only committed on 10-08. That fits a rebase or cherry-pick, so the work may belong to an earlier invoice or to 09-29.
- **10-02, 8h** (`f0ed7a8`): The author name is right but the email is a GitHub noreply address (it's a "(#51)" PR merge). It's probably her, but it isn't the same identity as her other commits. I treated it as fine.

**Supported:**
- 10-01: 8h
- 10-02: 8h
- 10-07: 6h
- 10-09: 4h
- 10-14: 8h
- 10-15: 8h

Those commits are real, authored by her and on the right date.

The commit on 10-12 ("Fix feed lang attribute") isn't billed on any day. 10-12 was a Sunday.

Commit history only shows that work was committed, not how long it took. These findings show which days lack evidence, not that she didn't work them. It's worth asking her about the 10-13 hash, since a typo or an unpushed commit is possible.