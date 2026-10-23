# Review notes: authorship of `src/loops.rs` (candidate: Priya Nair)

## Bottom line

**The git history does not support the claim that Priya designed and wrote the loop detection module. It points to Sam Okafor as the original author.** Priya has real commits on the file, but they are a rename, a whitespace reformat, and a small addition. The one piece of evidence that predates Sam's work is a 10-line notes file whose date looks backdated.

## Background

The repo is the open-source `walkdir` Rust library (about 190 commits, mostly by Andrew Gallant and other outside contributors). The loop detection files were added on top of it in 2024 by two people:

- Sam Okafor, `sam.okafor@brightlabs.example`
- Priya Nair, `priya.nair@gmail.example`

## Timeline of the file

| Date | Commit | Author | What it did |
|---|---|---|---|
| 2024-02-12 | 59fe256 | **Sam Okafor** | **Created** `src/loopdetect.rs` (52 lines): "Add loop detection for symlink cycles" |
| 2024-02-20 | b224c6e | Sam Okafor | Added the tests for it |
| 2024-05-03 | 6fa64e8 | Priya Nair | Renamed `loopdetect.rs` to `loops.rs`. 0 lines changed. |
| 2024-05-03 | f2cc867 | Priya Nair | Commit message says "Rewrite loop detection module". **The change is whitespace only** (tabs replaced by spaces on 45 lines). |
| 2024-05-06 | 96cdd00 | Priya Nair | Added a "max-depth guard", about 12 lines |
| 2024-05-08 | 0d899e2 | Priya Nair | Added `docs/loops.md` (documentation) |
| 2024-05-09 | c155069 | Priya Nair | Added `notes/prototype.md` (10 placeholder lines). See the concern below. |
| 2024-05-20 | 2af2d0a | Sam Okafor | Added permission-error handling, about 7 lines |

## Findings

1. **Sam created the module.** The first commit that contains loop detection code is Sam's, from February 2024. It came with Sam's tests a week later. Nothing earlier in the history contains this code.
2. **Priya's "Rewrite" is not a rewrite.** `git diff -w` (ignore whitespace) on commit f2cc867 shows no changes. Her biggest-looking commit only re-indented existing code. Her commit message overstates what it did.
3. **Her real code contribution is small.** It is the depth-guard addition, about 12 of the 69 lines in the file. Sam's permission-error handling is about 7 lines. Sam also wrote the original struct and the tests.
4. **A plain `git blame` is misleading.** It credits Priya with 57 of 69 lines, because the whitespace commit "touched" nearly every line. With whitespace changes ignored (`git blame -w`), the original lines belong to Sam, and Priya's lines are the depth-guard additions.
5. **Her only evidence of earlier design work looks backdated.** `notes/prototype.md` (commit c155069) has an author date of **2 Nov 2023**, which is before Sam's first commit. But its commit date is **9 May 2024**, and it sits in the chain after her other May commits. A real 2023 commit would have been made before Sam's February 2024 commit and appear before it in history. Dates in git are set by the committer and are easy to change. The file contains only "proto line 1…10" placeholders, so it shows no design content.
6. **Her commits use a personal email address**, not a company one. Sam's use a company domain (`brightlabs.example`). Nothing in the repo ties Priya to the employer. The history does not show where she worked, or whether she worked there in 2024.

## Caveats

- I can't read intent from the code. The content of the module is mostly placeholder-style fields (`field_1` … `field_45`), so I can't judge design quality from it.
- Git metadata can be edited, and this is an export, not the original repository. The dates and authorship shown here could have been rewritten. The findings above describe what the export says, not what is certain to have happened.
- Priya may have done design work that never reached git (whiteboarding, review, pair-programming). The history can't confirm or rule that out.
- It is possible Priya did contribute and the export was cleaned or re-created later. The odd date in item 5 is the only sign of that.

## Suggested next steps

- Ask Priya to describe what she designed and why, and to walk through the depth guard and the rationale for the module's structure. Someone who reads Rust can check her answers against the code.
- Ask her what she meant by "Rewrite" in commit f2cc867, and how the repo export was produced.
- If it matters for the decision, ask for a reference from the previous employer, or ask Sam Okafor directly about who designed the module.
- Don't treat this export as proof of authorship in either direction. Sam as author is the better-supported reading, but this is not conclusive.
