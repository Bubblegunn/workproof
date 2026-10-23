Five of the 11 billed days aren't properly supported by the git history. That is 40 of the 76 billed hours. I read the history directly with git instead of `npx workproof figures`, because these are another person's claims.

| Date | Hours | Commit | Problem |
|---|---|---|---|
| 10-03 | 8 | 646d9df | The commit is authored by "Lena **Hofmann**" with an `@other-agency.example` email, not Lena Hoffmann at her usual address. It adds a 15-line file named `hofmann_tags.rb`. It may be a different person or another client's work, and it's unconfirmed until Lena explains it. |
| 10-06 | 8 | 98288e0 | The commit only trims trailing whitespace, a 1-line change with no real content. |
| 10-08 | 8 | 5919b6a | This commit was authored on 2025-09-29 and only committed on 10-08, so the work predates the window. It looks like a rebase or replay. |
| 10-10 | 8 | 01eae32 | This is a merge commit ("Merge branch 'main' into lena/sync") with no work of its own. |
| 10-13 | 8 | 9f3e1ab | This commit doesn't exist anywhere in the repo, on any branch. |

**Supported days (6 days, 36 hours):**
- 10-01 (8h)
- 10-02 (8h)
- 10-07 (6h)
- 10-09 (4h)
- 10-14 (8h)
- 10-15 (8h)

Each of these has a real commit by Lena on the claimed date.

**Notes:**
- **10-02:** I included it. The commit is authored as "Lena Hoffmann" with a GitHub noreply address (`lena.hoffmann@users.noreply.github.example`) instead of her usual email. I treated that as the same person, so please confirm it.
- **Limits of this check:** Git shows that a commit exists and when it was authored. It doesn't show how long the work took, so the hour counts on the supported days are unverified. Her only commit outside the billed days is 12cab59 on 10-12, which isn't billed.
- **Gap-closing:** If Lena can show that the 10-03 commit is hers, that day moves to supported and the total drops to 32 hours. She could also give the correct hash for 10-13 and any real work for 10-06, 10-08 and 10-10.