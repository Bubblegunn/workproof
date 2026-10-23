# Review notes: authorship of `src/loops.rs` (candidate: Priya Nair)

## Conclusion

**The git history does not support the claim that Priya designed and wrote the module.** It shows that **Sam Okafor** (`sam.okafor@brightlabs.example`) wrote the original module and its tests in February 2024. Priya's commits are a file rename, a whitespace-only reformat, a small addition and a docs commit.

The repo is the open-source `walkdir` project with extra commits added on top. The loop-detection history consists of 8 commits, all shown below.

## Timeline

| Date | Author | Commit | What it did |
|---|---|---|---|
| 2024-02-12 | Sam Okafor | `59fe256` | **Created the module** as `src/loopdetect.rs` (52 lines: a `LoopCheck` struct) |
| 2024-02-20 | Sam Okafor | `b224c6e` | Added the tests (`loopdetect_tests.rs`) |
| 2024-05-03 | Priya Nair | `6fa64e8` | Renamed `loopdetect.rs` to `loops.rs`. 0 lines changed |
| 2024-05-03 | Priya Nair | `f2cc867` | Titled "Rewrite loop detection module". **Only changed tabs to spaces.** `git diff -w` shows no differences |
| 2024-05-06 | Priya Nair | `96cdd00` | Added 12 lines (more `depth_guard_*` fields) |
| 2024-05-08 | Priya Nair | `0d899e2` | Added `docs/loops.md` |
| 2024-05-09 (committed) | Priya Nair | `c155069` | "Initial loop detection prototype". See the date problem below |
| 2024-05-20 | Sam Okafor | `2af2d0a` | Added 7 lines (permission-error handling) |

## Who wrote the current code

A plain `git blame` credits Priya with 57 of 69 lines, which looks like support for her claim. That count is misleading. Her "rewrite" commit changed the indentation of every line, so blame credits her with lines she didn't write.

Ignoring whitespace (`git blame -w`):

- **Sam Okafor: 57 lines (about 83%)**. 50 are the original 2024-02 lines and 7 are the May 2024 permission-error addition.
- **Priya Nair: 12 lines (about 17%)**. These are the extra `depth_guard` fields from `96cdd00`.

The "Rewrite loop detection module" message overstates what that commit did. It changed no logic, only formatting.

## Other red flags

- **Backdated commit.** `c155069` ("Initial loop detection prototype") has an author date of **2023-11-02** but a commit date of **2024-05-09**. It sits in history after Sam's February 2024 work. The earlier author date makes it look like Priya's prototype came first. The commit date shows it was made after Sam's module already existed. The commit only adds `notes/prototype.md`, which contains ten placeholder lines ("proto line 1..10"). It has no real design content. Author dates are easy to set by hand, so I wouldn't treat the 2023 date as evidence.
- **Different identities.** Priya commits with a personal address (`gmail.example`). Sam commits with a company address (`brightlabs.example`). Her commits don't show a company email. Nothing in the repo shows she worked at the same employer as Sam, or at any employer.
- **Docs are filler.** `docs/loops.md` is 20 placeholder lines ("doc line 1..20"), so it isn't evidence of design work.
- **Limits of the export.** The `.git` folder can be rewritten, so dates and author names can be forged. Treat this as what the export shows, not as proof of what happened.

## What this does and doesn't show

- It shows Priya touched the file (rename, reformat, a 12-line addition, docs). It does not show she designed or wrote the module.
- It is consistent with her having worked in the same codebase as Sam. It is not consistent with the claim that she was the original author.
- It doesn't prove she was lying. She may have been given a partial or misleading export, or may be describing work that isn't in this repo. She should be asked directly.

## Suggested follow-ups

1. Ask Priya to explain her role in the module. Ask how it relates to Sam Okafor's February 2024 commits and what the 12 lines in `96cdd00` do.
2. Ask her why the "prototype" commit is dated 2023-11-02 but was committed in May 2024.
3. If she has the original repo, ask for the real history or a link to the pull requests and code review. A reference check with the employer would settle it.

## Commands used

```
git log --follow --format='%h %an %ad %s' -- src/loops.rs
git diff -w 6fa64e8 f2cc867        # empty: the "rewrite" was whitespace only
git blame -w src/loops.rs           # ignoring whitespace: Sam 57 lines, Priya 12
git show c155069 --format=fuller    # shows author date vs. commit date
```
