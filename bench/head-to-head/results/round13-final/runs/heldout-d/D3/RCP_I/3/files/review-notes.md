# Review notes: authorship of `src/loops.rs` (symlink loop detection)

**Claim being checked:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support the claim.** Sam Okafor (brightlabs.example) wrote the original module and tests in February 2024. Priya's commits are a file rename, a whitespace-only "rewrite", an addition to the same struct, docs, and a back-dated notes file. Priya did not design the module, and the history doesn't show her writing the core logic.

## Timeline (from `git log`)

| Commit | Author | Date | What it actually did |
|---|---|---|---|
| `59fe256` "Add loop detection for symlink cycles" | **Sam Okafor** | 2024-02-12 | Created `src/loopdetect.rs` (52 lines). This is the original module. |
| `b224c6e` "Add loopdetect tests" | **Sam Okafor** | 2024-02-20 | Added the tests (30 lines). |
| `6fa64e8` "Move loop detection into loops module" | Priya Nair | 2024-05-03 | Pure rename `loopdetect.rs` → `loops.rs`. 0 lines changed. |
| `f2cc867` "Rewrite loop detection module" | Priya Nair | 2024-05-03 | Shows 45 lines added and 45 removed. With whitespace ignored (`git diff -w`) the change is **zero lines**. The only difference is tabs to spaces. It is not a rewrite. |
| `96cdd00` "Add max-depth guard to loop check" | Priya Nair | 2024-05-06 | Added 12 lines to the struct (`depth_guard_2` … `depth_guard_13`). This is her only real code contribution to the file. |
| `0d899e2` "Docs for loops module" | Priya Nair | 2024-05-08 | Added `docs/loops.md`. |
| `c155069` "Initial loop detection prototype" | Priya Nair | author date 2023-11-02, committed 2024-05-09 | Adds only `notes/prototype.md` (10 lines of placeholder text such as "proto line 1"). No code. See the back-dating note below. |
| `2af2d0a` "Handle permission errors in loop check" | **Sam Okafor** | 2024-05-20 | Added 7 lines (`perm_err_2` … `perm_err_8`). |

## Who wrote the code (line-level, `git blame -w` on the current `src/loops.rs`)

- **Sam Okafor: about 57 of 69 lines** (50 original lines plus 7 added on 2024-05-20). His original lines predate Priya's first commit to the file by about three months.
- **Priya Nair: 12 lines**, all from the 2024-05-06 max-depth change. Her authorship of the 45 `field_N` lines is only blame attribution from the whitespace commit. The ignore-whitespace history shows those lines come from Sam's original file.
- Sam's original file is the base. Everything else, including Priya's work, is a small extension of it.

## Red flags

1. **The "rewrite" is whitespace only.** `f2cc867` is named as a rewrite and takes over blame for 45 lines, but it contains no logic changes. Ordinary `git blame` makes Priya look like the author of most of the file. Blame with whitespace ignored (`-w`) shows otherwise.
2. **The prototype commit is back-dated.** `c155069` has an author date of 2023-11-02, but it was committed on 2024-05-09 and sits on top of her May 2024 commits. Sam's first commit is dated 2024-02-12. The back-dating makes it look as if her prototype came before his work. It is also only a notes file with placeholder text, so it proves no prior code. Author dates can be set to anything, while the committer date matches the real order of events.
3. **Priya's repo history starts in May 2024.** Her first commit here is the rename on 2024-05-03. This is after the module and its tests already existed.
4. **Different email domains.** Sam uses a company address (`brightlabs.example`). Priya uses a personal address (`gmail.example`). That doesn't prove anything by itself, but the repo shows no company identity for her.
5. **Priya's own commit messages describe maintenance.** "Move", "Rewrite" (really a reformat), "Add max-depth guard", and "Docs" don't describe designing the module.

## What the history does support

- Priya did **contribute to and maintain** the module in May 2024. She renamed the file, reformatted it, added the max-depth guard fields, and wrote docs.
- Her docs and notes files contain placeholder text, so I can't judge their quality from this export.

## Caveats

- This is one repo export, and the history could have been rewritten before it was sent. The dates and the author/committer date mismatch are inconsistent in a way that suggests editing, but I can't tell whether that was deliberate. The export has only a `main` branch and no tags.
- Git records who committed code. It doesn't record who designed it. Priya may have contributed ideas that are not visible here. Sam's name on the original commit does contradict "designed and wrote" the module.
- I'm not a Rust reviewer for this task, and I didn't need to judge code quality. The conclusions above come from commit metadata and diffs.

## Suggested follow-ups

- Ask Priya how she'd describe the difference between her work and Sam Okafor's original, and what the max-depth guard was for.
- Ask what the "Initial loop detection prototype" (dated 2023-11-02) was, and why it was committed in May 2024.
- If she gives you a reference at that employer, ask about Sam's and Priya's roles.

## Commands used (to reproduce)

```
git log --format='%h | %an | %ad | %cd | %s' --date=short -- src/loops.rs src/loopdetect.rs notes docs
git blame -w src/loops.rs
git diff -w --stat 6fa64e8 f2cc867 -- src/loops.rs
git show c155069
```
