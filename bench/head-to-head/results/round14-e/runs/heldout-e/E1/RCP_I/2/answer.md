I wrote `PROMOTION_EVIDENCE.md` in the repo folder. It covers 1 Jan–30 Jun 2026 and contains no code.

**What it says you delivered**
- **Scale:** 10 substantive commits, one of them a revert, adding about 340 hand-written lines that were kept. That counts feature code, tests and docs. It comes to about 460 if you count the reverted pagination experiment.
- **Features:** JSON export (Jan), export options (Mar), and a CLI export flag (Jun). Tests cover the JSON export and the sorting feature. There is also pagination documentation.
- **Gaps in the months:** Your substantive commits fall in Jan, Mar, Apr and Jun only.

**What I left out or discounted**
- **Generated and data files:** Your Feb commits added a ~30,000-line sample dataset and a ~1,800-line generated lock file. I excluded both because they would swamp everything else.
- **Other people's work:** Stable sorting was Lena Fischer's. The CSV dialect option and PR #41 were Tomasz Varga's. His commit message thanks you for a review, which git can't measure. The report says to cite it by hand if reviewers can confirm it.
- **The sorting test rewrite:** In June you rewrote an existing test file, adding 55 lines and deleting 119. I reported it as a net reduction.
- **The 11 May merge:** I excluded it as integration, not authorship.
- **Outside the window:** Your 14 Jul docs commit falls after 30 Jun, so it isn't counted.

**Caveats**
- **Second identity:** Three commits are under `priya@priya-laptop.invalid`. I counted the 20 Jan fix (about 5 lines) as yours. I excluded two unit-helper commits (about 50 lines) because they were authored on 29–30 Dec and only committed in Jan. Please confirm they're yours. If they are, the totals go up.
- **No Claude Code data:** The `/receipts` miner found no Claude Code sessions for this repo on this machine, so every figure is from git alone. I didn't save the usual `~/claude-code-receipts-*.md` and `.html` files, since they would be empty.

Git can't show impact, such as who used the export feature, why the pagination cache was reverted, or any design or mentoring work. The report suggests adding a few of those stories yourself.