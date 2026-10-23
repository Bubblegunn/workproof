# Review notes: Priya Nair's claim on `src/loops.rs`

**Claim:** Priya designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict:** The git history does not support this claim. Sam Okafor (brightlabs.example) created the module, and the history shows Priya reorganizing and lightly editing it. The repo does contain some real commits from her, so this is an overstatement, not a fabrication. One commit has a suspicious date (see below).

## Who wrote what

| Date | Commit | Author | What it did |
|---|---|---|---|
| 2024-02-12 | `59fe256` Add loop detection for symlink cycles | **Sam Okafor** | **Created the module.** New file `src/loopdetect.rs`, 52 lines. Defines the `LoopCheck` structure. |
| 2024-02-20 | `b224c6e` Add loopdetect tests | **Sam Okafor** | Added the tests (30 lines). |
| 2024-05-03 | `6fa64e8` Move loop detection into loops module | Priya Nair | **Pure rename** from `loopdetect.rs` to `loops.rs`. 0 lines changed. This is why `src/loops.rs` now carries her name in the file history. |
| 2024-05-03 | `f2cc867` "Rewrite loop detection module" | Priya Nair | **Not a rewrite.** It touches 45 lines, and ignoring whitespace the diff is empty. The change is whitespace only (indentation). The commit title overstates the content. |
| 2024-05-06 | `96cdd00` Add max-depth guard | Priya Nair | Real but small: about 12 added lines (`depth_guard_*` fields). |
| 2024-05-08 | `0d899e2` Docs for loops module | Priya Nair | Added `docs/loops.md` (20 lines). |
| 2024-05-09 (see note) | `c155069` "Initial loop detection prototype" | Priya Nair | Adds only `notes/prototype.md` (10 lines). It contains no code. |
| 2024-05-20 | `2af2d0a` Handle permission errors | **Sam Okafor** | Added about 7 lines (`perm_err_*` fields) to `src/loops.rs`. |

**Line ownership today.** `git blame` on `src/loops.rs`, which is 69 lines, attributes the lines as follows:

- **Sam Okafor: 12 lines** (about 17%). 5 are from his original file (the header, the struct line, one depth field, one permission field and the closing brace). 7 are permission-error lines he added in May.
- **Priya Nair: 57 lines** (about 83%). 45 of these are the whitespace-only reformatting of Sam's existing lines. The other 12 are the depth-guard lines.

The blame count flatters her. It credits her with the 45 lines she reindented, and those lines were first written by Sam. Her only real code contribution to the file is the roughly 12-line depth guard.

## Red flag: backdated commit

Commit `c155069` ("Initial loop detection prototype") has these dates:

- **Author date: 2023-11-02**, which is before Sam created the module on 2024-02-12. It would make Priya the original prototyper.
- **Commit date: 2024-05-09**, which is when it was actually recorded. It sits after her docs commit on 2024-05-08.

A prototype made in November 2023 would not be committed after the May 2024 docs. The author date looks edited, and git allows that freely. The commit also contains only a 10-line notes file, with no code. It is the only item in the history that supports the "designed" part of her claim, and it is the weakest and least trustworthy.

## Other observations

- The rest of the repo is the open-source `walkdir` project: 196 commits, most of them by Andrew Gallant from 2015. The loop detection files are a small addition on top. That is normal for a fork, but it means the export alone doesn't show what Priya did on the wider project.
- All of the loop-detection work by Sam and Priya is in one visible stretch, February to May 2024. Both worked on it within the same weeks, so this was a shared codebase and not a solo effort by either person.
- The history is consistent with Priya having been a collaborator on the module. It does not show that she designed it or wrote most of it.

## Caveats

- Git history shows what was committed and under which name. It cannot show who designed the module, who reviewed it, or who paired with whom. Sam's commits don't rule out that Priya contributed design ideas.
- Git author names and dates can be set to anything. The `c155069` date mismatch shows this has been done in this repo. That also means the export could have been edited in other ways, so the whole history should be treated as unverified.
- I haven't evaluated the code quality, since you asked about authorship.

## Suggested next steps

1. Ask Priya directly what her role was. A plain answer such as "I extended Sam's module with a depth guard and docs" would fit the evidence.
2. Ask her to explain the 2023-11-02 date on the prototype commit.
3. Ask for the original repository access or a reference who worked with her. A reference check with Sam Okafor, or with whoever managed them at the company, is the most reliable way to confirm who did the design.
4. If she describes herself as the sole author or designer, that is inconsistent with this history.
