# Review notes: authorship of `src/loops.rs` (symlink loop detection)

**Claim under review:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support the claim as stated.** Sam Okafor (brightlabs.example) wrote the original module in February 2024. Priya's commits are a file rename, a whitespace-only reformat, and a small addition. She is a real contributor to the file, but she is not its author or designer.

## Timeline of `src/loops.rs` (and its earlier name `src/loopdetect.rs`)

| Date | Author | Commit | What it actually did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** | 59fe256 "Add loop detection for symlink cycles" | Created the module as `src/loopdetect.rs`, 52 lines. This is the original design and implementation. |
| 2024-02-20 | Sam Okafor | b224c6e "Add loopdetect tests" | Added the tests. |
| 2024-05-03 | Priya Nair | 6fa64e8 "Move loop detection into loops module" | Pure rename `loopdetect.rs` to `loops.rs`. 0 lines changed. |
| 2024-05-03 | Priya Nair | f2cc867 "Rewrite loop detection module" | Despite the title, this is not a rewrite. The diff is 45 lines removed and 45 added, but ignoring whitespace it is **empty**. It only converted tabs to spaces. |
| 2024-05-06 | Priya Nair | 96cdd00 "Add max-depth guard to loop check" | The one real code contribution: 12 new lines (`depth_guard_2` to `depth_guard_13`). |
| 2024-05-08 | Priya Nair | 0d899e2 "Docs for loops module" | Added `docs/loops.md`. |
| 2024-05-09 (committed) | Priya Nair | c155069 "Initial loop detection prototype" | Adds only `notes/prototype.md`, 10 lines of placeholder text. See the date issue below. |
| 2024-05-20 | Sam Okafor | 2af2d0a "Handle permission errors in loop check" | Added 7 lines. |

## Who wrote the code

Line-by-line attribution of the current 69-line file, using `git blame -w -M -C -C`. This ignores whitespace changes and follows the file across the rename.

- **Sam Okafor: 57 lines (about 83%).** This includes all of the original module and the 7 permission-error lines added on 2024-05-20.
- **Priya Nair: 12 lines (about 17%).** These are the max-depth guard additions from 96cdd00.

A plain `git blame` that doesn't ignore whitespace credits Priya with 57 lines and Sam with 12. That is because her tab-to-space reformat touched every line. **If the candidate's export or anyone's summary relies on a default blame or line-count view, it will overstate her share.**

## Specific problems with the claim

1. **"Wrote":** The original file, and its tests, were created by Sam Okafor about 11 weeks before Priya's first commit touching it.
2. **"Designed":** Nothing in the history shows Priya designing the module. Her design-adjacent work is a depth guard, docs, and notes.
3. **Misleading commit message:** "Rewrite loop detection module" (f2cc867) changed no code. Reading the log alone would give the wrong impression.
4. **Backdated-looking prototype commit:** c155069 "Initial loop detection prototype" has an *author date* of 2023-11-02 but a *committer date* of 2024-05-09. That is **after** Sam's original module and the day after her docs commit. It is also placed last in the history. The commit contains only a notes file with placeholder text (`proto line 1` and so on), no code. It looks like it was added or re-dated to suggest earlier design work. It does not show the module existed in 2023. This is the most concerning item in the review.
5. **Employer ambiguity:** Sam's commits use a `brightlabs.example` address and Priya's use a personal `gmail.example` address. Her employer at the time is unclear from the export.

## Caveats

- The repo is an **export** and the candidate supplied it, so history can be rewritten. Author and committer dates can be set freely when a commit is made. I verified what the export says, not that it matches the real company repository.
- The repo also holds a large unrelated history (Andrew Gallant's public `walkdir` project, 2015 onward). I limited this review to `src/loops.rs`, `src/loopdetect.rs`, and the related notes and docs.
- I judged the code from diffs and blame only. I did not build it. In the current file, many members are placeholder-style names such as `field_1` to `field_45`. The file also may not reflect the real module.
- Sam Okafor may not be the true originator either, but the history gives no evidence of anyone earlier.

## Suggested follow-ups

- Ask Priya to describe specifically what she contributed. A fair framing is: "extended and refactored an existing loop-detection module (added a max-depth guard, wrote docs)".
- Ask her about commit c155069 and why its dates differ.
- Check with her former employer or a reference whether she owned this module, and get the original repository rather than an export if this matters to the hire.
