**Short answer:** the history supports about 450 of the ~650 lines as Jun's, not 900. It doesn't support "mostly alone" or "built over two weeks" as stated, and the dates are weak evidence anyway.

**What the history shows**
- The repo has 473 commits. 465 are upstream work by David Peter and others, ending 2024-12-27. The theme feature is the 8 commits on top, and the only way to tell it's a fork of an existing project is from this history.
- Those 8 commits add 652 lines across 9 files, with no deletions. That is the whole feature.

| Author | Commits | Lines added |
|---|---|---|
| Jun Park | 7 | 452 (69%) |
| Sam Ortiz | 1 | 200 (31%) |

**Claim by claim**
- **About 900 lines:** not supported. The total is 652, which is about 72% of the claim.
  - Jun's own lines come to 452, about half of 900.
  - Of those 452, 150 are TOML theme data (3 files × 50), 80 are tests and 28 are README. That leaves 194 lines of Rust in `src/theme_load.rs`, `src/main.rs` and `src/lib.rs`.
- **Mostly alone:** partly holds. Jun wrote 69% of the lines and 7 of the 8 commits.
  - The foundation isn't theirs. Sam Ortiz authored the first commit, `fc6b5ab`, "Add Theme trait and palette struct". It adds all 200 lines of `src/theme.rs`, the largest single file in the feature.
  - Jun committed that change (committer is Jun Park), so Jun applied it or imported it. Whether Sam wrote it independently or Jun copied it can't be told from the history.
  - Everything Jun wrote builds on that file.
- **Two weeks in March 2025:** the author dates are consistent with it, but they prove little.
  - The author dates run 2025-03-04 to 2025-03-27, which is 23 days overall. Jun's own commits run 03-10 to 03-27, which is 17 days. That is roughly 2.5 weeks, not two.
  - All 8 commits have the same committer date, 2025-04-29, between 09:00 and 09:07. They were created or rewritten (rebase, `format-patch`/`am`, or a script) within 7 minutes, about a month after the stated dates.
  - Author dates are free text that anyone can set, so the March dates are not independent evidence. The history can't confirm the work happened in March.

**Other caveats**
- The commit "Run cargo fmt" (`edbfb4c`) adds 39 new lines to `src/lib.rs`. That is more than formatting, and the message undersells it.
- Line counts are a crude measure of effort. Nothing here shows design ownership, review or whether the code works.
- A clone can't show other branches, PRs or reviews, and the emails are not verified identities.

**What I'd do next**
- Ask Jun for the original repo or PR link.
- Ask who Sam Ortiz is and how `theme.rs` came into the repo.
- Ask why the committer timestamps are all 2025-04-29.
- Ask Jun to walk through `theme_load.rs` live.