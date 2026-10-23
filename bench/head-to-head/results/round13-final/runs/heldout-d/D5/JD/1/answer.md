I flagged 5 of the 11 billed days, which is 40 of the 82 billed hours. I compared each day's date and commit hash in `timesheet.csv` against the git history. Commit counts are lines changed.

**Not supported**

| Date | Hours | Problem |
|---|---|---|
| 10-10 | 8 | The listed commit `01eae32` is a merge commit. It has no code of its own and only pulled in Chris Meyer's one-line release-notes commit. |
| 10-13 | 8 | The listed commit `9f3e1ab` doesn't exist in the repo, and no commit of any kind is dated 10-13. |
| 10-03 | 8 | `646d9df` was authored by "Lena **Hofmann**" (one "f") with the email l.hofmann@other-agency.example. That is a different name and domain from Lena Hoffmann's, so it may be someone else's work. |

**Weakly supported**

| Date | Hours | Problem |
|---|---|---|
| 10-06 | 8 | `98288e0` ("Trim trailing whitespace") changes one line. It is real and hers, but it doesn't show an 8-hour "code quality" day. |
| 10-08 | 8 | `5919b6a` was authored on **09-29** and only committed on 10-08. It was probably rebased or amended, so it shows work from before the billing period rather than on 10-08. |

Those five days come to 40 hours. Three days (10-03, 10-10, 10-13) are 24 hours of clear problems. The other two (10-06, 10-08) are 16 hours of weak support.

**Supported**
- 10-01, 10-07, 10-09, 10-14 and 10-15 each have a substantive commit of hers on that date.
- 10-02 (`f0ed7a8`) is also fine. It uses a GitHub noreply email, but the name matches and it is a PR merge.

Billed hours don't have to match commit counts, and she may have done work that wasn't committed. This check only shows what the repo backs up. Her 10-12 commit `12cab59` (a Sunday) isn't billed anywhere, so she might have done some of this work on a different day. I'd ask her for the correct hash for 10-13, and about the Hofmann commit, the 09-29 date, and the 10-10 merge, before paying those days.