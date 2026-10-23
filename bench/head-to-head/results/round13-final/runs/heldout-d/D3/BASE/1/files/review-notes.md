# Review notes: authorship of `src/loops.rs` (candidate: Priya Nair)

**Claim:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support the claim.** The module was originally written by a different person, Sam Okafor. Priya's changes to the code are a file rename, a whitespace-only reformat, and one small addition. One commit has a backdated timestamp that needs an explanation.

## Who wrote what

The repo is a copy of the open-source `walkdir` library. The loop detection code was added on top of it in 2024.

| Date | Author | Commit | What it did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** (brightlabs.example) | `59fe256` "Add loop detection for symlink cycles" | **Created the module** as `src/loopdetect.rs` (52 lines). This is the original design and code. |
| 2024-02-20 | Sam Okafor | `b224c6e` "Add loopdetect tests" | Wrote the tests. |
| 2024-05-03 | Priya Nair (gmail.example) | `6fa64e8` "Move loop detection into loops module" | Renamed the file to `src/loops.rs`. **0 lines changed.** |
| 2024-05-03 | Priya Nair | `f2cc867` "Rewrite loop detection module" | Despite the title, this only changed tabs to spaces. A diff that ignores whitespace is empty. No logic changed. |
| 2024-05-06 | Priya Nair | `96cdd00` "Add max-depth guard to loop check" | The only real code she added: 12 lines. |
| 2024-05-08 | Priya Nair | `0d899e2` "Docs for loops module" | Added `docs/loops.md`. |
| 2024-05-09 (commit date) | Priya Nair | `c155069` "Initial loop detection prototype" | Added `notes/prototype.md`. See "Backdated commit" below. |
| 2024-05-20 | Sam Okafor | `2af2d0a` "Handle permission errors in loop check" | 7 more lines of code in the module. |

### Line-by-line attribution of the current `src/loops.rs`

I ran `git blame` ignoring whitespace changes, so the reformat doesn't count as authorship. The file has 69 lines:

- **Sam Okafor: 57 lines (about 83%).** This includes the whole core of the file, the 7 lines added in May, and the original design.
- **Priya Nair: 12 lines (about 17%).** All of them come from the single max-depth commit.

## Backdated commit

Commit `c155069` ("Initial loop detection prototype") has an **author date of 2023-11-02**. Its **commit date is 2024-05-09**, six months later. Its position in the history confirms it was added last, after the rename and the docs.

- The 2023 date makes it look as if Priya had a prototype three months before Sam's first commit (2024-02-12). That would support her claim.
- It only adds `notes/prototype.md`. That file is ten placeholder lines ("proto line 1" through "proto line 10") with no real content, and it contains no code.
- Git lets anyone set the author date to any value, so this proves nothing by itself. In context it looks like an attempt to establish earlier authorship. It may have an innocent explanation, such as a rebase or a cherry-picked note, but she should be asked about it.

## Other observations

- Priya's commits use a personal email (`priya.nair@gmail.example`). Sam's use a company domain (`brightlabs.example`). Nothing in the export shows which employer Priya was at, or that she worked there in 2024.
- The history does not rule out a collaboration, or Priya having done design work that never reached git. It only shows that the code is not mostly hers, and that the "rewrite" commit title overstates what the commit did.
- Part of the file is auto-generated-looking filler (`field_1` through `field_45`, and similar). I can't judge the technical quality from this, and the history doesn't depend on it.

## Suggested follow-ups

1. Ask Priya what she personally designed and wrote. Have her explain the module in her own words, or walk through the max-depth guard.
2. Ask her about the 2023-dated commit `c155069` and why its author date is so much earlier than its commit date.
3. If the role matters enough, ask for a reference or a contact at the prior employer. Sam Okafor is the committer who can speak to who did the work, if the company agrees.
4. Treat the export itself as unverified. It is a local copy, and anyone can change commit metadata. The company's own repository would be a stronger source.

## Method

I read `git log` (all branches, with `--follow` on `src/loops.rs`), `git show` for each relevant commit, a whitespace-ignoring diff of the "rewrite" commit, and `git blame -w` on the final file. I compared author dates with commit dates and checked commit parentage. The repo has one branch and no tags.
