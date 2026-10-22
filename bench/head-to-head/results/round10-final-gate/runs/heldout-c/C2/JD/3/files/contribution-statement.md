# Statement of Contributions: Tomás Alvarez

**Subject:** Go logging library repository, Northwind
**Period covered:** 3 March 2025 (start date at Northwind) to the most recent commit in the repository (12 May 2025 by recorded date)
**Source:** The repository's git commit history (author name, author email, commit date and commit message). This statement was prepared from that history only.

## Background

The repository is a Go logging library. Its history begins well before 2025 and includes many years of commits by other people (for example, commits from 2014 to 2024 by outside open-source contributors). The package name in the code is `logrus`, which is a publicly available open-source library. I did not write that earlier code. This statement covers only the commits listed below.

## Commits I authored on or after 3 March 2025

Each commit below is recorded under my name and my Northwind email address (tomas.alvarez@northwind.example).

| Date | Commit | What the commit did |
|---|---|---|
| 10 March 2025 | `4e129b6` | Added a new "trace-ID hook" (file `hook_trace.go`), described in the commit message as being for context propagation, plus a test file (`hook_trace_test.go`). 2 new files, 84 lines added. |
| 8 April 2025 | `735aaa3` | Added one file (`internal/gen/levels_gen.go`) produced by Go's `go generate` tool, containing generated level strings. The file is marked as machine-generated. It is 1,803 lines long, but those lines were produced by the tool, not typed by hand. |
| 12 May 2025 | `084addb` | Moved two existing files (`formatter.go` and `json_formatter.go`) into a new `formatters/` directory. This is a reorganisation only; no lines of code were changed. |

## A commit where I am credited as co-author

- **24 March 2025, commit `dbd09a0`, "Rework hook dispatch for concurrency".** The commit was authored by my colleague Wei Zhang. Its message lists me as a co-author ("Co-authored-by"). The history does not say how the work was divided between us, so I make no claim about the size of my share. The commit adds 43 lines to `hooks.go`.

## What this statement does not claim

- Line counts show how much text a commit contains. They do not show how difficult or important the work was, and I do not rely on them for that.
- The history shows who committed what and when. It does not show how the library is used, how many people use it, or what business results followed from my commits.
- I make no claim about code review, design discussions, meetings, or other work that does not appear as a commit in this repository.

## Commits in the history that are not counted above

- **Before 3 March 2025.** Two commits under my name are dated before my start date: `4f4e669` (24 February 2025, "Add JSON field-order option", under a different, non-Northwind email address) and `d5fa912` (recorded 2 March 2025 at 23:30 in a UTC−8 time zone, "Add WithContextFields helper"). They are excluded because they fall before 3 March 2025 by their recorded dates.
- **Commit `ba8bfca`, "Add redaction formatter".** The recorded date on this commit is 1 January 2031, which is impossible and must be an error. Its position in the history places it after the 8 April 2025 commit and before the 12 May 2025 commit. I have not counted it as a dated contribution because its true date cannot be established from the history alone.

## How to verify

Everything above can be checked by anyone with access to the repository, for example with:

`git log --author="Alvarez" --format="%h %ad %ae %s" --date=iso`

and `git show <commit>` for the contents of any commit listed.

Prepared for: my immigration counsel
Signed: ______________________  Tomás Alvarez     Date: ______________
