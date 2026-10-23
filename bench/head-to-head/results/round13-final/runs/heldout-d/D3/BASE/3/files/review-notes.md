# Review notes: who wrote `src/loops.rs`?

**Claim being checked:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Short answer:** The git history does **not** support that claim. The original code was written by **Sam Okafor** (brightlabs.example) in February 2024. Priya's commits to the file are a rename, a whitespace-only "rewrite", and a few added lines. One of her commits has a backdated date.

## What the history shows

Commits touching the loop module, oldest first:

| Date | Author | Commit | What it actually did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** | `59fe256` "Add loop detection for symlink cycles" | Created the file (`src/loopdetect.rs`, 52 lines): the whole struct and its fields |
| 2024-02-20 | **Sam Okafor** | `b224c6e` "Add loopdetect tests" | Added the tests (30 lines) |
| 2024-05-03 | Priya Nair | `6fa64e8` "Move loop detection into loops module" | Pure rename to `src/loops.rs`, 0 lines changed |
| 2024-05-03 | Priya Nair | `f2cc867` "Rewrite loop detection module" | Changed 45 lines, but **all whitespace** (tabs to spaces). Ignoring whitespace, the diff is empty |
| 2024-05-06 | Priya Nair | `96cdd00` "Add max-depth guard to loop check" | Added 12 lines (`depth_guard_2` to `depth_guard_13`) |
| 2024-05-08 | Priya Nair | `0d899e2` "Docs for loops module" | Added `docs/loops.md` |
| 2024-05-09 (committed) | Priya Nair | `c155069` "Initial loop detection prototype" | Added only `notes/prototype.md`. See the backdating flag below |
| 2024-05-20 | **Sam Okafor** | `2af2d0a` "Handle permission errors in loop check" | Added 7 lines (`perm_err_2` to `perm_err_8`) |

## Who wrote the code that is in the file now

The file is 69 lines. Two views of it:

- **Plain `git blame`:** 57 lines Priya, 12 lines Sam. This is the view that flatters Priya, and it is misleading. Her "rewrite" re-indented the 48 original lines, so blame credits her for them.
- **Blame ignoring whitespace (`-w`):** the real picture.
  - **Sam:** the original struct, its fields and the first depth/permission fields (about 49 lines), plus 7 later lines. That is roughly 56 lines.
  - **Priya:** the 12 `depth_guard` lines from `96cdd00`, plus the rename and the re-indent.

The substantive design and first implementation are Sam's. Priya's real contribution is a small addition, a max-depth guard (12 lines), plus docs.

## Red flag: backdated commit

`c155069` "Initial loop detection prototype" has:

- **Author date:** 2023-11-02, which is *before* Sam's original code from Feb 2024.
- **Commit date:** 2024-05-09, which is after her other May commits.
- **Position in history:** it sits on top of `0d899e2` (May 8), so it was created *after* the "rewrite" and the docs.

Author dates can be set to anything with `git commit --date`, so the date is not evidence. The commit adds no Rust code, only a 10-line placeholder (`proto line 1` to `proto line 10`). It looks like an attempt to show she had a prototype before Sam's code. The real timeline is Sam's code first, in February, and a "prototype" commit added in May.

## Other things to note

- **Her email is personal** (`priya.nair@gmail.example`), while Sam's is at the company (`brightlabs.example`). Her commits may have been made from outside the employer's accounts. That is not evidence of wrongdoing by itself, but the export was also supplied by her, so it is not an independent record.
- **Repo origin:** this is a fork of the open-source `walkdir` crate. Its history is mostly Andrew Gallant's, and it already handles symlink loops upstream. The loop module is a small addition in a fork and is not a standalone design.
- **Limits of this check:** this is a single export supplied by the candidate. History can be rewritten or reshaped before sharing, so it can only show what the export says. I did not run the code or judge its quality. The "module" is mostly a struct of numbered fields with little visible logic.

## Suggested next steps

1. Ask Priya directly about the history: who Sam Okafor is, what she did on this module, and why `c155069` is dated November 2023.
2. Ask her to explain the max-depth guard (what it does, why it was needed). That is the part she authored.
3. With her permission, check with her former employer or reference, and ask about Sam's role.
4. Treat "designed and wrote the module" as **not supported**. "Contributed a depth guard and docs to a module originally written by a colleague" is what the evidence shows.
