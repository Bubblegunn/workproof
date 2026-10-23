# Review: did Priya Nair design and write `src/loops.rs`?

**Bottom line: No. The git history does not support the claim.** Sam Okafor (brightlabs.example) wrote the module. Priya Nair's commits are a file rename, a whitespace-only reformat, a small addition and some docs.

This is based only on the git history in the export. Git author fields are self-reported and can be edited, so this shows what the repo says, not what happened at the job. Verify with the candidate and a reference.

## Who wrote what

| Date | Author | Commit | What it did |
|---|---|---|---|
| 2024-02-12 | **Sam Okafor** | `59fe256` Add loop detection for symlink cycles | Created the module as `src/loopdetect.rs`, 52 lines. This is the original design and implementation. |
| 2024-02-20 | **Sam Okafor** | `b224c6e` Add loopdetect tests | Wrote the tests. |
| 2024-05-03 | Priya Nair | `6fa64e8` Move loop detection into loops module | Renamed the file to `loops.rs`. 0 lines changed. |
| 2024-05-03 | Priya Nair | `f2cc867` "Rewrite loop detection module" | **Whitespace only.** It shows 45 lines added and 45 removed, but ignoring whitespace nothing changed (tabs to spaces). The commit message overstates it. |
| 2024-05-06 | Priya Nair | `96cdd00` Add max-depth guard | Added 12 lines, a run of `depth_guard_N` fields. This is her only real code in the file. |
| 2024-05-08 | Priya Nair | `0d899e2` Docs for loops module | Added `docs/loops.md`. |
| 2024-05-09 (commit date) | Priya Nair | `c155069` "Initial loop detection prototype" | See the red flag below. |
| 2024-05-20 | **Sam Okafor** | `2af2d0a` Handle permission errors | Added 7 lines to the file. |

The `git blame` check ignores whitespace and tracks the file across the rename. Of the 69 lines in `src/loops.rs`:

- **50 lines (about 72%) are Sam Okafor's**, from the original February commit.
- 7 lines are Sam's, from May.
- **12 lines (about 17%) are Priya's**, from the max-depth guard.

Priya's name appears on the file's history only because of the rename and the reformat, which blame skips once whitespace is ignored.

## Red flag: a backdated commit

Commit `c155069`, "Initial loop detection prototype", has an author date of **2023-11-02**. Its commit date is **2024-05-09**, after her other work and after the module already existed. The change is only `notes/prototype.md`, a 10-line placeholder ("proto line 1…10"). It touches no code.

An author date can be set to anything when committing. This commit places her "prototype" about three months before Sam's first commit. Nothing else in the repo corroborates that date, and the commit contains no code. I read it as a likely attempt to make her work look like it came first. I can't prove intent from git alone.

## Other notes

- The repo is the open-source `walkdir` project with a fork's history on top. The loop-related files all come from the commits above.
- Her timeline fits "joined a project already in progress", not "designed the module". Her commits come about 3 months after Sam's first commit, and Sam committed again after she did.
- The module has no apparent real logic beyond field declarations, so I can't judge design quality from it.

## What her contributions support

She could fairly claim: refactoring and renaming the module, adding a max-depth guard, and writing docs. She cannot fairly claim she **designed and wrote** it.

## Suggested next steps

- Ask her to explain the discrepancy. A good question is "Who was Sam Okafor, and what did you each do on this module?"
- Ask her why commit `c155069` has a 2023 author date but a 2024 commit date.
- Check with a reference at her previous employer.
