I wrote `contribution-statement.md` in this folder from the git history. I didn't run the receipts skill's miner, because it reports Claude Code usage rather than who authored which commits, so it couldn't answer your question.

**What the statement counts** (4 commits since 3 March 2025):
- **Trace-ID hook (10 Mar):** you're the sole author. It adds 84 lines, including its test, and it's the only hand-written code credited to you alone.
- **Hook dispatch rework (24 Mar):** you're listed as co-author only. Wei Zhang wrote and committed it, and the statement says so.
- **Generated level strings (8 Apr):** you authored the commit, but the 1,803 lines are `go generate` output. The statement labels it that way so nobody reads it as hand-written.
- **Move formatters into `formatters/` (12 May):** a pure file move, with no lines of code added or removed.

The statement also says the repo started as a copy of the open-source logrus library, so the original code isn't yours.

**What I left out, and why:**
- **JSON field-order option (24 Feb 2025):** it predates your start and was committed under your personal email.
- **`WithContextFields` (23:30 on 2 March, US Pacific):** this is the day before your start in local time, though it's early 3 March in UTC. I excluded it so the statement doesn't depend on how the date is read. You may want to raise that with your lawyer.
- **Redaction formatter:** its recorded date is 1 January 2031, which can't be right. It sits between April and May 2025 commits, but the history can't confirm that. If Northwind can confirm when it was written, it could be added.

The statement also notes that git dates and names are self-reported and that commits don't capture design or review work.