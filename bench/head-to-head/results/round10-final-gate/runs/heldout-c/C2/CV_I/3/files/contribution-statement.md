# Statement of Contributions to the Team Go Logging Library

**Person:** Tomás Alvarez
**Employer:** Northwind
**Employment start date:** 3 March 2025
**Period covered:** 3 March 2025 to the most recent commit in the repository (12 May 2025)
**Source:** The commit history (git log) of the team's private repository. Every statement below can be checked against a named commit.

## About the library

The repository is a Go logging library. Its history begins with an existing open-source logging library (logrus), whose earlier work was done by many other people. This statement covers only commits made after 3 March 2025.

## Contributions I authored

| Date (as recorded) | Commit | What the commit does (from its message) | Size |
|---|---|---|---|
| 10 March 2025 | 4e129b6 | Added a "trace-ID hook", which carries a trace identifier through a program's context. | 2 new files, 84 lines added (50 in the hook, 34 in a test file) |
| 8 April 2025 | 735aaa3 | Added level-name strings produced by Go's code-generation tool (`go generate`). | 1 file, 1,803 lines. The file is marked "Code generated … DO NOT EDIT", so these lines were produced by a tool, not typed by hand. |
| 12 May 2025 | 084addb | Moved the formatter source files into a new `formatters/` directory. | 2 files renamed. No lines of code changed. |

## Contribution as co-author

- **24 March 2025, commit dbd09a0, "Rework hook dispatch for concurrency".** The commit was authored by my colleague Wei Zhang (43 lines added). I am named in the commit message as a co-author. The history does not show which part of the work was mine, so I make no claim about how much I contributed.

## What this statement does not claim

- It does not claim any contribution to the original open-source library.
- It does not claim how widely the library is used, or any performance or business results. The git history does not record these.
- It counts commits only. It does not cover design discussions, code review, meetings or other work that leaves no trace in the commit history.

## Commits excluded because they do not fit the period or cannot be verified

These commits are in the repository under my name. I have left them out of the statement above, because they could be questioned.

1. **4f4e669, "Add JSON field-order option" (24 February 2025).** Made before I joined Northwind and under a personal email address, not my Northwind address. It is not work for Northwind.
2. **d5fa912, "Add WithContextFields helper" (recorded 2 March 2025, 23:30 in a UTC-8 timezone).** The recorded local date is the day before my start date. It was made before my employment began, so I have not counted it.
3. **ba8bfca, "Add redaction formatter".** Its recorded date is 1 January 2031, which is in the future and cannot be correct. In the history it sits after the 8 April 2025 commit and before the 12 May 2025 commit, which suggests it was made between those dates. The recorded date is not reliable evidence, so I have not counted it. If my lawyer wants to rely on it, the true date should be confirmed from another source (for example the code-hosting platform's pull-request or merge records).

## Notes for my lawyer

- The dates and author names in a git history are written by the committer's own computer and can be wrong. The three commits above show this. Before this statement is submitted, I suggest checking it against the hosting platform's records (merge dates, pull-request approvals) and, if possible, a short confirmation from my manager or a colleague.
- This statement is a record of what the history shows. It is not an assessment of how important the work was.
