# Review notes: authorship of the symlink loop detection module (`src/loops.rs`)

**Claim being checked:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support this claim.** Sam Okafor (brightlabs.example) created the module and wrote most of it. Priya's contribution is real but small, and one commit has a date that looks altered.

## Who wrote what

| Date (2024) | Commit | Author | What it did |
|---|---|---|---|
| Feb 12 | `59fe256` | **Sam Okafor** | Created the module (then named `src/loopdetect.rs`). This is the original 52-line file with the core design. |
| Feb 20 | `b224c6e` | **Sam Okafor** | Added the tests. |
| May 3 | `6fa64e8` | Priya Nair | Renamed `loopdetect.rs` to `loops.rs`. 0 lines changed. |
| May 3 | `f2cc867` | Priya Nair | Labelled "Rewrite loop detection module". Ignoring whitespace, it changes **nothing**. It only re-indents about 45 lines. |
| May 6 | `96cdd00` | Priya Nair | Added a max-depth guard, which is 12 new lines. This is her only substantive code change. |
| May 8 | `0d899e2` | Priya Nair | Wrote the docs (`docs/loops.md`). |
| May 9 | `c155069` | Priya Nair | Added `notes/prototype.md`. See the date problem below. |
| May 20 | `2af2d0a` | **Sam Okafor** | Added permission-error handling (7 lines). |

**Line-by-line attribution of the current file (`git blame`, whitespace ignored):** the file has 69 lines.
- Sam Okafor: **57 lines (about 83%)**. 50 of these are his original lines from Feb 2024.
- Priya Nair: **12 lines (about 17%)**, all from the May 6 depth-guard commit.

## Specific problems with the claim

1. **She did not originate the module.** Sam's commit `59fe256` created it almost three months before Priya's first commit to it.
2. **The "rewrite" was cosmetic.** Commit `f2cc867` is titled as a rewrite, but the content is unchanged apart from whitespace. The title overstates what the commit did.
3. **She did not design it.** The core structure comes from Sam's initial commit. Priya's additions extend that structure.
4. **A commit has a suspicious date.** `c155069` ("Initial loop detection prototype") shows an author date of **2 Nov 2023**. Its commit date is **9 May 2024**, and it sits *after* her May 2024 work in the history. Normally the two dates match. A gap like this usually means the author date was set by hand (for example with `git commit --date` or a rebase). It would make her prototype look like it predates Sam's Feb 2024 work. The commit only adds `notes/prototype.md`, which contains ten placeholder lines ("proto line 1" to "proto line 10") and no code. It is not evidence of an earlier implementation.
5. **Her email is a personal address** (`priya.nair@gmail.example`), not an employer address. Sam's commits use `brightlabs.example`. This does not prove anything alone. It does mean nothing in the repo ties Priya to an employer.

## Caveats

- Git author fields can be set to any value, so this is evidence about what the repo says, not proof. The same applies to Sam's identity.
- The repo has been exported, and the history is short for a real project. It may be a reduced or rewritten copy of the original repository, so I can't rule out that the full original history differs.
- It is possible Priya contributed in ways git doesn't show (design discussions, code review, work in other repos). The repo alone can't confirm or refute that.
- The rest of the repo is the open-source `walkdir` library by Andrew Gallant and others. That code is unrelated to this claim.

## Suggested follow-up

- Ask Priya to describe specifically what she designed and implemented, and compare her answer with the history above (the depth guard and the rename are the parts she can credibly claim).
- Ask her to explain the Nov 2023 date on `c155069`.
- Check with her former employer or Sam Okafor if you have permission to do so.
