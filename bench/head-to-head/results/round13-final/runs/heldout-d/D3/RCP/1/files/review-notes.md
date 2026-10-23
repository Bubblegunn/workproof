# Review notes: authorship of `src/loops.rs` (candidate: Priya Nair)

**Claim:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her previous job in 2024.

**Bottom line:** The git history does **not** support the claim as stated. The module was first written by **Sam Okafor** (a `brightlabs.example` address) in February 2024. Priya's commits are a file rename, a whitespace-only "rewrite", a small addition, and docs. She did not design or write the core code.

This is based only on the git history in the export. Git author names and dates are self-reported and can be edited, so this shows what the export says, not what happened at the job. The history is also inconsistent in places (see Red flags).

## Who wrote what

The history covers the loop detection files only. Everything else in the repo is the open-source `walkdir` crate by Andrew Gallant and others, which predates all of this.

| Date | Author | Commit | What it actually did |
|---|---|---|---|
| 2024-02-12 | Sam Okafor | `59fe256` Add loop detection for symlink cycles | **Created the module** as `src/loopdetect.rs` (52 lines). |
| 2024-02-20 | Sam Okafor | `b224c6e` Add loopdetect tests | Added the tests (30 lines). |
| 2024-05-03 | Priya Nair | `6fa64e8` Move loop detection into loops module | Pure rename to `src/loops.rs`. 0 lines changed. |
| 2024-05-03 | Priya Nair | `f2cc867` Rewrite loop detection module | **Whitespace only.** 45 lines changed from tabs to spaces. No logic changed. `git diff -w` shows nothing. |
| 2024-05-06 | Priya Nair | `96cdd00` Add max-depth guard to loop check | Her only real code change: +12 lines, -1. |
| 2024-05-08 | Priya Nair | `0d899e2` Docs for loops module | Added `docs/loops.md`. |
| 2024-05-09 (committed) | Priya Nair | `c155069` Initial loop detection prototype | Added only `notes/prototype.md`. See Red flags. |
| 2024-05-20 | Sam Okafor | `2af2d0a` Handle permission errors in loop check | +7 lines, -1. |

**Current `src/loops.rs` is 69 lines.** Counting the lines that carry the original code through the whitespace change (`git blame -w`):
- Sam Okafor: 57 lines (about 83%).
- Priya Nair: 12 lines (about 17%), all from the max-depth guard.

Plain `git blame` credits Priya with 57 lines and Sam with 12. That is only because the tab-to-space commit touched every line. Anyone who quotes raw blame output or commit counts will get the wrong picture.

## Red flags in the export

1. **The "rewrite" is cosmetic.** The commit title implies a redesign, but it only re-indented 45 lines.
2. **The prototype commit is backdated.**
   - `c155069` "Initial loop detection prototype" has an author date of 2023-11-02.
   - Its committer date is 2024-05-09, and it sits in the history after her May 2024 commits, with `0d899e2` as its parent.
   - It claims to predate Sam's February 2024 work, but it was actually created three months after it.
   - It contains no code, only `notes/prototype.md`, which is 10 placeholder lines ("proto line 1" and so on).
   - Treat it as unreliable evidence, not as proof she started the work first.
3. **The 2023 date is also inconsistent with the rest of the history.** The upstream `walkdir` commit just before Sam's work is dated 2023-10-05. No loop-related code exists in the repo before February 2024.
4. **`docs/loops.md` is placeholder text** ("doc line 1" through "doc line 20"). It is not evidence of design work.
5. **The two authors use different identities.** Sam uses a company-style address (`brightlabs.example`) and Priya uses a personal one (`gmail.example`). That doesn't show where she worked, and nothing in the repo ties her to the employer. It does mean the export gives no independent confirmation of her employment.

## What the evidence does and doesn't support

- **Supported:** She worked on the module in May 2024. She moved and reformatted it, added a max-depth guard (12 lines), and wrote docs.
- **Not supported:** That she designed or wrote it. The original design, implementation and tests are all Sam Okafor's, dated about 3 months before her first commit.
- **Not established:** Whether the export is faithful to the real repo. Authorship metadata can be rewritten, so it proves little in either direction.

## Suggested next steps

- Ask Priya to explain the scope of her contribution (the rename, the max-depth guard and the docs) and why the history shows Sam as the original author.
- Ask her about the backdated prototype commit.
- Check the claim through references or her former employer rather than through this export. Sam Okafor is a possible reference, but contact them through the employer, not through addresses taken from the export.
- If she can show an original repo or PR history with Sam's commits absent, or an explanation such as pair work or a handover, weigh that. As submitted, the repo contradicts the "designed and wrote" claim.

## How this was checked

Commands run: `git log --follow` on `src/loops.rs`, `git log --all`, `git show --stat` on each relevant commit, `git diff -w`, `git blame` with and without `-w`, and `git cat-file -p` to compare author and committer dates.
