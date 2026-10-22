# Statement of Contributions to the Northwind Go Logging Library

**Prepared for:** Tomás Alvarez
**Period covered:** 3 March 2025 (start date at Northwind) to the most recent entry in the repository
**Source:** The git commit history of Northwind's private repository. This is a Go logging library derived from the open-source "logrus" project. Most of the history, going back to 2013, was written by other people before Northwind's team worked on it.
**Method:** I listed every commit recorded under Tomás Alvarez's name, together with its date and the number of lines added. I then read the content of each commit. This statement says only what the history shows. It does not describe business impact, performance, or usage. The history does not record those things.

## Summary

After 3 March 2025, the history shows **three commits** that Tomás Alvarez wrote and that I can rely on. Together they add about 1,900 lines. One more commit is credited to Tomás as a co-author. One commit is excluded because its date is unreliable. Two earlier commits are excluded because they fall before the start date or are ambiguous.

## Commits I can rely on

| Date | Commit | What it is | Size |
|---|---|---|---|
| 10 Mar 2025 | `4e129b6` | **Trace-ID hook.** Adds a "hook" to the library. A hook is a small piece of code that runs whenever a log message is written. This one is meant to carry a trace identifier through the program's context. The commit includes a test file for it. | 2 new files: 50 lines of code and 34 lines of tests |
| 8 Apr 2025 | `735aaa3` | **Generated level strings.** Adds a file of constants (`Level1` to `Level12` and so on) in `internal/gen/levels_gen.go`. The file's header says it was produced by the `go generate` tool. | 1 new file, 1,803 lines |
| 12 May 2025 | `084addb` | **Reorganisation.** Moves two existing files (`formatter.go` and `json_formatter.go`) into a new `formatters/` directory. | 0 lines changed. The files were moved and their contents were not edited. |

Notes on how to read these:

- **The 1,803-line file is machine-generated.** Its line count reflects the output of a tool. It does not reflect 1,803 lines written by hand. The history contains only the output, not the generator program or configuration. So the history does not show who wrote the generator.
- **The 12 May 2025 commit is a file move.** It is organisational work. It does not add functionality.
- **The trace-ID hook is the only commit in this list that adds functional code and tests.**

## Credited as co-author, but written by someone else

- **24 Mar 2025, `dbd09a0`, "Rework hook dispatch for concurrency."** A colleague, Wei Zhang, is the commit's author. The message includes the line "Co-authored-by: Tomás Alvarez." The commit adds 43 lines. The history does not show how much of that work was Tomás's, so I have not counted these lines as his.

## Commits deliberately excluded

- **"Add redaction formatter," `ba8bfca`.** This commit is recorded under Tomás's name, but its date is **1 January 2031**, which is in the future. I could not verify when it was actually made, so I have not used it. The file's contents also look like placeholder code (82 lines of near-identical numbered functions such as `redact1` and `redact2`) and do not look like a working redaction feature. I would not describe this commit as a redaction feature without reviewing the code with Tomás first.
- **"Add WithContextFields helper," `d5fa912`.** Dated 2 March 2025, 23:30 in the author's US Pacific timezone. That is one day before the 3 March start date. It is 3 March in UTC, so the date is ambiguous. I have left it out to be safe. If Tomás's first day was in fact 2 March in local time, or if the work was done for Northwind, this commit could be added.
- **"Add JSON field-order option," `4f4e669`.** Dated 24 February 2025. This is before the start date, and it was recorded under a personal email address (`pm.example`) and not the Northwind address. It is not Northwind work and is not claimed here.

## What this statement does not claim

- It does not claim ownership of the library. The project began in 2013 and has hundreds of other contributors.
- It does not cover work that leaves no trace in git. Examples are code review, design discussions, debugging, on-call support, and documentation outside the repository.
- It does not say how widely the code is used or what effect it had.
- It covers only the `main` branch of this repository. There are no other branches or tags in the copy I examined.

## Points to confirm before submission

1. Tomás's exact start date, and whether `d5fa912` (2 Mar 2025 local time) should be included.
2. Who wrote the generator behind `735aaa3`, and where it is stored.
3. The date and real content of `ba8bfca`, which has an impossible 2031 timestamp. Either correct it or leave it out.
4. Tomás's actual role in `dbd09a0`, if Tomás wants it described.
