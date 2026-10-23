# Review notes: Priya Nair's claim on `src/loops.rs`

**Claim:** Priya designed and wrote the symlink loop detection module (`src/loops.rs`) at her last job in 2024.

**Verdict: the git history does not support this claim as stated.** Sam Okafor created the module and wrote most of its current content. Priya's contributions are real but smaller: a file move, a whitespace-only "rewrite", a small addition, and docs.

## Who wrote what

| Date | Commit | Author | What it did |
|---|---|---|---|
| 2024-02-12 | `59fe256` Add loop detection for symlink cycles | **Sam Okafor** | Created the module (as `src/loopdetect.rs`, 52 lines). This is the original design and code. |
| 2024-02-20 | `b224c6e` Add loopdetect tests | **Sam Okafor** | Added the tests (30 lines). |
| 2024-05-03 | `6fa64e8` Move loop detection into loops module | Priya Nair | Renamed `loopdetect.rs` to `loops.rs`. No content change. |
| 2024-05-03 | `f2cc867` "Rewrite loop detection module" | Priya Nair | **Not a rewrite.** The diff is 45 lines in, 45 lines out. It is empty when whitespace is ignored (`git show -w`). It only converted tab indentation to spaces. |
| 2024-05-06 | `96cdd00` Add max-depth guard | Priya Nair | A real change. She added 12 new `depth_guard_*` fields (+12/-1). |
| 2024-05-08 | `0d899e2` Docs for loops module | Priya Nair | Added `docs/loops.md`. |
| 2024-05-09 (commit date) | `c155069` Initial loop detection prototype | Priya Nair | Adds only `notes/prototype.md`, which is 10 placeholder lines. It contains no code. |
| 2024-05-20 | `2af2d0a` Handle permission errors | Sam Okafor | Added 7 `perm_err_*` fields (+7/-1). |

## Line-level attribution of the current `src/loops.rs`

I ran `git blame` with whitespace changes ignored, so the reindent commit doesn't take credit for Sam's lines. Of the 69 lines in the file:

- **Sam Okafor: 57 lines.** That is 50 from the original commit and 7 from the permission-error fix. It's about 83%.
- **Priya Nair: 12 lines.** All are the depth-guard fields. It's about 17%.

Without `-w`, a plain `git blame` would credit Priya with most of the file, because of the reindent commit. That would be misleading.

## Red flag: the "prototype" commit

Commit `c155069` has an **author date of 2023-11-02**. That is about 3 months before Sam's first commit. Its **commit date is 2024-05-09**, after Priya's other work. Several things count against it as evidence of earlier work:

- Author dates are set by the committer and are trivial to change, so the date proves nothing on its own.
- The commit sits at the tip of the history, after her May 2024 commits. It was not made in November 2023.
- It contains only a placeholder notes file, with no code.

It is the only item that could be read as "Priya started this first", and it doesn't back that up. I can't say whether the date was set on purpose. It should be asked about.

## Other observations

- **Different identities.** Sam's commits use a company-style address (`@brightlabs.example`). Priya's use a personal Gmail-style address. I found nothing tying her to that employer in this repo, so it also doesn't confirm she worked there.
- **Scope of the file.** Everything in the module is a struct definition (named fields), with no visible algorithm for detecting cycles. The commit messages describe more than the code shows, and I can't judge the design quality from this alone.
- **Other history.** The repo also holds the history of a larger open-source project (about 196 commits, mostly by Andrew Gallant). The loop-detection commits are 8 on top of that. The 8 are the only ones that matter here.

## Limits of this check

- Git history can be rewritten, and an export is not an audited record. What I can say is that **this export contradicts her claim.** I can't prove the export is authentic.
- This does not show she did nothing. She did the module move, the depth guard, and the docs. "Contributed to and maintained" would be defensible. "Designed and wrote" is not.
- Real collaboration can leave a gap between commit authorship and who did the work, for example pair programming or one person committing for another. Neither fits the evidence here, but the candidate should have the chance to explain.

## Suggested follow-ups

1. Ask Priya to walk through the cycle-detection design, including why a depth guard was needed and what Sam's original approach was. Someone technical on the panel can judge the answers.
2. Ask about commit `c155069` and its November 2023 author date. Ask for any earlier prototype code.
3. Ask whether Sam Okafor can be contacted as a reference. Check with her stated employer, rather than relying on the export.
4. Treat the "designed and wrote" claim as unverified until those answers come back.
