I found two billed days that clearly aren't supported, which comes to **16 billed hours**. Three more days are weakly supported and add up to another 24 hours. The commits and dates below come from `git log`. The timesheet has 11 billed days and 77 hours in total.

**Not supported (16 h)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| 2025-10-03 | 8 | `646d9df` "Tag cleanup" | The author is "Lena **Hofmann**" (one "f") with an `@other-agency.example` email. That is a different identity from Lena Hoffmann's `lena@hoffmann-dev.example`, so it may be someone else's commit or work for another client. |
| 2025-10-13 | 8 | `9f3e1ab` "performance work" | This commit doesn't exist in the repo. There are no branches besides `main`, and no commits at all between 10-12 and 10-14. |

**Weakly supported (24 h)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| 2025-10-06 | 8 | `98288e0` | The commit changes one line, trimming trailing whitespace, and is described as "code quality". That doesn't look like 8 hours of work. |
| 2025-10-08 | 8 | `5919b6a` | The author date is 2025-09-29 and only the commit date is 10-08. The work was written before the billing period and the commit was probably amended or rebased on 10-08. It is also the only commit for that day. |
| 2025-10-10 | 8 | `01eae32` | This is a merge commit that only pulled in Chris Meyer's one-line `RELEASE_DRAFT.md` change. It contains no code of Lena's own, and it is billed as "integration and sync". |

**Supported**
- 10-01 (`209a5e0`), 10-07 (`53b9ab8`, 6 h), 10-09 (`790a212`, 4 h), 10-14 (`6fa4c10`) and 10-15 (`7cb119e`) all match a commit by Lena Hoffmann on that date.
- 10-02 (`f0ed7a8`) was committed under `lena.hoffmann@users.noreply.github.example`. The name matches and it's probably her GitHub identity, but it's worth confirming with her.

**Other things I noticed**
- Commit `12cab59` on 10-12 is by Lena but isn't billed.
- Commit `ac9a699` (09-30) is also outside the billing period.
- The timesheet's commit hashes are the only link between each billed day and the git history. A commit shows that something was done, not how long it took. Even the supported days are only checked for having a commit, not for the hours billed.
- Hours can also be real without a commit, such as meetings or review. The 10-06 and 10-10 days may be worth asking Lena about before you reject them.