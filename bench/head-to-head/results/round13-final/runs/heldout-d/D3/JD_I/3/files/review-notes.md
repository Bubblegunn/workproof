# Review: does the git history support Priya Nair's claim on `src/loops.rs`?

**Claim:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: Not supported. The history says Sam Okafor (brightlabs.example) wrote the module. Priya's commits add 12 of its 69 lines and are mostly a move, a whitespace change and docs.**

## Who wrote the code today (`git blame`, whitespace changes ignored)

| Author | Lines | Share |
|---|---|---|
| Sam Okafor | 57 | 83% |
| Priya Nair | 12 | 17% |

- Sam wrote 50 lines in the original commit (`59fe256`, 2024-02-12). Sam wrote 7 more in `2af2d0a` (2024-05-20).
- Priya's 12 lines are all from one commit (`96cdd00`).

## Commit-by-commit history of the file

| Commit | Date | Author | What it did |
|---|---|---|---|
| `59fe256` | 2024-02-12 | **Sam Okafor** | Created the module (as `src/loopdetect.rs`, 52 lines). |
| `b224c6e` | 2024-02-20 | **Sam Okafor** | Added the tests for it. |
| `6fa64e8` | 2024-05-03 | Priya Nair | Renamed `loopdetect.rs` to `loops.rs`. No content change. |
| `f2cc867` | 2024-05-03 | Priya Nair | Titled "Rewrite loop detection module", but it is **whitespace only**. It changes tabs to spaces, and the diff is empty once whitespace is ignored. |
| `96cdd00` | 2024-05-06 | Priya Nair | Added a max-depth guard (12 lines of struct fields). This is her only real code change. |
| `0d899e2` | 2024-05-08 | Priya Nair | Added `docs/loops.md`. |
| `c155069` | see below | Priya Nair | Added `notes/prototype.md`, which is placeholder text, not code. |
| `2af2d0a` | 2024-05-20 | **Sam Okafor** | Added permission-error handling. |

## Red flags

1. **The "Rewrite" commit rewrites nothing.** `f2cc867` shows 45 insertions and 45 deletions, which looks like a big rewrite in a summary. Ignoring whitespace, nothing changed. It reformatted indentation. Because of that, a naive "who touched the most lines" view can wrongly credit her.
2. **The "prototype" commit is backdated.** `c155069` ("Initial loop detection prototype") has an author date of 2023-11-02. Its committer date is 2024-05-09, and it sits after her other commits in history. That is consistent with a commit created in May 2024 and given an earlier author date. The earlier date would make it look as if she had a prototype before Sam's first commit in February 2024. The commit adds only `notes/prototype.md`, which contains ten lines of "proto line N" placeholder text. It has no code, so it is not evidence of design work.
3. **Her earliest involvement is after the module existed.** Sam created and tested the module in February 2024. Priya's first touch is the 2024-05-03 rename, about 11 weeks later.
4. **The history doesn't show a design role.** It contains no design documents or architecture changes by her. Her work is a rename, reformatting, a small guard addition and documentation.

## What the history does support

- Priya was a contributor to the module in May 2024. She moved the file, reformatted it, added a depth guard and wrote the docs page.
- It is fair for her to claim "extended and documented" the module. It is not fair to claim she designed or wrote it.

## Caveats

- This is only what the repo export shows. Git author names and dates can be edited. Dates are self-reported, and the backdating above shows that was at least possible here. I can't confirm either person's real identity or employer.
- Sam could have been working with Priya (pairing, or committing under one account). Nothing in the export says so. Ask her directly.
- The code is mostly placeholder-style struct fields. I judged authorship from the history, not from the code's quality.
- The rest of the repo is the open-source `walkdir` crate, mostly by Andrew Gallant. Priya and Sam appear only in the 2024 loop commits.

## Suggested follow-ups

- Ask Priya to explain the 2023-11-02 date on `c155069`, and to walk through the design of `loops.rs`.
- Ask her about Sam Okafor's role and whether she can name him as a reference.
- Ask for the original repo or a reference from her employer, rather than relying on this export.

## Note on the requested skill

You asked for the `jd-resume-tailor` skill. It tailors resumes to job descriptions, which doesn't apply to checking a candidate's claims, so I didn't use it. I did not use `portfolio-bank.md`, an untracked file in the repo, in this review.
