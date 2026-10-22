# Statement of Contributions: Tomás Alvarez

**Subject:** Go logging library (private repository), Northwind
**Period covered:** 3 March 2025 (start of employment at Northwind) to the date of the most recent commit in the repository (12 May 2025, with one exception explained in Section 3)
**Source:** The repository's git commit history. This statement says only what the history itself shows.

## 1. Background

The repository is a Go logging library. It started as an open-source project with more than 1,250 commits from many outside contributors, which came before Northwind. Only the work listed below is attributed to Tomás Alvarez. Nothing here claims credit for the library as a whole.

## 2. Work recorded in my name during the period

| Date | What the commit did | Extent, as recorded |
|---|---|---|
| 10 March 2025 | **Added a "trace-ID hook."** This is a component that lets the library carry a request's trace identifier through the program's context, so related log lines can be matched up. | I was the author. The commit adds two new files: the hook (50 lines) and its automated test (34 lines). |
| 8 April 2025 | **Added generated "level strings."** The commit adds a file of log-level names that is produced automatically by Go's `go generate` tool. | I was the author of the commit. The file is machine-generated (it is marked "DO NOT EDIT") and is 1,803 lines long. That length reflects the tool's output, not hand-written code. The commit does not show who wrote the generator. |
| 12 May 2025 | **Reorganised files.** I moved two existing files (the formatter and the JSON formatter) into a new `formatters/` directory. | I was the author. This was a move only. No lines of code were changed. |

## 3. Items I am not claiming, or that need care

- **Hook dispatch rework (24 March 2025).** A colleague, Wei Zhang, is the author of this commit. I am listed only as a "co-author" in the commit message. The history does not show how much of the work was mine, so I make no claim about it beyond that credit.
- **Redaction formatter (commit `ba8bfca`).** I am the author. Its recorded date is 1 January 2031, which is in the future and cannot be right. The commit sits in the history between my 8 April and 12 May 2025 commits, so it was probably made in that window. The recorded date is not reliable, so I do not rely on it. I do not list it as work done on a specific date. Anyone who needs it counted should confirm the real date with Northwind or the repository host's records.
- **Work before 3 March 2025 (not counted).**
  - A commit adding a "JSON field-order option" is dated 24 February 2025. It used a personal email address and falls before my start date.
  - A commit adding a "WithContextFields helper" is stamped 2 March 2025 at 11:30 pm in a UTC−8 time zone. That is 3 March in UTC. I treat it as pre-employment and do not count it, because the date is ambiguous.
- **Limits of this record.** Commit history shows who recorded changes and when. It does not show design work, code review, discussion, or time spent. This statement does not describe those. The author, date, and email fields in a git commit can be set by the person making it. Northwind's own records (for example pull-request or review history on the hosting service) would be stronger independent evidence.

## 4. Summary

From 3 March 2025 through 12 May 2025, the dated history shows three commits authored by me: a trace-ID hook with a test (10 March), a generated file of log-level strings (8 April), and a reorganisation that moved two files (12 May). A fourth commit, a redaction formatter, is also mine. Its date is unreliable, so it is not attributed to a date. I am credited as a co-author, with no stated extent, on one further commit by a colleague.
