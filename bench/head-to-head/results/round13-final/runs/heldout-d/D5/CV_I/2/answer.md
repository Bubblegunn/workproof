Three of the 11 billed days have no valid commit behind them, which is 24 of the 90 billed hours. Two more days are weakly supported and add 16 hours.

**Not supported (24 h)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| 2025-10-03 | 8 | `646d9df` "Tag cleanup" | The author is "Lena **Hofmann**" at `l.hofmann@other-agency.example`, not Lena Hoffmann at `hoffmann-dev.example`. It looks like a different person or identity. It adds one 15-line placeholder file, `hofmann_tags.rb`. |
| 2025-10-10 | 8 | `01eae32` "Merge branch 'main' into lena/sync" | This is a merge commit with no work of its own. Its only change is Chris's release-notes line (`a00f0e5`), pulled in from main. |
| 2025-10-13 | 8 | `9f3e1ab` "performance work" | The commit doesn't exist in the repo, on any branch or in the reflog. No commits are dated 10-13 at all. |

**Weakly supported (16 h)**

| Date | Hours | Commit | Problem |
|---|---|---|---|
| 2025-10-06 | 8 | `98288e0` "Trim trailing whitespace" | This is a one-line whitespace fix in `space.rb`. It's genuine, but it hardly backs 8 hours labelled "code quality". |
| 2025-10-08 | 8 | `5919b6a` "Add atom self links" | The author date is 2025-09-29, before the billing period. It was committed on 10-08, so it was probably rebased or amended. The work may predate the invoice period, and it may already have been billed or done on 09-29. |

**Supported (50 h)**
- 10-01, 10-02, 10-07, 10-09, 10-14 and 10-15 each match a real commit by Lena on the billed date, and each commit adds real code.
- The 10-02 commit uses a GitHub noreply email instead of her usual one. The name matches, so I treated it as hers, but you may want to confirm.
- The hours on those days (8, 8, 6, 4, 8, 8) are claims. Git can't verify them.

**Next steps**
- The 24 hours are the firm number to dispute.
- The extra 16 hours are worth asking Lena about before you decide.
- Commit dates can be set to anything, so this check shows consistency, not proof of work.
- I only used local history. If any of the missing work lives on a fork or an unpushed branch, Lena would need to point you to it.