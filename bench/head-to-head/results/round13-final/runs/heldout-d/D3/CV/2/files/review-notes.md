# Review: Priya Nair's claim to have designed and written `src/loops.rs`

## Conclusion

The git history does **not** support the claim. Sam Okafor (sam.okafor@brightlabs.example) created the loop detection code on 2024-02-12. Priya Nair's commits to it are a file rename, a whitespace-only reformat, and a small extension of fields Sam had already defined. She did not design or originally write it.

## Who wrote what

| Date | Author | Commit | What it did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** | `59fe256` "Add loop detection for symlink cycles" | Created the file (then named `src/loopdetect.rs`, 52 lines) with the original `LoopCheck` structure. |
| 2024-02-20 | **Sam Okafor** | `b224c6e` "Add loopdetect tests" | Added the tests for it. |
| 2024-05-03 | Priya Nair | `6fa64e8` "Move loop detection into loops module" | Pure rename `loopdetect.rs` to `loops.rs`. Zero lines changed. |
| 2024-05-03 | Priya Nair | `f2cc867` "Rewrite loop detection module" | Despite the title, **whitespace only**. 45 lines were replaced by 45 lines that differ only in indentation (`git show -w` shows no change). No logic changed. |
| 2024-05-06 | Priya Nair | `96cdd00` "Add max-depth guard" | Added 12 `depth_guard_*` lines to Sam's existing `depth_guard_1`. |
| 2024-05-08 | Priya Nair | `0d899e2` "Docs for loops module" | Added `docs/loops.md`. Documentation only. |
| 2024-05-09 (committed) | Priya Nair | `c155069` "Initial loop detection prototype" | Added `notes/prototype.md`. See the backdating note below. |
| 2024-05-20 | **Sam Okafor** | `2af2d0a` "Handle permission errors in loop check" | Added 7 `perm_err_*` lines to the existing `perm_err_1`. |

### Line-by-line ownership of the current `src/loops.rs` (69 lines)

`git blame` credits the lines as follows. Rename-following is needed to trace back through the move.

- **Sam Okafor, original author: 4 lines.** These are the file header, `depth_guard_1`, `perm_err_1`, and the closing brace.
- **Sam Okafor, later commit: 7 lines.** These are the `perm_err_*` additions from May 2024.
- **Priya Nair: 58 lines.** Of these, 45 are only Sam's original lines re-indented (`f2cc867`, which `git blame` credits to her, while `git show -w` shows no content change). The other 12 are the `depth_guard_*` additions (`96cdd00`).

So a plain `git blame` makes Priya look like the majority author. That is misleading, because the largest block is a whitespace change over code that existed before her first commit.

## Red flag: backdated commit

Commit `c155069` "Initial loop detection prototype" has an author date of **2023-11-02**. Its committer date is **2024-05-09**, and it sits in history after Sam's February 2024 work.

- The file it adds, `notes/prototype.md`, contains only ten placeholder lines (`proto line 1` to `proto line 10`). It has no code.
- Author dates are trivially settable with `git commit --date`, and this commit's two dates disagree by six months. That looks like an attempt to make it seem the work predates Sam's.
- Every other commit from Priya has matching author and committer dates, which makes this one stand out.

I can't tell from the repo alone who set that date. It is consistent with deliberate backdating, but I can't prove intent.

## Other observations

- The repository is a copy of the open-source **walkdir** library (Andrew Gallant, 131 of the 196 commits). The loop-detection files do not look like real walkdir code. They are a struct of numbered placeholder fields (`field_1` to `field_45`, `depth_guard_*`, `perm_err_*`) with no actual detection logic.
- Priya's commits use the address `priya.nair@gmail.example`, a personal address. Nothing in the repo ties her to an employer, so the "at my last job in 2024" claim can't be confirmed from it either way.
- Sam and Priya both appear to belong to the same project, as Sam's commits come before and after hers. Sam used the company-style domain `brightlabs.example`.

## Caveats

- Git metadata (names, emails, dates) is self-reported and can be edited. This analysis shows what the repo says, not what is certain. The repo is an export, so history may also have been rewritten before it was sent.
- It is possible Priya contributed design work that was never committed, such as discussions, reviews or design docs. The repo can't show that.

## Suggested next steps

1. Ask Priya directly what her contribution was. Raise the whitespace-only "rewrite" and the date on `c155069`, and give her a chance to explain.
2. Get the original repo from the company, or contact Sam Okafor or the employer as a reference check, with her consent.
3. Check any other claims on her application that rest on this repo.
