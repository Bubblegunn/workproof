# Review notes: Priya Nair's claim on the symlink loop detection module

**Claim:** Priya Nair designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the history does not support "designed and wrote". It supports "inherited, renamed and extended".** Sam Okafor created the module in February 2024. Priya's commits start in May 2024, and her code changes are small. Her claim might still hold in part, but this repo doesn't show it.

Method: I read `git log`, `git show` and `git blame` on the export. Nothing was run or compiled. The repo is a copy of the open-source `walkdir` project (Andrew Gallant and others). The loop-detection work sits on top of it as 8 commits, from `59fe256` to `2af2d0a`.

## Timeline of the module

| Date | Commit | Author | What it did |
|---|---|---|---|
| 2024-02-12 | `59fe256` | **Sam Okafor** | **Created** `src/loopdetect.rs` ("Add loop detection for symlink cycles"), 52 lines. This is the original module. |
| 2024-02-20 | `b224c6e` | **Sam Okafor** | Added its tests, 30 lines. |
| 2024-05-03 | `6fa64e8` | Priya Nair | **Renamed** `loopdetect.rs` to `loops.rs`. Content unchanged (0 lines). |
| 2024-05-03 | `f2cc867` | Priya Nair | "Rewrite loop detection module". 45 lines added and 45 removed, but these are **whitespace-only**. Ignoring whitespace, the diff is empty. It is not a rewrite. |
| 2024-05-06 | `96cdd00` | Priya Nair | "Add max-depth guard". Adds 12 lines to the module. |
| 2024-05-08 | `0d899e2` | Priya Nair | Added `docs/loops.md` (documentation only). |
| 2024-05-09 | `c155069` | Priya Nair | "Initial loop detection prototype". Adds only `notes/prototype.md`, and its author date is **2023-11-02**. See the red flag below. |
| 2024-05-20 | `2af2d0a` | Sam Okafor | "Handle permission errors". Adds 7 lines to the module. |

## Who wrote the code

`git blame` on the current `src/loops.rs` (69 lines, ignoring whitespace changes):

- **Sam Okafor: 57 lines (about 83%)**
- **Priya Nair: 12 lines (about 17%)**, all from the max-depth guard commit

Sam wrote the original file, the tests and the permission-error handling. Priya's real contribution to the code is the max-depth guard. She also did the rename and the documentation.

## Red flags

1. **The "Initial loop detection prototype" commit is backdated.** Its author date is 2023-11-02, but its committer date is 2024-05-09. It sits after her May 2024 commits and has Priya's May 2024 commit as its parent. The commit adds only a 10-line notes file, no code. A date can be set to anything with `git commit --date`. If it is read at face value, it makes Priya's "prototype" look like it came 3 months before Sam's first commit (Feb 2024). The history doesn't back that up. Nothing in the repo before 2024-05-03 comes from Priya.
2. **"Rewrite loop detection module" is a whitespace change.** The commit message describes a bigger piece of work than the diff contains.
3. **The author emails differ.** Sam used a company-style address (`@brightlabs.example`). Priya used a personal one (`@gmail.example`). Her commits aren't tied to the employer's identity, so the repo can't confirm she worked at that company.
4. **The export may be incomplete.** The repo has about 196 commits. Everything before Feb 2024 is upstream `walkdir`, and no private history exists for her to have been the original designer. Commit authorship also isn't proof of identity.

## Fair reading

- Consistent with the evidence: Priya took over or maintained an existing module in May 2024. She renamed it, added a depth guard and wrote the docs. She could reasonably say "I extended and documented the loop detection module".
- Not supported: "I designed and wrote" the module. Sam's commits predate hers by about 3 months and account for most of the code.
- The 2023 backdated commit shouldn't be treated as evidence of earlier work.

## Suggested follow-ups for the panel

- Ask Priya in the interview what she changed in `loops.rs`, and why. A candidate who wrote the depth guard should be able to explain it. Also ask about her relationship to Sam Okafor and the 2023-11-02 date.
- Ask her to explain the backdated prototype commit.
- Ask for the original repo, a reference, or a public link, not an export.

## Caveats

- Git history shows who committed. It doesn't prove who designed the code. Pair programming, code written elsewhere and squashed commits are all possible. These notes cover only what the repo shows.
- I did not read the module's contents in depth. Conclusions come from commit metadata, diffs and blame.
- I did not use the `/receipts` skill's output. That skill produces a report of your own Claude Code usage and doesn't analyze git authorship, so I did the analysis directly.
