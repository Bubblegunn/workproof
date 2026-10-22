# Invoice INV-0042 (Luka Petrovic, September 2025): check against repo history

**Bottom line:** The history shows real work for each of the four items. It cannot confirm the 62 hours. Git records what was saved and when. It doesn't record how long anything took. Several points deserve a question to Luka before payment.

## What the history shows, item by item

| Invoice item | Hours billed | What the history shows | Assessment |
|---|---|---|---|
| 1. Sitemap exclusion flag | 20 | 3 commits by Luka on 9 Sep, between 10:05 and 12:19 (code, tests, docs). About 58 lines added. | Work is present and on `main`. The commits span about 2 hours 15 minutes. 20 hours is a lot for that, unless there was unrecorded effort such as design, review or testing. |
| 2. Multi-language (hreflang) | 24 | 3 commits by Luka (17, 18 and 26 Sep) on a side branch, `feature/hreflang`. **Never merged into `main`.** The last commit is labelled "WIP" and adds only 2 lines. | Partly supported. Work started, but it is unfinished and not delivered. Ask whether 24 h is for finished work. |
| 3. Cache generated sitemap | 12 | One commit, 22 Sep, adding a 40-line file. **Authored by Nora Fisher, not Luka** (same `lp-dev.example` email domain). The content is 10 near-identical placeholder functions (`cache_1` to `cache_10`, each just adds a number). It doesn't look like a working cache. | Weak. Someone other than the contractor wrote it, and it doesn't look like real caching code. |
| 4. Fix CI on Ruby 3.3 | 6 | One commit by Luka, **3 Oct 2025, which is outside the September billing period**. It replaces the whole CI configuration (52 lines removed, 8 added). That removes the old Ruby/Jekyll version testing and the gem-build check. | Work is present, but it is dated after the period. Also check whether you wanted the old test coverage removed. |

## Other observations

- **Total activity is small.** Luka made 6 commits on `main` in September, plus 3 on the unmerged branch. Another commit, "Update dependencies" (15 Sep), is a generated lockfile and isn't on the invoice.
- **Timestamps are not hours.** Commits on a single day or two cannot show 62 hours of effort. Work like research, meetings or debugging leaves no commit.
- **Nora Fisher** appears only on the caching commit. Ask whether Nora is a subcontractor and whether you agreed to that.
- The invoice file was added to the repo by Maya Chen on 6 Oct. Nothing in the repo ties it to the commits.

## Suggested questions for Luka

1. Can you give a breakdown of time for items 1 and 2? What was the work beyond the committed code?
2. Is the hreflang work finished? Where is it, and why isn't it merged?
3. Who is Nora Fisher, and is the caching code the real implementation?
4. Why is the CI fix dated 3 Oct, and why were the older test setups removed?

## Limits of this check

This is based only on this repository's git history (author, date, files changed). I did not run the code or review its quality. Commit dates are set by the committer's computer and could be edited, so treat them as indicative, not proof. Nothing here proves the hours are wrong. The history just doesn't prove them, and it raises the questions above.
