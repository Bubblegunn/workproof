# Statement of Contributions to the Go Logging Library

**Contributor:** Tomás Alvarez
**Employer:** Northwind
**Start date at Northwind:** 3 March 2025 (as stated by Tomás Alvarez; not verifiable from the repository)
**Source:** The library's private git repository. This statement is based only on the commit history (author names, dates, file changes and commit messages). It does not rely on any other records.

## How to read this statement

The library is a Go logging library. It was not started at Northwind. The history contains several hundred earlier commits from 2019 to 2024 by other people. Tomás Alvarez did not write those.

Six commits in the history name Tomás Alvarez as author. A seventh commit, written by a colleague, names them as co-author. Only the commits dated on or after 3 March 2025 count as work done while employed at Northwind. They are listed below in three groups.

## A. Commits authored by Tomás Alvarez on or after 3 March 2025

| Date | Commit | What the commit did |
|---|---|---|
| 10 Mar 2025 | `4e129b6` | Added a "trace-ID hook" for passing trace identifiers through a program's context. The commit adds one source file (50 lines) and one test file (34 lines). |
| 8 Apr 2025 | `735aaa3` | Added one file of "generated level strings" (1,803 lines). The file's header says it was produced by the `go generate` tool and is not edited by hand. The line count therefore does not measure hand-written code. |
| 12 May 2025 | `084addb` | Moved two existing formatter files (`formatter.go`, `json_formatter.go`) into a new `formatters/` directory. This was a reorganisation. No lines of code were changed. |

## B. Co-authored work

- **24 Mar 2025, commit `dbd09a0`, "Rework hook dispatch for concurrency."** The commit author is a colleague, Wei Zhang. The commit message lists Tomás Alvarez as co-author. The commit adds 43 lines to `hooks.go`. The history does not show how the work was divided between the two people, so this statement does not claim any particular share.

## C. Commits not counted, and why

- **`ba8bfca`, "Add redaction formatter."** The author is Tomás Alvarez and the commit adds one file (82 lines). Its recorded date is 1 January 2031. That date is in the future and cannot be correct. The most likely explanation is a wrong clock or edited date, but the history cannot confirm this. The commit is therefore **not** counted as work done since 3 March 2025. It should be included only if the true date is confirmed from another source, such as the code-review or merge record.
- **`d5fa912`, "Add WithContextFields helper."** The recorded time is 2 March 2025 at 23:30 in a UTC-8 time zone. That is still 2 March at the author's location. It is 3 March in UTC. Because the date falls on the start date or one day before it, depending on the time zone, it is **not** counted.
- **`4f4e669`, "Add JSON field-order option."** The recorded date is 24 February 2025. This is before the start date. It also uses a different email address (a personal one, not Northwind's). It is **not** counted as Northwind work.

## Summary of what the records support

Since 3 March 2025, the history shows that Tomás Alvarez:

1. Wrote the trace-ID hook and its test (10 March 2025).
2. Added a generated file of level strings (8 April 2025).
3. Reorganised the formatter files into their own directory (12 May 2025).
4. Is credited as co-author, with a colleague, on one rework of how hooks run concurrently (24 March 2025).

This statement does not describe how well the code works, how widely it is used, or its business impact. The repository history does not record those things.

## Notes for the lawyer

- Commit dates and author names can be set by the person making the commit. For stronger evidence, they should be backed by merge or pull-request records, review approvals, or a letter from a Northwind manager.
- The 2031 date on `ba8bfca` should be explained before this statement is relied on or shared. If the commit really belongs after 3 March 2025, a sentence can be added to Group A.
- The statement does not mention the start date of employment as a fact from the repository. That date comes from Tomás Alvarez and should be confirmed by an employment letter.
