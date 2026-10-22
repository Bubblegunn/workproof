I wrote the statement to `contribution-statement.md`. Please read the points below before it goes to your lawyer.

**Counted as your work (3 March 2025 or later):**
- `4e129b6`, 10 Mar: the trace-ID hook, with its test file. It adds 84 lines.
- `735aaa3`, 8 Apr: generated level strings. It adds 1,803 lines, all machine-generated, and the statement says so.
- `084addb`, 12 May: a move of two files into `formatters/`, with no code changes. The statement calls it a reorganisation.

**Left out or flagged:**
- **Wei Zhang's "Rework hook dispatch" commit (`dbd09a0`):** it lists you as co-author. The statement mentions it but doesn't claim a share, because the history doesn't show how the work was split.
- **`d5fa912`, "Add WithContextFields helper":** it's dated 2 Mar 2025 at 23:30 Pacific, which is 3 Mar in UTC. I excluded it as the safer reading. If you actually did this work on or after 3 March, tell me and I'll move it into the counted list.
- **`4f4e669`, "Add JSON field-order option":** it's dated 24 Feb 2025, before you joined, and uses your personal email. I excluded it.
- **`ba8bfca`, "Add redaction formatter":** its date is 1 Jan 2031, which can't be real. I did not count it. Please confirm the real date from your pull-request or review records. Don't rewrite the history to fix it.

**The code itself:** the files I opened (`hook_trace.go`, `hook_trace_test.go`, `redact.go`) contain only repetitive placeholder functions, not real hook or redaction logic. I couldn't confirm what the code does, so the statement relies on commit titles only. It makes no claims about functionality or impact.

I only looked at the git history. Your lawyer may want to add anything you did that git doesn't record, such as design work or code review, from other sources.