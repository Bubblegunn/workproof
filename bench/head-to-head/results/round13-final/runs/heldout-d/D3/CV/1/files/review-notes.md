# Review notes: authorship of `src/loops.rs`

**Claim:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support this claim.** It shows Sam Okafor (brightlabs.example) wrote the module in February 2024. Priya's commits come about three months later and add only a small amount of code. One of her commits has a suspicious date.

## Background

The repo is the open-source `walkdir` Rust library (about 2015–2023, mostly by Andrew Gallant). The loop-detection work sits on top of that, in 8 commits from Feb to May 2024. Upstream `walkdir` has no `loops.rs`, so only those 8 commits matter.

## Timeline of the loop-detection commits

| Commit | Author | Date | What it did |
|---|---|---|---|
| 59fe256 | **Sam Okafor** | 2024-02-12 | **Created the module** as `src/loopdetect.rs` (52 lines, the whole struct). |
| b224c6e | **Sam Okafor** | 2024-02-20 | Added the tests. |
| 6fa64e8 | Priya Nair | 2024-05-03 | Renamed `loopdetect.rs` to `loops.rs`. No content change. |
| f2cc867 | Priya Nair | 2024-05-03 | "Rewrite loop detection module". **Whitespace only:** tabs became spaces. `git diff -w` shows zero differences. |
| 96cdd00 | Priya Nair | 2024-05-06 | Added about 12 lines (a block of `depth_guard_*` fields). This is her only real code change. |
| 0d899e2 | Priya Nair | 2024-05-08 | Added `docs/loops.md`. |
| c155069 | Priya Nair | author date 2023-11-02, **committed 2024-05-09** | "Initial loop detection prototype". See below. |
| 2af2d0a | **Sam Okafor** | 2024-05-20 | Added about 7 lines (permission-error fields). |

## Findings

1. **Sam wrote the module first.** His commit on 2024-02-12 creates the file and contains the core code. His tests followed on 2024-02-20. Priya's first involvement is 2024-05-03.

2. **The "Rewrite" commit is not a rewrite.** Its 45 added and 45 deleted lines are the same lines with tabs changed to spaces. Because of this, a plain `git blame` credits Priya with 57 of 69 lines, which is misleading. With whitespace ignored (`git blame -w -M -C`), the split is **Sam 57 lines, Priya 12 lines**. Her 12 lines are the depth-guard addition.

3. **The "prototype" commit looks backdated.**
   - Its author date is 2 Nov 2023, which would put it before Sam's work. Its commit date is 9 May 2024, after all her other commits.
   - It sits at the top of the history, after Sam's code, and is not an ancestor of it.
   - It touches no Rust file. It only adds `notes/prototype.md`, which contains ten placeholder lines ("proto line 1", "proto line 2", and so on). That is not a prototype of anything.
   - Author dates can be set to any value (`git commit --date`), so this one proves nothing. The gap between the two dates is the red flag.

4. **Her real contributions are small and supporting.** She moved and renamed the file, reformatted it, added a 12-line depth-guard block, and wrote docs. Those are legitimate, but they do not amount to designing or writing the module.

5. **The docs and prototype notes contain no real content.** Both are filler lines, so they don't show design work either.

## Caveats

- Git metadata can be edited. Names, emails and dates are self-reported. This analysis shows what the history *says*, not what is certain. The pattern is still consistent: Sam's commits are plainly first, and Priya's earlier-dated commit is the only thing that could support her claim.
- Priya may have contributed in ways git can't show (design discussions, code review, an earlier private version). The export alone doesn't establish that.
- Sam's commits use a company email (brightlabs.example). Priya's use a personal address (gmail.example). That doesn't prove anything, but it is worth noting.

## Suggested next steps

- Ask Priya to explain the 2023-11-02 commit date and what the "prototype" was.
- Ask her specific technical questions about the module (why this struct design, how the depth guard works). Someone who designed it can answer these easily.
- With her permission, contact the previous employer or Sam Okafor to verify her role. Do this carefully, since Sam is a named third party.
- Treat the export as unverified. Ask for the real repo access or a reference if this claim matters to the hiring decision.

## Commands used (to reproduce)

```
git log --reverse --format='%h | %an | %ad | commit %cd | %s' --date=iso
git diff -w --stat 6fa64e8 f2cc867        # empty = whitespace-only change
git blame -w -M -C --line-porcelain src/loops.rs | grep '^author ' | sort | uniq -c
git show c155069                          # the "prototype" commit
```
