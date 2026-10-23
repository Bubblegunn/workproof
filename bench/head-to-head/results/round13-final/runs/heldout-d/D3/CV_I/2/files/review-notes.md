# Review notes: Priya Nair's claim on `src/loops.rs`

**Claim:** Priya designed and wrote the symlink loop detection module (`src/loops.rs`) in 2024.

**Verdict:** The git history does not support that claim. Sam Okafor created the module and wrote most of what is in it. Priya's commits are a rename, a whitespace-only reformat, a small addition, and docs.

## Who wrote what

| Date | Commit | Author | What it did |
|---|---|---|---|
| 2024-02-12 | `59fe256` | **Sam Okafor** | Created the loop detection module (`src/loopdetect.rs`, 52 lines). This is the original design and code. |
| 2024-02-20 | `b224c6e` | **Sam Okafor** | Added the tests (30 lines). |
| 2024-05-03 | `6fa64e8` | Priya Nair | Renamed `loopdetect.rs` to `loops.rs`. 0 lines changed. |
| 2024-05-03 | `f2cc867` | Priya Nair | Titled "Rewrite loop detection module". Whitespace only (details below). |
| 2024-05-06 | `96cdd00` | Priya Nair | Added a max-depth guard (+12 lines). This is her one real code contribution. |
| 2024-05-08 | `0d899e2` | Priya Nair | Added documentation (`docs/loops.md`). |
| 2024-05-09 | `c155069` | Priya Nair | Added `notes/prototype.md`, a 10-line placeholder. See the date problem below. |
| 2024-05-20 | `2af2d0a` | **Sam Okafor** | Added permission-error handling (+7 lines). |

Commits before February 2024 are the public upstream `walkdir` library, written by Andrew Gallant and others. They are not related to this module.

## Findings

1. **The "rewrite" changed no code.** Commit `f2cc867` shows 45 lines added and 45 removed. When whitespace is ignored (`git diff -w`), the difference is empty. The change is tabs converted to spaces, so it is a reformat. The commit message overstates it.
2. **Line-level attribution favors Sam.** I ran `git blame` ignoring whitespace changes and copied or moved lines. The current 69 lines of `loops.rs` come out as:
   - Sam Okafor: 57 lines (50 from the original February commit, 7 from the May permission-error fix).
   - Priya Nair: 12 lines, all from the max-depth guard.
   - A plain `git blame` (no whitespace handling) credits Priya with 57 lines and Sam with 12, the reverse of the real picture. Her reformat took over the lines Sam wrote. That is probably why she looks like the main author on a casual look.
3. **Her real contribution is small and later.** She added a depth guard, docs, and a rename. That is a legitimate contribution, but it is maintenance work on code Sam designed.
4. **The prototype commit has a backdated author date.** `c155069` ("Initial loop detection prototype") carries an author date of **2023-11-02**. The commit date is **2024-05-09**, after all her other work. It sits in the history after the module was already written. This is the only evidence in the repo that she had the idea first. It can't be trusted:
   - The date can be set to anything with `git commit --date`, and a gap of about six months between author date and commit date is unusual.
   - It touches only a notes file, with ten lines reading "proto line 1" through "proto line 10". It has no code and no design content.
   - It predates Sam's February 2024 commit only by the date it claims.
5. **No other evidence of her authorship.** There are no other branches or tags, and no earlier code by her. There are 3 commits by Sam and 5 by Priya in the export, all in this module's area.

## Caveats

- This is a single repo export she supplied. It could have been edited, and git history can be rewritten. The backdated commit shows the dates can't be fully trusted.
- Git shows who committed, not who designed. Priya could have discussed or reviewed the design with Sam. The history gives no sign of that.
- The author name and email are self-reported. Sam's address (`brightlabs.example`) looks like a company account. Priya's is a personal one (`gmail.example`), including for her May 2024 commits, which is unusual if this was her employer's repo.

## Suggested next steps

- Ask Priya directly what she contributed and how, and mention the depth guard, docs, and rename.
- Contact the former employer or Sam Okafor, with her permission, to confirm who designed the module.
- Ask her to explain the backdated prototype commit.
- Avoid repeating "designed and wrote" in her materials unless she can back it up. "Extended and documented" fits the evidence.

## Method

`git log` (author and committer dates, with rename tracking), `git blame -w -C -C` on `src/loops.rs`, and `git diff -w` on the rewrite commit. The cv-builder skills were not used, because they draft and review resumes and do not check authorship.
