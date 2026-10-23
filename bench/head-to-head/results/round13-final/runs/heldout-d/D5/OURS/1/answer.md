Of the 11 billed days (73 hours), 4 days (32 hours) aren't supported by the commit history. A fifth day (8 hours) is in doubt until you confirm who wrote the commit.

I checked each day's commit using the author date. The history can show whether work exists on a day, but not how long it took.

**Not supported: 32 hours**

| Day | Hours | Problem |
|---|---|---|
| Oct 6 | 8 | The cited commit only trims trailing whitespace, one line. With whitespace ignored, nothing changed. |
| Oct 8 | 8 | The cited commit was written on Sep 29 and only committed on Oct 8, probably after a rebase. The work was done before the period, and nothing else was authored on Oct 8. |
| Oct 10 | 8 | The cited commit is a merge of `main` into her branch. The only change it brought in is a one-line release-notes draft by Chris Meyer, not by her. |
| Oct 13 | 8 | The cited commit (9f3e1ab) doesn't exist in the repository, and nothing was authored on Oct 13 by anyone. |

**Needs your confirmation: 8 hours**
- **Oct 3 (8 h):** The "Tag cleanup" commit (15 lines) is authored by "Lena **Hofmann**", with one "n" and an `other-agency.example` email. Her other commits use "Hoffmann" and `hoffmann-dev.example`. This may be a typo or a second identity, or it may be someone else's work. I haven't counted it as hers. If you confirm it's her, the unsupported total stays at 32 hours. If not, it becomes 40 hours.

**Supported: 33 hours**
- **Oct 1, 2, 7, 9, 14, 15:** Each has a real commit by her on that day. Oct 1 is 8 h, Oct 2 is 8 h, Oct 7 is 6 h, Oct 9 is 4 h, Oct 14 is 8 h and Oct 15 is 8 h.
- **Oct 2:** The commit uses a different email, a GitHub noreply address, with the same name. I included it because of the matching name, so please confirm that's also her.

**Caveats**
- Every supported day is a single small commit of 14 to 40 lines. That's weak backing for 8-hour days, though it doesn't prove anything either way.
- She also made a commit on Sunday Oct 12 (a small lang fix) that she didn't bill.
- The timesheet's dates are in 2025, while today's date in this session is 2026. I treated them as the 2025 days that match the commits.
- I used read-only git rather than `workproof figures`, because this is someone else's claim.
- Next step: ask her about Oct 6, 8, 10 and 13, plus the Oct 3 identity. For Oct 13, ask for the right commit hash or a branch that hasn't been pushed.