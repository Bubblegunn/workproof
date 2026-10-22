The history supports part of the claim and contradicts part of it.

**What holds up**
- **Jun's own work:** 7 of the 8 theme commits are authored by Jun Park. Together they add **452 lines** (+0 deletions), about half of the "~900" claim.
- **Dates:** Jun's author dates run 10 to 27 March 2025, about 2.5 weeks, which is roughly the "two weeks" they described.
- **Existence:** a theme feature is there, with loading, a `--theme` flag, three bundled themes, tests and README docs.

**What doesn't hold up**
- **Total size:** the whole theme feature is **652 lines added** across 9 files (`git diff abc20a3 HEAD`), not 900.
- **Not mostly alone:** the first commit, `fc6b5ab`, was authored by **Sam Ortiz** on 4 March. It adds `src/theme.rs` (200 lines, the Theme trait and palette struct) and is about 31% of the feature. The rest of the feature builds on it.
- **Jun's 452 lines break down as:**

| Part | Lines |
|---|---|
| Rust code and tests | 274 (`theme_load.rs` 120, `main.rs` 35, `lib.rs` 39, `theme_tests.rs` 80) |
| Theme TOML files | 150 (3 × 50, which are data files and probably near-identical in structure) |
| README | 28 |

Without the TOML and README, Jun's code comes to about 274 lines.

**Oddities in the history**
- **Commit dates:** all 8 theme commits have a committer date of **29 April 2025, 09:00–09:07**, one minute apart. That points to a rebase, `cherry-pick` or `filter-branch` replay, or an import of patches. Author dates are easy to set, so the March dates are not independent evidence.
- **Sam's commit:** the committer on Sam's commit is Jun, so Jun applied it themselves. That is consistent with Jun building on Sam's work.
- **"Run cargo fmt":** `edbfb4c` adds 39 lines to `src/lib.rs` and removes none. A real formatting pass would normally change existing lines, so this looks like new code under a formatting label.
- **Upstream history:** the 473-commit history includes earlier work by David Peter and others (the last upstream commit is from December 2024). Jun's work is a small layer on top of an existing project, with no other branches.

**Limits**
- Git history alone can't show who wrote the code. Author names, emails and dates can all be edited.
- I didn't read the code itself, so I can't say whether the work is substantive.
- Sam may have contributed more outside this clone, or Jun may have contributed to Sam's file in discussion.

**Questions for Jun**
- Why does Sam's commit sit under the feature without being mentioned?
- Why were all the commits replayed on 29 April?
- Can they show the original repo or pull request?

I'd describe it as Jun having written about 450 of 650 lines, building on a colleague's 200-line base. That is not the "900 lines, mostly alone" they claimed.