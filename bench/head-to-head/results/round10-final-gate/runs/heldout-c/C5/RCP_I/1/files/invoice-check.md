# Invoice INV-0042 check (Luka Petrovic, September 2025, 62 h)

**Bottom line:** The repo history shows that work happened on all four invoiced items. It cannot confirm the hours. Two items have complications, and one is unfinished work.

Commit history records what changed and when. It does not record time spent. A small commit can take a day, and a large one can take minutes (for example, an auto-generated file). So "supported" below means the work exists, not that the hours are right.

| Invoice item | Hours billed | What the history shows | Assessment |
|---|---|---|---|
| 1. Sitemap exclusion flag | 20 | 3 commits by Luka on 9 Sep (feature, tests, docs), about 58 lines in total, made within roughly 2 hours of each other. | Work is real. 20 h looks high for the size of the change, but there is no way to see the time from history. |
| 2. Multi-language (hreflang) support | 24 | 3 commits by Luka (17, 18 and 26 Sep), about 100 lines. They are **only on the unmerged branch `feature/hreflang`, not on `main`**. The last commit is labelled "WIP". | Work started but not finished or delivered. Billing 24 h in full for it is a question to raise with Luka. |
| 3. Cache generated sitemap | 12 | One commit of 40 lines on 22 Sep, **authored by Nora Fisher** (a different person, though with the same `lp-dev.example` email domain). | The work exists, but it is not Luka's commit. Ask whether Nora is part of LP Dev and whether her time is meant to be on Luka's invoice. |
| 4. Fix CI on Ruby 3.3 | 6 | One commit by Luka on 3 Oct, which is **after the September billing period**. It is a small config change. | Work is real but is dated October. Check whether it belongs on this invoice. |

## Other observations
- Luka's "Update dependencies" commit (15 Sep) is 306 lines. That is an auto-generated lock file, so the size says little about effort. It matches no invoice line.
- Total committed activity by Luka in September is 6 commits on 4 days (9, 15, 17, 18 and 26 Sep, counting the unmerged branch). This is light for 62 hours, but people also spend time on design, research, debugging and meetings that never show up in commits.

## Suggested questions for Luka
1. Can you share a timesheet or breakdown behind the 62 hours, especially the 20 h for item 1 and the 24 h for item 2?
2. Item 2 is unmerged and marked WIP. Is it finished? Should it be billed in full now?
3. Who is Nora Fisher, and is item 3 her work?
4. Item 4 was committed on 3 Oct. Was the work done in September?

*Based only on the git history in this repo, including the `feature/hreflang` branch. Work done elsewhere (other repos, private branches, non-code work) would not appear here.*
