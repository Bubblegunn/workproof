I checked each billed day in `timesheet.csv` against the git history. Three days (20 hours) aren't supported, and two more (16 hours) are questionable.

**Not supported: 20 hours**

| Date | Hours | Why |
|---|---|---|
| Fri Oct 3 | 8 | Commit `646d9df` ("Tag cleanup") was authored by "Lena **Hofmann**" with the email `l.hofmann@other-agency.example`. That's a different name and a different agency, not her usual `lena@hoffmann-dev.example`. It may be someone else's work, or work done for another client. |
| Fri Oct 10 | 8 | Commit `01eae32` is only a merge of `main` into her branch. Its one-line diff is Chris Meyer's `RELEASE_DRAFT.md` from Oct 9. She wrote no code of her own that day. |
| Mon Oct 13 | 8 | Commit `9f3e1ab` ("performance work") doesn't exist in the repo, in any branch or by message search. The only commit near that date is `12cab59` ("Fix feed lang attribute"), a 14-line file she committed on Sunday Oct 12 and didn't bill. |

**Questionable: 16 hours**

| Date | Hours | Why |
|---|---|---|
| Mon Oct 6 | 8 | Commit `98288e0` is a single-line trailing-whitespace fix, billed as 8 hours of "code quality". The commit exists, but it doesn't show a day's work. |
| Wed Oct 8 | 8 | Commit `5919b6a` ("atom self links") has an author date of Sep 29 and a commit date of Oct 8. It was rewritten or rebased, so the work probably happened on Sep 29, before this billing period. |

**Supported:** Oct 1, 2, 7, 9, 14 and 15. These have real commits by her on those days, though git can't show the hours billed. The Oct 2 commit uses a GitHub noreply email, but the name matches and it's plausibly hers.

**Totals:** She billed 78 hours. 20 hours are unsupported, and 36 are in doubt if you count the questionable days too.

Git only shows that commits exist and when they were made. A commit isn't proof of how long the work took. I'd ask Lena about the Oct 3 author, the missing `9f3e1ab`, and the Oct 8 dates before disputing the invoice.