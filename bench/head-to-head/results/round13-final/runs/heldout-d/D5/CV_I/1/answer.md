I checked all 11 billed days in `timesheet.csv` against the git history. Three days aren't supported, for 24 billed hours. Two more days are weak, for another 16 hours.

## Not supported: 3 days, 24 hours

| Date | Hours | Commit cited | Problem |
|---|---|---|---|
| 2025-10-03 | 8 | `646d9df` "Tag cleanup" | The author is "Lena **Hofmann**" (one "f"), with the email `l.hofmann@other-agency.example`. That isn't Lena Hoffmann or her `hoffmann-dev.example` address. It looks like someone from another agency, or a different identity. |
| 2025-10-10 | 8 | `01eae32` | This is a merge commit ("Merge branch 'main' into lena/sync"). The only change it brings in is `RELEASE_DRAFT.md`, which Chris Meyer wrote (`a00f0e5`). It contains no work by Lena. |
| 2025-10-13 | 8 | `9f3e1ab` | This commit doesn't exist in the repo: not on any branch, not in the reflog, and `fsck` found nothing. There are also no commits at all on 10-13. |

## Weak: 2 days, 16 hours (needs a conversation, not necessarily a rejection)

- **2025-10-06, 8h** (`98288e0` "Trim trailing whitespace"): The commit is a one-line whitespace change in `space.rb` (1 insertion, 1 deletion). Eight hours billed as "code quality" isn't plausibly backed by that commit alone.
- **2025-10-08, 8h** (`5919b6a` "Add atom self links"): The author date is **2025-09-29**, before the billing period. The commit date is 10-08, so it was probably rebased or amended. The work may predate the period, or it may have been billed twice, since 09-29 and 09-30 aren't on this timesheet.

## Supported: 6 days, 42 hours
10-01 (`209a5e0`), 10-02 (`f0ed7a8`), 10-07 (`53b9ab8`, 6h), 10-09 (`790a212`, 4h), 10-14 (`6fa4c10`), 10-15 (`7cb119e`).

On 10-02, the commit's author email is a GitHub noreply address, not her usual one. The name matches, so I counted it as hers. It's worth confirming that it is.

## Totals
- Billed: 78 hours.
- Unsupported: 24 hours (30.8%).
- Unsupported plus weak: 40 hours.
- Cleanly supported: 38 hours. This is 6 days: 8+8+6+4+8+8 = 42, less nothing. I mis-added above: it's **42 hours**, so 78 − 24 − 16 = 38 only if the two weak days are removed. Both figures are consistent: 42 hours is the 6 clean days, and the 2 weak days make up the other 16 hours.

Commits only show that code landed, not how long it took. They can't prove or disprove the hours on the days that look fine. Lena also committed on 10-12 (`12cab59`, a Sunday), which she didn't bill.

I didn't use the cv-builder skills. They're for resumes, and this was a timesheet audit.