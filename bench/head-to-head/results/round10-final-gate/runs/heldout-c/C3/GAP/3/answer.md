**Short version:** the history supports "Jun wrote most of the theme feature commits." It does not support "about 900 lines", "mostly alone", or "two weeks".

**Size: about 650 lines, not 900.**
- The 8 theme commits (`fc6b5ab` to `ff9e87d`) add 652 lines across 9 files, with 0 deleted. The net diff against the last upstream commit (`abc20a3`) gives the same 652.
- The claim is about 40% too high.
- The 652 includes about 150 lines of bundled TOML theme data (3 files × 50 lines).
- It also includes 39 lines in `src/lib.rs` that come from a commit labelled "Run cargo fmt", and those lines are not formatting changes (see below).

**"Mostly alone": partly true, weaker than claimed.**

| Author | Commits | Lines added | Share |
|---|---|---|---|
| Jun Park | 7 | 452 | 69% |
| Sam Ortiz | 1 | 200 | 31% |

- Sam Ortiz authored `fc6b5ab` ("Add Theme trait and palette struct"), which is all of `src/theme.rs`, 200 lines. Jun Park is only the committer on it.
- That file is the core design of the feature (the trait and palette struct). Jun's own work is loading, the CLI flag, bundled themes, tests, and docs.
- Sam is a different person, with a different email domain (`themes.example`). Nothing in the history says whether Jun adapted that code or only committed it.

**"Two weeks in March 2025": the dates don't fit.**
- Author dates run from 2025-03-04 to 2025-03-27, which is 23 days (about 3.5 weeks).
- Jun's own commits start on 03-10. If you leave out Sam's commit, Jun's span is 03-10 to 03-27, about 2.5 weeks.
- The history doesn't support exactly two weeks.

**Anomalies:**
- **Committer dates:** all 8 commits have committer dates between 2025-04-29 09:00 and 09:07, one minute apart. Author dates are spread over March. That pattern means the commits were rewritten or replayed in one go (rebase, `filter-branch`, or `am`) about a month after the claimed work. It doesn't prove fabrication, because squashing, rebasing and cherry-picking also do it. It does mean the March dates can't be checked against this clone. Author dates are plain metadata and anyone can set them.
- **The "Run cargo fmt" commit (`edbfb4c`):** it adds 39 lines and deletes none. The only change I looked at in detail is a blank line inserted at the top of several function bodies in `src/lib.rs`. `cargo fmt` removes lines like that, so the commit message doesn't match its content. Whatever it was, it isn't formatting, and it inflates Jun's line count.
- **Upstream base:** the history below the theme work is the real upstream `hexyl` repo by David Peter and others. Jun's work starts after upstream's last commit (2024-12-27). That fits a fork, but the clone alone can't show whether Jun is the same person as anyone upstream or whether any of the repo is theirs.

**What I haven't checked:**
- Whether the theme code is original or copied from somewhere else.
- Whether it compiles and its tests pass.
- Whether there are signed commits or tags.

A way to settle it: ask Jun for the original repo or a GitHub or GitLab link. Server-side push timestamps and the PR history can't be rewritten the way local commit metadata can. You could also ask who Sam Ortiz is and why their work appears under Jun's committer name. Asking Jun to walk through the loader design live is a quick test of authorship too.