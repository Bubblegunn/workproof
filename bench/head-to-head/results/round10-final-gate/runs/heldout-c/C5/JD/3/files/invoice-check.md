# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows real work for items 1 and 4 and unfinished work for item 2. For item 3 it shows a commit by a different person. The history can't prove hours worked, only that work was saved and when. I recommend asking Luka for clarification on items 2 and 3 before paying in full.

| # | Invoice item | Billed | What the history shows |
|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | **Supported.** Three commits by Luka on 9 Sep 2025: the feature (32 lines), tests (20 lines) and README docs (6 lines). All were saved within about 2 hours (10:05 to 12:19). That is a small amount of code for 20 h, so ask for a breakdown of the time (design, testing and so on). |
| 2 | Multi-language (hreflang) support | 24 h | **Only partly supported.** The work is not in the main code. It sits on a separate branch, `feature/hreflang`, and has never been merged. Luka made three commits there (17, 18 and 26 Sep): a first version, tests, and a last one labelled "WIP" (work in progress) that adds only 2 lines. The history shows a started feature, not a finished one. |
| 3 | Cache generated sitemap | 12 h | **Not supported as Luka's work.** The one matching commit (22 Sep, "Cache generated sitemap between builds") was written by **Nora Fisher**, not Luka. Her email is at the same company (lp-dev.example), so she may be a colleague or subcontractor. Luka may have reviewed or directed it, but the history doesn't show that. The code is also short (40 lines). |
| 4 | Fix CI on Ruby 3.3 | 6 h | **Supported, with a caveat.** Luka made one commit on 3 Oct 2025. That is after the billing period ended (30 Sep), though it could be September work saved late. It also replaced the whole test setup with a much simpler one (52 lines removed, 8 added). The earlier setup tested several Ruby versions and checked that the package builds. The new one tests Ruby 3.3 only. Someone technical should confirm that is acceptable. |

**Also, "Update dependencies" (15 Sep, Luka).** This commit isn't on the invoice. It is a generated lock file, so it doesn't indicate much effort.

## What the history can't tell us
- **Hours.** A commit has a date, not a duration. Work done off the computer, such as research, meetings or debugging that left no changes, wouldn't appear.
- **Quality.** I checked who did what and when, not whether the code is good. I haven't run the tests.
- **Other branches and other repositories.** I looked at this repository's `main` branch and its one other branch. Work kept elsewhere wouldn't appear here.

## Suggested questions for Luka
1. Item 3: who wrote the caching code, and is Nora Fisher part of your team? Were her hours included in the 12 h?
2. Item 2: is the hreflang work finished? If not, what is left, and should it be billed at 24 h now?
3. Item 4: was the Ruby 3.3 work done in September, and was dropping the older-Ruby tests agreed?
4. Item 1: can you give a time breakdown for the 20 h?

*Prepared from the git history and docs/billing/INV-0042.txt. Times in the history are in Luka's local timezone (UTC+9).*
