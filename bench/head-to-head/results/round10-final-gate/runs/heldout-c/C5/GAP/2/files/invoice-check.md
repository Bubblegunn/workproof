# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

Source: the repository's commit history. Commit history shows what changed and when. It does not show how long the work took, so none of the hour counts can be confirmed or refuted from it.

| Invoice line | Hours | What the history shows |
|---|---|---|
| 1. Sitemap exclusion by front-matter flag | 20 | **Supported.** Three commits by Luka on 9 Sep 2025 (feature, tests, documentation) are on the main branch. They are small (about 58 lines added) and all fall within about 2 hours of each other. History can't show whether 20 h is reasonable. |
| 2. Multi-language (hreflang) support | 24 | **Partly supported, and unfinished.** Three commits by Luka (17, 18 and 26 Sep) exist, but only on a separate branch, `feature/hreflang`. They are not in main. The last one is labelled "WIP" (work in progress) and adds 2 lines. The history shows a started feature, not a delivered one. |
| 3. Cache generated sitemap | 12 | **Not supported as Luka's work.** The one matching commit (22 Sep) was written by a different person, **Nora Fisher**, who has an `@lp-dev.example` address (same domain as Luka). It may be a colleague at Luka's company, but the invoice is in Luka's name only. |
| 4. Fix CI on Ruby 3.3 | 6 | **Dated outside the billing period.** The commit is by Luka but dated **3 Oct 2025**, after the period ends on 30 Sep. The commit date could be set to anything, so this is a flag, not proof. |

Also in September: Luka's "Update dependencies" commit (15 Sep) is not on the invoice. It is a machine-generated lock file, so it likely took little time.

## Summary

- Hours with a clear match in September, in Luka's name and in main: line 1 only (20 h).
- Hours that need a question to Luka: line 2 (24 h, unmerged and unfinished), line 3 (12 h, authored by Nora Fisher) and line 4 (6 h, dated October). Together that is 42 h.
- The history can't confirm or refute any of the 62 total hours. Hours would have to be backed by timesheets or similar records.

## Suggested questions for Luka

1. Is the hreflang feature finished? If so, where is the final code? If not, should line 2 be billed in full?
2. Did Nora Fisher do the caching work, and is she authorised to work on this account? Is she billed under this invoice?
3. Was the CI fix done in September and committed late, or done in October (which would belong on the next invoice)?
4. Can you provide time records for the 62 hours?

*Limit of this check: only the git history was reviewed. Work not committed (meetings, investigation, review) would not appear. Commit dates and authors are self-reported by the committer's tools.*
