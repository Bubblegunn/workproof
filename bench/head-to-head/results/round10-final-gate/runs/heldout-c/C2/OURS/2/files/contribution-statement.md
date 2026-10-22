# Statement of Contributions to the Northwind Go Logging Library

**Prepared for:** Tomás Alvarez's immigration counsel
**Period covered:** 3 March 2025 (start date at Northwind) to the latest commit in the repository (12 May 2025)
**Source:** The git commit history of the team's private repository. Every figure below can be re-checked by running `git log` on that repository.
**Author name and email used:** Tomás Alvarez, tomas.alvarez@northwind.example

## 1. What this document is, and what it is not

This is a factual list of the changes recorded under Mr. Alvarez's name in the repository's version-control history. It does not assess how important or difficult the work was. Descriptions of what each change does are taken from the commit titles written at the time. Where the history cannot show something, this document says so.

The repository contains many years of earlier work by other people, including more than 300 other named contributors before 2025. The history shows it is built on an existing, widely used open-source logging library. Mr. Alvarez is not the author of that earlier work and does not claim it here. Within the period covered, the repository contains 5 commits under Mr. Alvarez's Northwind email address and 1 commit by a colleague, Wei Zhang, that credits him as co-author.

## 2. Contributions authored by Mr. Alvarez on or after 3 March 2025

| Date | Commit | Title | Size and nature |
|---|---|---|---|
| 10 Mar 2025 | `4e129b6` | Add trace-ID hook for context propagation | 84 lines added in 2 new files: 50 lines of library code (`hook_trace.go`) and 34 lines of tests (`hook_trace_test.go`). Hand-written. |
| 8 Apr 2025 | `735aaa3` | Add generated level strings (go generate) | 1,803 lines added in one file (`internal/gen/levels_gen.go`). The file's header says it was produced by the `go generate` tool and must not be edited by hand. The line count reflects machine output, not hand-written code. |
| 12 May 2025 | `084addb` | Move formatters into formatters/ directory | Reorganisation only. Two existing files were moved into a new folder. **0 lines were added or changed in their content.** |

Summary: in the period covered, the only hand-written new code with a reliable date is the trace-ID hook and its tests (84 lines). The other two commits are a tool-generated file and a file move.

## 3. Work with shared or unclear attribution

- **`dbd09a0`, 24 Mar 2025, "Rework hook dispatch for concurrency".** The author is Wei Zhang (43 lines added to `hooks.go`). The commit message carries a "Co-authored-by" line naming Mr. Alvarez. The history records that he is credited as a co-author. It does not show which parts he wrote or how much he contributed. This document therefore does not count the commit as his own authored work.

## 4. A commit not counted because its recorded date is unreliable

- **`ba8bfca`, "Add redaction formatter"** (`redact.go`, 82 lines added). This commit is under Mr. Alvarez's name, but its recorded date is **1 January 2031**, a date in the future. That date is evidently wrong. The history therefore cannot confirm when the commit was made, and it is not counted among the contributions above. If counsel wishes to rely on this work, the actual date should be established from another source, such as the code-review or pull-request record, before it is cited.

## 5. Earlier commits that fall before the start date (not claimed)

Two commits under Mr. Alvarez's name pre-date his 3 March 2025 start. They are excluded:

- `4f4e669`, 24 Feb 2025, "Add JSON field-order option". It was made using a personal email address (`pm.example`), not the Northwind address.
- `d5fa912`, 2 Mar 2025 at 23:30 (UTC−8), "Add WithContextFields helper". It is dated the day before the start date. The same moment is 3 March in UTC, so the date is close to the boundary. It is excluded to avoid any dispute.

## 6. Limits of this evidence

- Commit history shows who recorded a change and when. It does not show design work, code review, debugging, meetings or other work that left no commit. Nothing is claimed about those here.
- Commit dates are set by the committer's computer and can be edited. The 2031 date above shows the dates are not guaranteed to be accurate.
- Line counts measure volume, not quality or importance.
- Statements about what each change does rely on commit titles, and have not been independently tested.
