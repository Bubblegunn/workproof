# Review notes: Priya Nair's claim on `src/loops.rs`

**Claim:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: The history does not support this.** Sam Okafor (brightlabs.example) created the module in February 2024. Priya's contributions are a file rename, a whitespace-only reformat, and a few later additions. Her commit dated November 2023 looks backdated.

## Who did what (all commits touching the module)

| Date | Commit | Author | What it actually did |
|---|---|---|---|
| 2024-02-12 | `59fe256` "Add loop detection for symlink cycles" | **Sam Okafor** | **Created the file** (as `src/loopdetect.rs`, 52 lines). This is the original design and code. |
| 2024-02-20 | `b224c6e` "Add loopdetect tests" | Sam Okafor | Added the tests (30 lines). |
| 2024-05-03 09:00 | `6fa64e8` "Move loop detection into loops module" | Priya Nair | Pure rename `loopdetect.rs` to `loops.rs`. No content change. |
| 2024-05-03 11:30 | `f2cc867` "Rewrite loop detection module" | Priya Nair | **Not a rewrite.** Changes 45 lines, but `git diff -w` (ignoring whitespace) shows zero differences. Tabs were converted to spaces on the same 45 lines. |
| 2024-05-06 | `96cdd00` "Add max-depth guard to loop check" | Priya Nair | Adds about 12 lines. |
| 2024-05-08 | `0d899e2` "Docs for loops module" | Priya Nair | Adds `docs/loops.md` (20 lines). |
| 2024-05-09 | `c155069` "Initial loop detection prototype" | Priya Nair | Adds `notes/prototype.md`. See the backdating note below. |
| 2024-05-20 | `2af2d0a` "Handle permission errors in loop check" | Sam Okafor | Adds the permission-error handling. |

## Why `git blame` is misleading
Blame on `src/loops.rs` credits Priya with 57 of 69 lines and Sam with 12. That is an artifact of the whitespace commit `f2cc867`. It re-touched the 45 lines Sam originally wrote, so a plain blame shows her as the author. Ignoring whitespace (`git blame -w`, which I ran) reverses the result: **Sam 57 lines, Priya 12 lines**. Sam wrote the original structure and the permission-error handling. Priya's real code in the file is the 12-line max-depth guard, plus the docs file.

## Red flag: backdated commit
- `c155069` "Initial loop detection prototype" has an **author date of 2023-11-02** but a **committer date of 2024-05-09**. It was created in May 2024, after the module already existed, but is labelled as dated before Sam's February 2024 original.
- That makes it look as if Priya prototyped the idea first. The commit only adds `notes/prototype.md`, which contains ten placeholder lines ("proto line 1" and so on) and no real design content.
- The commit is also the newest of Priya's commits in the log. Author dates can be set to anything with `git commit --date`, so this one proves nothing about November 2023.

## Other context
- The repo is a fork of the open-source `walkdir` crate. About 130 commits are Andrew Gallant's, and the loop detection files are the only ones from these two people.
- The module's content is stub-like: one struct with numbered placeholder fields and no detection logic. The export may be sanitized, so I can't judge the engineering quality from it.
- Both people appear to have worked at the same company. Sam uses a `brightlabs.example` address and Priya uses a personal Gmail-style address, so a co-worker could confirm the facts.

## What the evidence supports
- Priya contributed to the module in May 2024. She did the move, a formatting change, a max-depth guard and the docs.
- She did not originate or design it. Sam Okafor did, and Sam also wrote the tests and the permission handling.

## Suggested follow-ups
1. Ask Priya directly about her relationship to Sam's February commits and about the 2023-11-02 author date.
2. Ask her to describe the design in her own words (why a depth guard, how cycles are detected). This tests real understanding of the code.
3. With her consent, contact a reference from Brightlabs.
4. A fair outcome is that she extended and documented a module someone else built. That is legitimate experience, but it doesn't match "designed and wrote".

*Caveat: this is based on git metadata only. Authorship fields can be edited, but the evidence here is internally consistent. The rename and whitespace commits are objective, and the backdating shows in the mismatch between author and committer dates.*
