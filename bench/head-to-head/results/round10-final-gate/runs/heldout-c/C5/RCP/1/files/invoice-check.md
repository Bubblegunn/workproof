# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Short version:** The repo history shows real work for most line items, but it can't confirm the hours. Two items have wrinkles worth asking Luka about before paying in full.

Git history records *what* was changed and *when*. It doesn't record how long anything took, so none of the hour counts can be verified from it. The notes below only say whether each item has matching work.

| # | Invoice item | Hours billed | What the history shows | Assessment |
|---|---|---|---|---|
| 1 | Sitemap exclusion by front-matter flag | 20 | Three commits by Luka on 9 Sep 2025 (feature, tests, README note), about 2 hours apart (10:05 to 12:19). About 58 lines added. | Work exists. The commits are small and span about 2 hours, so 20 h is hard to match to them. Ask what else took the time. |
| 2 | Multi-language (hreflang) support | 24 | Three commits by Luka (17, 18 and 26 Sep), but **only on the unmerged branch `feature/hreflang`**, not on `main`. The last commit is labelled "WIP". | Work started but not finished or delivered. Billing the full 24 h for a feature that isn't in the product is questionable. |
| 3 | Performance: cache generated sitemap | 12 | One commit (22 Sep, 40 lines), authored by **Nora Fisher**, not Luka. Her email is on the same company domain as Luka's (lp-dev.example). | Work exists, but Luka didn't write it. It may be fine if Nora works for LP Dev and the contract allows subcontracting. Confirm that. |
| 4 | Fix CI on Ruby 3.3 | 6 | One commit by Luka dated **3 Oct 2025**, which is outside the September billing period. It rewrote the CI file (8 lines added, 52 removed). | Work exists, but it is dated after the period. Ask whether it belongs on the October invoice. |

Also in September: a "Update dependencies" commit by Luka (15 Sep) that isn't billed as its own line. It adds a 306-line `Gemfile.lock`.

## What the history supports
- Luka made commits on 9, 15, 17, 18 and 26 Sep, and 3 Oct. Each of the four items has at least some matching work.
- Luka's own work visible in September covers items 1 and 2 (the latter unmerged).

## What it doesn't support
- **Any specific number of hours.** Commit timestamps show when work was saved, not how long it took.
- **Item 2 as a finished deliverable.** It's only on a side branch and ends in a WIP commit.
- **Item 3 as Luka's personal work.** Someone else wrote it.
- **Item 4 as September work.** It's dated 3 Oct.
- Work that doesn't leave commits (research, meetings, debugging, review) wouldn't show up either. That could account for some hours, but only Luka can say.

## Suggested questions for Luka
1. How were the 20 h for item 1 spent, given the commits span about 2 hours?
2. Is the hreflang work finished? Will it be merged, and is the full 24 h due for work in progress?
3. Did Nora Fisher do the caching work, and is she covered by your agreement with LP Dev?
4. Should the CI fix (3 Oct) be on the October invoice instead?
5. Can you provide time logs or notes backing the hours?

## Caveats
This check used only the git history in this repo (including the `feature/hreflang` branch). I didn't run the code or judge its quality. Commit dates and authors can be set by the committer, so they're good evidence but not proof.
