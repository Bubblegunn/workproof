# Statement of Contributions to the Team Go Logging Library

**Contributor:** Tomás Alvarez
**Employer:** Northwind
**Period covered:** 3 March 2025 (start date at Northwind) to the most recent commit in the repository
**Source:** The git commit history of the team's private repository. The repository is a Go logging library whose history also includes many years of work by other people, which is not described here.

## How this was prepared

Each commit in the history was checked for its author name, author email, recorded date and the files it changed. Only commits made with Tomás Alvarez's Northwind email address (tomas.alvarez@northwind.example) on or after 3 March 2025 were considered. The history holds 1,255 commits in total. Since 3 March 2025 there are 5 commits by Tomás Alvarez and 1 by a colleague, which are described below.

Commit dates are written by the committer's own computer and can be set to any value. They are a record, not independent proof. Lines changed is a rough measure of size and says nothing about quality or difficulty.

## Contributions by Tomás Alvarez since 3 March 2025

| Date (as recorded) | Change | What it does | Size |
|---|---|---|---|
| 10 Mar 2025 | Trace-ID hook (`hook_trace.go`) with a test file | Adds a hook that passes a trace identifier through the logging library using Go's context mechanism. | 2 new files, 84 lines (50 code, 34 test) |
| 8 Apr 2025 | Generated level strings (`internal/gen/levels_gen.go`) | Adds a file of log-level name constants produced by Go's `go generate` tool. | 1 new file, 1,803 lines. The file is marked "generated, do not edit", so the line count reflects tool output, not hand-written code. |
| 12 May 2025 | Move formatters into a `formatters/` directory | Reorganizes the code by moving two existing files (`formatter.go`, `json_formatter.go`) into a new folder. | Pure file move. No lines of code were changed. |
| Date unreliable (see below) | Redaction formatter (`redact.go`) | Adds a new file of 82 lines for redacting data in log output. | 1 new file, 82 lines |

## Related work credited to others

- **Rework hook dispatch for concurrency (24 Mar 2025).** This commit was authored by a colleague, Wei Zhang. Tomás Alvarez is named only as a co-author in the commit message ("Co-authored-by"). The history does not show what share of the work was his, so no specific contribution is claimed for it.

## Items deliberately not counted

- **"Add WithContextFields helper"** (`entry_ctx.go`, 26 lines). It is recorded as 2 March 2025, 23:30 in a UTC-8 time zone. That is one day before the start date in local time, and it is 3 March only when converted to UTC. Because the date is ambiguous it is not counted as work done at Northwind.
- **"Add JSON field-order option"** (24 Feb 2025). This was made before the start date and under a different, personal email address. It is not work for Northwind.

## Points an officer or reviewer should be aware of

1. **The redaction formatter has an impossible date.** The commit "Add redaction formatter" is recorded as 1 January 2031. That date is in the future, so it was set incorrectly. By its position in the history it was made between 8 April and 12 May 2025, but the history cannot confirm the actual date. It is listed because it carries Tomás Alvarez's Northwind identity, and the date should be corrected or confirmed with Northwind's records (for example a code-review or ticket record) before it is relied on.
2. **Scale.** In total the work is a small number of changes: one hook with tests, one generated file, one reorganization and one formatter. The history does not show the commits' business impact, whether the code was reviewed or released, or any work done outside this repository.
3. **What git cannot show.** Design discussions, code review, support, meetings and other non-code work do not appear in commit history. Nothing is claimed about them here.
4. **Verification.** The repository is private. Northwind can confirm these entries from it directly, using `git log --author="tomas.alvarez@northwind.example" --since=2025-03-03`.
