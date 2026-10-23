# Review notes: authorship of `src/loops.rs` (symlink loop detection)

**Claim being checked:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Short answer:** The git history does **not** support the claim. The module was created by **Sam Okafor** (a `brightlabs.example` address) on 2024-02-12. Priya's commits start about 11 weeks later. They are a file rename, a whitespace reformat, a small edit, and docs. Sam also made the most recent change to the file.

## Who did what

All commits touching the module, oldest first (the file was called `src/loopdetect.rs` until 2024-05-03):

| Date (author date) | Author | Commit | What it actually did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** (sam.okafor@brightlabs.example) | `59fe256` Add loop detection for symlink cycles | **Created the module**: a new 52-line file. This is the original design and code. |
| 2024-02-20 | **Sam Okafor** | `b224c6e` Add loopdetect tests | Added the tests for the module. |
| 2024-05-03 | Priya Nair (priya.nair@gmail.example) | `6fa64e8` Move loop detection into loops module | Pure rename `loopdetect.rs` → `loops.rs`. 0 lines changed. |
| 2024-05-03 | Priya Nair | `f2cc867` Rewrite loop detection module | Titled "Rewrite", but it is **only a whitespace change** (tabs → spaces, 45 lines out, 45 in). The content is identical. |
| 2024-05-06 | Priya Nair | `96cdd00` Add max-depth guard | Real but small edit: replaced 1 field with 13 similar fields (+12 / −1 lines). |
| 2024-05-08 | Priya Nair | `0d899e2` Docs for loops module | Added `docs/loops.md`. |
| 2023-11-02 (see below) | Priya Nair | `c155069` Initial loop detection prototype | Added `notes/prototype.md`, a 10-line notes file. It contains no code. |
| 2024-05-20 | **Sam Okafor** | `2af2d0a` Handle permission errors | Latest change to the module: replaced 1 field with 7 similar fields. |

## Why a quick look can mislead

`git blame` currently attributes 57 of the file's 69 lines to Priya and 12 to Sam. That is probably what makes her claim look plausible. It is misleading. Her "Rewrite" commit re-indented every line, so blame credits her with lines Sam originally wrote. The file's own history shows Sam created it, and the rename and reformat changed nothing in what it does.

## Red flag: the "earliest" commit is backdated

`c155069` ("Initial loop detection prototype") has an **author date of 2023-11-02**, but a **commit date of 2024-05-09**. Author dates are what the committer's machine claims. Commit dates reflect when the commit was actually recorded. So this commit was created in May 2024, after Sam's work, and labelled as November 2023. It is also the only thing in the repo that would put Priya's work *before* Sam's. It sits in the history after commits dated 2024-05-08, which is out of order. Every other commit has matching author and commit dates.

It also holds only a 10-line notes file, with no code, so even taken at face value it would not show she wrote the module.

## Caveats

- Git names, emails and dates are self-reported and can be edited. This export doesn't prove who these people are or where they worked. I can only say what the history records.
- The two authors use different email domains. Sam uses `brightlabs.example`, which looks like a company address. Priya uses a personal `gmail.example` address. Her commits therefore don't show she was working at an employer's repo, though that alone isn't suspicious.
- The repo is otherwise a copy of the open-source `walkdir` project (about 190 commits, mostly by Andrew Gallant). The loop-detection files are a small add-on. The code in them looks like placeholder or synthetic content (numbered fields such as `field_1` … `field_45`). I did not evaluate code quality, and the module's logic can't be judged from this.
- Priya may have contributed in ways that don't appear here, such as design discussions, review, or work in a different repo. The export can't confirm or rule that out.

## Suggested follow-ups

1. Ask Priya directly about the history. Specifically: who is Sam Okafor, and why does the "Initial prototype" commit have a 2023 author date but a May 2024 commit date?
2. Ask her to walk through the design (what the loop check does and why), which tests would show real familiarity.
3. If it matters, request a reference from her former employer, or access to the original repository rather than an export.
