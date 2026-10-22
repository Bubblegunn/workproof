# Statement of Contributions to the Northwind Go Logging Library

**Prepared for:** Tomás Alvarez's immigration counsel
**Period covered:** 3 March 2025 (start date at Northwind) to the most recent commit in the repository
**Source:** The git commit history of Northwind's private Go logging library repository (branch `main`). Every item below can be checked against the commit identifiers given.

## How to read this statement

- It lists only changes recorded in the repository under Tomás Alvarez's name, using the Northwind email address (tomas.alvarez@northwind.example).
- It describes what each change is. It does not claim how important a change was, who used it, or what business results followed, because the git history does not record those things.
- Dates are the commit dates stored in the history. The time zone is stated where it matters.

## Contributions in the period

| Date | Commit | What the change is |
|---|---|---|
| 10 Mar 2025 | `4e129b6` | Added a "trace-ID hook" to the library. The commit message describes its purpose as context propagation. It adds one source file (`hook_trace.go`, 50 lines) and one test file (`hook_trace_test.go`, 34 lines). Tomás Alvarez is the sole author. |
| 24 Mar 2025 | `dbd09a0` | "Rework hook dispatch for concurrency" (`hooks.go`, 43 lines added). **Wei Zhang is the commit's author.** Tomás Alvarez is credited as co-author in the commit message. The history does not show how the work was divided, so no particular share is claimed. |
| 8 Apr 2025 | `735aaa3` | Added generated level strings, produced with Go's `go generate` tool (`internal/gen/levels_gen.go`, 1,803 lines). Because this file is machine-generated, the line count is not a measure of hand-written code. |
| 12 May 2025 | `084addb` | Moved the formatter files (`formatter.go`, `json_formatter.go`) into a new `formatters/` directory. This is a reorganisation of file locations only. No lines of code were changed. |

## Summary

In the period covered, the repository records the following. One feature with tests (the trace-ID hook) was authored solely by Tomás Alvarez. Tomás is credited as co-author on one change to how hooks are dispatched, which another engineer authored. Tomás added one generated source file. Tomás reorganised the formatter files into their own directory.

## Limits of this statement

- It is based only on the repository history. It does not cover work that is not recorded there, such as design discussions, code review, debugging, documentation, or support. Such work may exist, but it is not claimed here.
- Commit counts and line counts are not a measure of quality or impact, and none is offered as one.
- Git commit dates and author details are set by the committer's own computer and can be changed. This statement therefore reports what the history says. It does not independently prove when work was done.

## Items deliberately left out, with reasons

- **Commit `4f4e669` (24 Feb 2025, "Add JSON field-order option").** This is dated before 3 March 2025 and was made under a different, non-Northwind email address. It is not counted as work done at Northwind.
- **Commit `d5fa912` (2 Mar 2025, "Add WithContextFields helper").** It is stamped 23:30 on 2 March in the committer's local time zone (UTC-8), which is 07:30 on 3 March in UTC. Because it falls on the boundary of the start date, it is not counted.
- **Commit `ba8bfca` ("Add redaction formatter").** Its recorded date is 1 January 2031, which is in the future and cannot be a true date. Its place in the history suggests it was made between 8 April and 12 May 2025, but the history does not establish this, so it is not counted.
