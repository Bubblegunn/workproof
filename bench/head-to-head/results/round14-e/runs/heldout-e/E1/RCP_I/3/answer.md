I've written `PROMOTION_EVIDENCE.md` in this folder. I built it from `git log` rather than the receipts miner. The miner only reads Claude Code session transcripts for the last N days, so it can't cover January to June and doesn't measure delivery.

**What you delivered (by author date):**
- You authored 12 non-merge commits in the window, and 8 of them are substantive work.
- That work is JSON export plus a fix for empty cells, export options (reviewed in PR #41), and a command-line flag for JSON export.
- It also includes about 145 lines of tests and about 40 lines of pagination docs.
- Feature code comes to roughly 157 lines kept in the codebase.

**What I left out so the numbers hold up:**
- The 30,000-line benchmark dataset.
- The generated 1,800-line lockfile.
- The cache pagination commit and its revert, which net to zero.
- The merge of Tomasz's side branch.
- Colleagues' work, including Lena's sorting feature and Tomasz's CSV dialect option.

**Caveats you should check before submitting:**
- **CLI flag dating:** it was authored on 28 Jun but committed on 3 Jul. I counted it by author date, so it falls inside the window. By commit date it falls outside.
- **December commits:** two unit-helper fixes were authored in December and committed in January. I excluded them.
- **Second identity:** one commit on 20 Jan uses a laptop identity ("priya"). I counted it as yours based on the name, timing and subject.
- **Net-deletion test commit:** the 2 Jun test commit removes more lines (119) than it adds (55). Be ready to explain it.
- **Review credit:** Tomasz's commit message thanks you for a review, but git can't verify that. Get his confirmation or the PR thread.

The file also lists what git can't show and you should add yourself: why you reverted the cache pagination, your review work, who used the export features, and mentoring. It contains no code and no dollar or "hours saved" figures.