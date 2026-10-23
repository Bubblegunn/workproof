# Review notes: authorship of `src/loops.rs` (candidate: Priya Nair)

## Bottom line

The git history **does not support** the claim that Priya designed and wrote the symlink loop detection module. Sam Okafor (brightlabs.example) wrote the original module. Priya's contributions are a file rename, a whitespace reformat, a small extension, and docs and notes. One of her commits also has an odd date that should be explained.

## What the history shows

| Date | Commit | Author | What it did |
|---|---|---|---|
| 2024-02-12 | 59fe256 | Sam Okafor | Created `src/loopdetect.rs` (52 lines): the original loop detection for symlink cycles |
| 2024-02-20 | b224c6e | Sam Okafor | Added the tests for it |
| 2024-05-03 | 6fa64e8 | Priya Nair | Renamed `loopdetect.rs` to `loops.rs`. No content change |
| 2024-05-03 | f2cc867 | Priya Nair | Commit message says "Rewrite loop detection module". The actual change is tabs to spaces. With whitespace ignored, **zero lines changed** |
| 2024-05-06 | 96cdd00 | Priya Nair | Added a max-depth guard: about 12 lines of new fields in the struct |
| 2024-05-08 | 0d899e2 | Priya Nair | Added `docs/loops.md` |
| 2024-05-09 | c155069 | Priya Nair | Added `notes/prototype.md` (see date issue below) |
| 2024-05-20 | 2af2d0a | Sam Okafor | Permission-error handling: 7 lines added to `src/loops.rs` |

## Who wrote the code

`git blame` (ignoring whitespace and following the rename) on the current `src/loops.rs` (69 lines) attributes lines as follows:

- **Sam Okafor:** the struct, the 45 core fields, the first depth and permission fields, and the 7 permission-error lines added in May 2024. That is about 55 of 69 lines.
- **Priya Nair:** 12 lines, all the max-depth guard fields from commit 96cdd00.

The repository never contained a version of this module that Priya wrote from scratch. Her "rewrite" commit changes only indentation. The original design, the first implementation and the tests are all Sam's, and they predate Priya's first touch of the file by about 3 months.

The file itself is mostly placeholder-style content (`field_1` through `field_45`, `depth_guard_N`, `perm_err_N`) with no real logic. This looks like a sanitized or synthetic export. Don't treat it as a complete picture of the real project.

## Red flag: the "prototype" commit date

Commit c155069 ("Initial loop detection prototype") has:
- **Author date:** 2023-11-02, which is before Sam's first commit and would make Priya look like the originator
- **Commit date:** 2024-05-09, which is when it was actually made, after Sam's code existed

Author dates are set by whoever makes the commit and are trivial to edit. The commit date and its position in history show the commit was made after Sam's work. It adds only a 10-line notes file (`notes/prototype.md`) containing placeholder text ("proto line 1" and so on), no code. I can't tell from the repo whether the backdating was deliberate or an artifact such as a rebase, amend or import. It still shouldn't be treated as evidence she wrote it first.

## Caveats

- The repo is an export, and history can be rewritten, so this shows only what the export says. It can't prove what happened at her employer.
- The base project looks like the open-source `walkdir` crate (older commits are by Andrew Gallant and others). That history is unrelated to this module.
- There is a possible innocent reading: Priya may have owned the module's later maintenance (rename, docs, depth guard) at this company. That would be a much smaller claim than "designed and wrote."

## Suggested next steps

1. Ask Priya directly about Sam Okafor's commits and the 2023-11-02 date on the prototype commit.
2. Ask her to describe the design (why the depth guard, how cycles are detected) in her own words.
3. If you want to verify further, a reference check with Brightlabs would settle who owned the module.
