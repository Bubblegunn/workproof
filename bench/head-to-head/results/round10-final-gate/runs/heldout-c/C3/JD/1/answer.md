**Short version:** the history only partly supports Jun's claim. About 650 lines were added, not 900. Jun authored about 450 of them, roughly 70%. The "alone" part fails, and the dates can't be trusted.

**Size.** The theme work is 8 commits on top of upstream commit `abc20a3` (David Peter, Dec 2024). Together they add 652 lines, with no deletions, across 9 files.

| Commit | Author | Author date | Lines | Content |
|---|---|---|---|---|
| `fc6b5ab` | **Sam Ortiz** | Mar 4 | 200 | `src/theme.rs` (Theme trait and palette struct) |
| `92c6448` | Jun Park | Mar 10 | 120 | `theme_load.rs` |
| `8c2efd7` | Jun Park | Mar 12 | 35 | `--theme` flag in `main.rs` |
| `edbfb4c` | Jun Park | Mar 14 | 39 | "Run cargo fmt", `lib.rs` |
| `62be051` | Jun Park | Mar 20 | 150 | 3 TOML themes, 50 lines each |
| `d59a7e5` | Jun Park | Mar 24 | 80 | tests |
| `f9974a9` | Jun Park | Mar 26 | 26 | README |
| `ff9e87d` | Jun Park | Mar 27 | 2 | typo fixes |

**Ownership.**
- Jun authored 452 of 652 lines (69%), and 424 (65%) if you leave out the README.
- Sam Ortiz authored 200 lines (31%). That is the core `Theme` trait and palette struct, which the rest of the feature builds on.
- Jun is the committer on Sam's commit. That means it was applied or replayed into this repo, not written here.
- Jun alone doesn't reach 900 on any count, and neither does everyone combined.

**Timeline.**
- The author dates run Mar 4 to Mar 27, so about 24 days overall and 17 days for Jun's own commits. "Two weeks in March" is roughly consistent with that.
- The committer dates are a problem. All 8 commits have a committer date of 2025-04-29, one minute apart (09:00 to 09:07). That pattern means the history was rewritten or replayed in a single sitting, for example by a rebase, `filter-branch` or `git am`.
- Author dates are trivially settable, so the March spread proves nothing. The history doesn't show that the work happened over two weeks.

**Other oddities.**
- "Run cargo fmt" adds 39 new lines to `lib.rs` and deletes none. A formatting commit normally changes existing lines, so it is probably mislabelled feature work.
- The final commit is only a typo fix, and the README and tests make up 108 lines of the total.

**What I couldn't check.** I only looked at commit metadata and line counts, not the code quality, and I didn't run blame because of the rewrite. Sam Ortiz may be a real collaborator or an alias, and this clone can't tell you which. To settle it, ask Jun for the original repo or a PR link, and ask what Sam's role was. You could also ask Jun to walk you through `theme_load.rs`.