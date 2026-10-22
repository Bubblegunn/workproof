# Statement of Contributions: Go Logging Library

**Prepared for:** Tomás Alvarez's immigration counsel
**Employer:** Northwind (employment start date given by Mr. Alvarez: 3 March 2025)
**Source:** The git commit history of the team's private repository, read on 22 October 2026. No other source was used.

## About the repository

The repository began as a copy of the open-source Go logging library "logrus". Its history holds several hundred commits by other people made before 2025. Mr. Alvarez did not write that original library. This statement covers only commits made on or after 3 March 2025.

## Contributions counted

Each item below is a commit in the history. Line counts are the line counts git records for that commit.

| Date | Commit | What it did | Mr. Alvarez's role |
|---|---|---|---|
| 10 Mar 2025 | 4e129b6 | Added a "trace-ID hook". It attaches a request identifier carried in the request context to log entries. Added one source file (50 lines) and one test file (34 lines). | Sole author |
| 24 Mar 2025 | dbd09a0 | Reworked how logging hooks are run so that they work safely when many threads log at once. Added 43 lines to one file. | **Co-author only.** The commit was written and committed by a colleague, Wei Zhang. Git credits Mr. Alvarez as co-author. Git does not show how the work was divided. |
| 8 Apr 2025 | 735aaa3 | Added a file of text names for log levels, produced by Go's automatic code-generation tool (`go generate`). The file is 1,803 lines. | Sole author of the commit. The lines were machine-generated, so they are not an indication of hand-written code. |
| 12 May 2025 | 084addb | Moved two existing source files into a new `formatters/` directory. | Sole author. This was a reorganisation. It added and deleted no lines of code. |

In total, Mr. Alvarez is the sole author of 3 of these commits and co-author of 1. The only hand-written code attributed to him alone is the trace-ID hook and its test, which came to 84 lines.

## Commits deliberately not counted

- **"Add JSON field-order option" (24 Feb 2025).** It was made before the 3 March 2025 start date. It was committed under a personal email address, not a Northwind one.
- **"Add WithContextFields helper" (commit d5fa912).** Git records it at 23:30 on 2 March 2025 in a US Pacific time zone. That is the day before the start date in local time, though it is early on 3 March in UTC. It is left out so the statement does not depend on how the date is read. It added 26 lines.
- **"Add redaction formatter" (commit ba8bfca, 82 lines).** Its recorded date is 1 January 2031, which is in the future and cannot be right. In the history it sits between commits dated April and May 2025, so it probably belongs to that period. The history cannot confirm that, so it is not counted. If Northwind can confirm when it was written, it could be added.

## Limits of this statement

- Git dates and author names are written by the committer's own computer. They are not independently verified, and the 2031 date shows they can be wrong.
- The commit history shows what was committed. It does not show design work, code review, meetings, or other contributions that left no commit.
- Line counts measure size, not difficulty or importance.
- This statement does not describe the impact or usage of the library, or how others used these features.
