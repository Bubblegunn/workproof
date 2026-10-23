# Review notes: authorship of `src/loops.rs`

Claim under review: Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

## Verdict

**The git history does not support the claim.** Sam Okafor created the module and wrote most of it. Priya Nair's commits are a file rename, a whitespace-only reformat, a small edit, and two documentation/notes files.

## Who wrote what

The repo is a copy of the open-source `walkdir` library (about 190 commits from 2015 to 2023, mostly by Andrew Gallant). Only 8 commits sit on top of it, and those are the ones about loop detection.

| Date | Author | Commit | What it actually did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** (brightlabs.example) | `59fe256` Add loop detection for symlink cycles | **Created the module**: a new 52-line file, `src/loopdetect.rs` |
| 2024-02-20 | **Sam Okafor** | `b224c6e` Add loopdetect tests | Added tests |
| 2024-05-03 | Priya Nair (gmail.example) | `6fa64e8` Move loop detection into loops module | **Pure rename**, `loopdetect.rs` to `loops.rs`, with 0 lines changed |
| 2024-05-03 | Priya Nair | `f2cc867` Rewrite loop detection module | Despite the title, **only whitespace changed**. A diff that ignores whitespace shows no difference |
| 2024-05-06 | Priya Nair | `96cdd00` Add max-depth guard | Real edit: replaced 1 field with 13 near-identical `depth_guard_N` fields (+12 lines) |
| 2024-05-08 | Priya Nair | `0d899e2` Docs for loops module | Added `docs/loops.md` (documentation, not code) |
| 2024-05-09 (committed) | Priya Nair | `c155069` Initial loop detection prototype | Added `notes/prototype.md`, which is 10 placeholder lines of text, not code. See the date note below |
| 2024-05-20 | **Sam Okafor** | `2af2d0a` Handle permission errors | Edit to `src/loops.rs` (+7 lines) |

**Line-by-line ownership of the current `src/loops.rs`** (`git blame`, ignoring whitespace and moves): **Sam Okafor 57 lines (about 83%), Priya Nair 12 lines (about 17%).**

The file's own history (`git log --follow`) has 5 commits. Sam's is the first and the last. Priya's three only rename, reformat and add the depth fields.

## Red flags

1. **Sam wrote it first.** The module existed, with tests, three months before Priya touched it. Every line of the original design is Sam's.
2. **The "Rewrite" commit is not a rewrite.** It changed 45 lines in each direction but nothing substantive. It looks like a reformat. A non-technical reader could easily take the commit title and the "45 insertions, 45 deletions" at face value.
3. **The "Initial loop detection prototype" commit looks backdated.**
   - Its author date is 2023-11-02, which is before Sam's February 2024 work and would make Priya look like the originator.
   - Its commit date is 2024-05-09, after all her other commits.
   - It sits at the top of the history, not the bottom.
   - It contains only a notes file with placeholder text, no code.
   - Git author dates can be set to anything, so this proves nothing on its own. A prototype made in 2023 would have been committed in 2023.
4. **Different identities.** Sam uses a work address (`brightlabs.example`). Priya uses a personal address (`gmail.example`). I can't tell from the repo whether either person worked for the same employer. The repo doesn't show where Priya worked.

## What the history does support

Priya did contribute to the module in May 2024: she renamed and reformatted it, added a depth-guard change, and wrote its docs. "Contributed to and documented" is supportable. "Designed and wrote" is not.

## Caveats and suggested follow-ups

- This is a single export, and git history can be rewritten, so I can only say what this export shows. The date inconsistency in item 3 is the sign of possible tampering.
- Priya may have done design work that never reached git, such as design docs or review comments. The repo has no pull-request or review data.
- Fair next steps: ask her about the commit `c155069` dates, and ask for the original employer's repo or a reference who can confirm her role. Sam Okafor is a named contact in the history, but contacting a third party is your call.
- I didn't read the Rust logic itself. These findings rest on commit metadata and diff statistics, not on a judgement of code quality.
