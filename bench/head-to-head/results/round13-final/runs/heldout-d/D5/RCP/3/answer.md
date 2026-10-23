Of the 11 billed days (67 hours), 5 days (36 hours) aren't properly supported by the git history. Four of them (28 hours) are clear-cut, and one (8 hours) is a judgment call. I checked each commit's author, author date, and contents against the timesheet.

**Not supported (28 hours)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| Oct 3 | 8 | 646d9df | The author is "Lena **Hofmann**" with the email l.hofmann@other-agency.example. That is a different name and a different agency's address, so it isn't clearly her work. |
| Oct 8 | 8 | 5919b6a | The author date is Sep 29, and it was only committed on Oct 8. The work predates the billed day. |
| Oct 10 | 8 | 01eae32 | This is a merge commit. Its only change is a one-line `RELEASE_DRAFT.md` file, which Chris Meyer wrote in a00f0e5. It contains no work of hers. |
| Oct 13 | 4 | 9f3e1ab | This commit doesn't exist in the repo, and there is no commit of any kind between Oct 11 and Oct 13. |

The Oct 13 timesheet row says 8 hours, but the billed total I'm counting for it is the 8-hour entry: 8 + 8 + 8 + 8 = 32. Let me correct that: the four clear-cut days are 8 + 8 + 8 + 8 = **32 hours**, not 28.

**Weak, worth questioning (8 hours)**
- **Oct 6, 8 hours, 98288e0:** the commit is a one-line whitespace trim in `space.rb`. It's real and dated correctly, but it's thin backing for a full 8-hour day. It's possible she did other work that wasn't committed.

**Totals**
- Clearly unsupported: 4 days, **32 hours** (Oct 3, 8, 10, 13).
- Including the Oct 6 whitespace day: 5 days, **40 hours**.

The other six days check out. For each one, the commit is hers, the author date matches the billed date, and the change is real. They are Oct 1, 2, 7, 9, 14 and 15.

**Caveats**
- Oct 2 (f0ed7a8) was committed under a GitHub noreply email instead of her usual one. The name matches, so I treated it as hers.
- Git history can't prove hours were worked. I only checked that the commits exist and line up with the billed days. Unsupported days could still be legitimate work that wasn't committed, such as meetings or work on another branch, so it's worth asking her before disputing anything.
- Oct 3 is the one to raise carefully. It may be a typo in the author name, or it may be another person's work.