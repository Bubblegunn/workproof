Five of the eleven billed days aren't properly supported by the git history. That is 40 of the 85 billed hours. I read this from the commit data alone and haven't looked at the code itself.

| Date | Hours | Problem |
|---|---|---|
| 2025-10-03 | 8 | Commit `646d9df` is by "Lena **Hofmann**" `<l.hofmann@other-agency.example>`. The name is spelled differently and the email is from a different agency. It adds a 15-line file named `hofmann_tags.rb`. It doesn't appear to be her commit. |
| 2025-10-06 | 8 | Commit `98288e0` changes one line, removing trailing whitespace. That doesn't support a full day. |
| 2025-10-08 | 8 | Commit `5919b6a` was authored on 2025-09-29 and only committed on 10-08. The work predates the billing period, so it doesn't back a 10-08 day. |
| 2025-10-10 | 8 | Commit `01eae32` is a merge commit. Its only change is one line in `RELEASE_DRAFT.md`, which came in from `main` through `a00f0e5` (a "release notes draft" commit). It isn't a day of her own work. |
| 2025-10-13 | 8 | Commit `9f3e1ab` doesn't exist in the repo, including all branches and the reflog. No commits are dated 10-13 either. |

The other six days check out:
- **10-01, 10-07, 10-09, 10-14, 10-15:** each has a real commit by her on that date with matching content.
- **10-02:** the commit `f0ed7a8` uses a GitHub noreply email instead of her usual one. The name matches and it references PR #51, so it's probably hers. You could confirm that against the PR.

- **Missing evidence on billed days:** the sheet bills full 8-hour days for days that show a single commit. Commits can't show hours worked, so even the supported days only prove she did something that day.
- **Commit the sheet doesn't claim:** `12cab59` ("Fix feed lang attribute") is dated 10-12, a Sunday. It isn't billed anywhere.
- **Dates:** the timesheet dates are in 2025, matching the commits, although the invoice is described as October of this year.

I'd ask Lena for the real hash for 10-13, and for whatever else backs 10-03, 10-06, 10-08 and 10-10. That might be PRs, tickets or non-code work.