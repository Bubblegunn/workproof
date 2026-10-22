# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history confirms that work was done on some of the invoiced items. It does not confirm the hours, and two line items don't match the history cleanly. I'd ask Luka for more detail before paying in full.

**Caveat:** Repo history shows what changed and when. It doesn't record time spent. Hours can't be proven or disproven from it, and commit dates can be set by whoever makes the commit. Other work (research, meetings, debugging) leaves no trace in it.

| # | Invoice item | Billed | What the history shows |
|---|---|---|---|
| 1 | Sitemap exclusion flag | 20 h | **Supported that the work exists.** Feature, tests and docs were committed by Luka on 9 Sep, in three commits between 10:05 and 12:19 (about 2 hours apart, start to finish). The code is small (about 60 lines). 20 h is a lot more than the history suggests, though prep or debugging time might not show up. |
| 2 | Multi-language (hreflang) support | 24 h | **Partly supported, and not delivered.** The work is on a separate branch (`feature/hreflang`) and has never been merged into the main code. Three commits by Luka, 17–26 Sep. The last is labelled "WIP" (work in progress) and is 2 lines long. So there's evidence of a start, but not of a finished feature. |
| 3 | Cache generated sitemap | 12 h | **Supported, but not by Luka.** The commit on 22 Sep was authored by **Nora Fisher** (also a `lp-dev.example` address, so probably Luka's firm). That's fine if Nora's time is billed through LP Dev. It's worth confirming. |
| 4 | Fix CI on Ruby 3.3 | 6 h | **Outside the period.** Committed 3 Oct, after the invoice period ended on 30 Sep. It also deleted most of the old test setup (the older Ruby versions tested, and the gem-build check) in favour of a single Ruby 3.3 run. That fixes the problem, but it reduces test coverage. Someone technical should confirm that was intended. |

**Other history in September:** a "Update dependencies" commit on 15 Sep (Luka). It isn't on the invoice.

## What's supported
- Items 1 and 3: the work exists in the main code.
- Item 2: partial work exists, on an unmerged branch.

## What isn't
- The hour counts for any item. The commit timing suggests far less than 62 h of visible work.
- Item 2 as a completed feature.
- Item 4 as September work.
- Item 3 as Luka's own work. It's Nora Fisher's.

## Suggested questions for Luka
1. How were the 20 h on the exclusion flag spent, given the commits span about 2 hours?
2. Is hreflang finished? If not, should the 24 h be billed in full now, or when it's merged?
3. Is Nora Fisher part of LP Dev and covered by this invoice?
4. Item 4 is dated October. Should it move to the October invoice? Was the reduced CI coverage intended?

Based on the repo history only. I did not review code quality or the contract terms.
