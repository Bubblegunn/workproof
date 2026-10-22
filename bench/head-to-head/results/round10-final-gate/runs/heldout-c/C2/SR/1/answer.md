I've written `contribution-statement.md` in this folder. It covers only what the git history records, and it flags several points your lawyer should know about.

**Counted since 3 March 2025:**
- **10 Mar 2025:** you added the trace-ID hook plus its test file (50 and 34 lines).
- **8 Apr 2025:** you committed a 1,803-line file that was produced by `go generate`. The statement says it is generated code, so it doesn't present those lines as hand-written.
- **12 May 2025:** you moved two files into `formatters/`. Zero lines changed, and the statement calls it a reorganization only.

**Handled carefully:**
- **Hook rework on 24 Mar 2025:** Wei Zhang is the author, and you are only a `Co-authored-by`. I made no claim about your share.
- **Redaction formatter:** you are the author, but the commit is dated 1 Jan 2031, which is plainly wrong. I left it undated and suggested confirming the real date from your merge or code-review records.
- **Excluded as pre-joining:** "Add WithContextFields helper" (2 Mar 2025, one day before your start date) and "Add JSON field-order option" (24 Feb 2025, under a `pm.example` email).

**Things to know before sending it:**
- The history shows only 3 commits solely yours and 1 co-authored, so the statement is short and not impressive on its face. I didn't pad it. Work like reviews, design and debugging leaves no commits, and you'd need to document it separately.
- Several source files (`redact.go`, `hook_trace.go`) contain repetitive placeholder-style functions rather than real logging logic. The statement therefore describes each commit only by its title and size, not by what the code does. If this repo is a stand-in or sanitized copy, check that the real one matches before it's used as evidence.