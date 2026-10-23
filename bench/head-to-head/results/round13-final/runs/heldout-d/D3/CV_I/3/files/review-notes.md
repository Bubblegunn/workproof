# Review notes: Priya Nair's claim on `src/loops.rs`

**Claim:** Priya designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support "designed and wrote". It supports "modified and extended code that Sam Okafor created."** The repo holds 196 commits, and most are unrelated upstream history. Only 8 commits touch loop detection. All findings below come from those commits.

## Who did what (loop detection commits, oldest first)

| Commit | Author | Date (author) | What it did |
|---|---|---|---|
| `59fe256` | **Sam Okafor** (brightlabs.example) | 2024-02-12 | **Created the module**, as `src/loopdetect.rs`: "Add loop detection for symlink cycles" |
| `b224c6e` | **Sam Okafor** | 2024-02-20 | Added all the tests (`loopdetect_tests.rs`) |
| `6fa64e8` | Priya Nair (gmail.example) | 2024-05-03 | Renamed `loopdetect.rs` to `loops.rs`. No content change (0 lines). |
| `f2cc867` | Priya Nair | 2024-05-03 | Titled "Rewrite loop detection module". **It is not a rewrite.** See below. |
| `96cdd00` | Priya Nair | 2024-05-06 | Added about 12 lines for a "max-depth guard" |
| `0d899e2` | Priya Nair | 2024-05-08 | Added `docs/loops.md` (documentation) |
| `c155069` | Priya Nair | 2023-11-02 (backdated) | "Initial loop detection prototype". Adds only `notes/prototype.md`. See below. |
| `2af2d0a` | **Sam Okafor** | 2024-05-20 | Added permission-error handling |

## Key findings

1. **Sam Okafor is the original author.** Sam created the file in February 2024, three months before Priya's first commit touching it, and wrote its tests.
2. **The "Rewrite" commit is only a whitespace change.** `f2cc867` shows 45 lines added and 45 removed. With whitespace ignored, the difference is **zero lines**. The only change is tabs becoming spaces. It looks like a rewrite in line counts and in `git blame`, but no logic changed.
3. **This inflates her blame share.** `git blame` currently attributes 57 of 69 lines to Priya and 12 to Sam. Most of her 57 come from the whitespace commit, which took over lines Sam originally wrote. Sam's original lines survive only where the whitespace happened not to change.
4. **Her real contributions are small.** They are the rename, the max-depth guard (`96cdd00`, about 12 lines) and the docs. Sam also made a later change (`2af2d0a`), so Priya was not the last person to touch the file either.
5. **The "prototype" commit does not show earlier design work.**
   - Its author date is 2023-11-02, but its committer date is **2024-05-09**, after Sam's module existed and after Priya's own other commits.
   - It sits in the history *after* the docs commit, so it was made in May 2024 with a backdated author date. Author dates are trivially settable, so don't treat 2023-11-02 as reliable.
   - It contains no code. `notes/prototype.md` is 10 placeholder lines ("proto line 1" and so on).
6. **Employment is unverified.** Priya's commits use a personal-style address (`gmail.example`). Sam's use the company domain (`brightlabs.example`). This could be benign, for example a personal export or a different git config. It does mean the repo doesn't show she was on that team.

## Caveats

- This is only the evidence in the export. History can be rewritten before export, so the dates and authorship are not tamper-proof.
- I can't see whether Priya did design work that never appears in commits, such as specs, reviews or pairing. The commits just don't show it.
- I read the diffs but didn't compile or run the code. The structs look like placeholder content, so I wouldn't judge code quality from this export.

## Suggested follow-ups

- Ask Priya to describe what she designed, and what the max-depth guard does and why.
- Ask her about the "Rewrite" commit and what it actually changed.
- Ask about the backdated prototype commit.
- Check her reference or employer for her role relative to Sam Okafor on this module.
- A fairer claim from the evidence would be "extended and documented the loop detection module, and renamed it", not "designed and wrote".
