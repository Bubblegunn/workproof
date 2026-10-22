I've written `contribution-statement.md` from the git history. It counts three commits of yours as Northwind work, plus one co-authored commit, and leaves out three others. The file changed on disk after I wrote it; I only ran a find-and-replace on it, so that is likely the cause.

**Counted:**
- **10 Mar 2025:** the trace-ID hook and its test.
- **8 Apr 2025:** a generated level-strings file. The statement notes it was produced by `go generate`, so its 1,803 lines aren't hand-written.
- **12 May 2025:** moving the formatter files into `formatters/`. The statement says plainly this was a reorganisation with no code changes.
- **24 Mar 2025:** the hook-concurrency rework by Wei Zhang, where you are listed as co-author. I claimed no particular share of it, because the history doesn't show how the work was split.

**Left out, and the statement says why:**
- **"Add redaction formatter" (`ba8bfca`):** its recorded date is 1 January 2031, which can't be right. Please find out what happened there. If you can confirm the real date from a merge or review record, it can be added.
- **"Add WithContextFields helper" (`d5fa912`):** dated 2 March 2025 at 23:30 local time (UTC-8), which is 3 March in UTC. That is too close to your start date to claim.
- **"Add JSON field-order option" (`4f4e669`):** dated 24 February 2025, before you joined, and made with a personal email address.

The statement makes no claims about code quality or impact, since git doesn't record those. It also says your start date comes from you rather than from the repository. Your lawyer may want a manager's letter or pull-request records to back up the commit dates, since authors can set those themselves.