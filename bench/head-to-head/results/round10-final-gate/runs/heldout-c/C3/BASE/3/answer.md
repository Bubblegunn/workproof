Going by the git history alone, the claim holds up only in part. The "about 900 lines" figure and the "mostly alone" part are weaker than Jun says.

**Lines**
- The theme-related commits add 652 lines in total, not about 900.
- Jun is the author of 452 of those lines, about 69%. They are in `theme_load.rs` (120), `theme_tests.rs` (80), the three theme TOMLs (150), `main.rs` (35), the README (28) and the `lib.rs` change (39).
- 200 lines (31%) are authored by someone else: **Sam Ortiz** (`sam.ortiz@themes.example`) wrote `src/theme.rs`, the "Theme trait and palette struct" commit `fc6b5ab`. `git blame` attributes all 200 lines to Sam Ortiz. Jun is only the committer on that commit.
- That 200-line file is the foundation the rest builds on. Sam appears nowhere else in the history.
- Jun's 452 lines include 39 added in `lib.rs` that are not real work. The commit is titled "Run cargo fmt", but it only inserts blank lines at the start of function bodies. That does nothing for the theme feature. Without those lines the figure is about 413.
- If you count only the real theme code and tests (no README, no `lib.rs` padding, no TOML data), Jun wrote 235 lines (120 + 80 + 35).

**Timeline**
- The author dates run from 4 March to 27 March 2025. Jun's own commits run from 10 March to 27 March, about 2.5 weeks. That roughly matches "two weeks in March".
- Every theme commit has a committer date of 29 April 2025, between 09:00 and 09:07, one minute apart. Author dates can be set freely, and the identical committer timestamps suggest the commits were created or rewritten in a single batch (rebase, cherry-pick or import) rather than over two weeks.
- The history is therefore consistent with the story, but it can't show that the work happened when it says.

**Other oddities**
- `src/theme.rs` is filler. It contains functions like `theme_1`, `theme_2` and so on, each doing `x.wrapping_add(n)`. It has no Theme trait or palette struct, despite the commit message. Nothing I checked shows it is used by the theme code.
- The earlier history is the upstream `hexyl` project by David Peter and others, ending 27 December 2024. Jun has no commits there, so the theme work sits on top of the upstream code.

**Verdict**
- Jun did write most of the loader, the flag wiring, the bundled themes, the tests and the docs, which is about 450 of 650 lines.
- "About 900 lines" is overstated by roughly a third.
- "Mostly alone" is only roughly true: a third of the lines are Sam Ortiz's and are the base layer.
- The commit dates can't be trusted, because of the batch committer timestamps.
- A clone can't settle authorship. To check further, ask Jun about Sam Ortiz and the original repository or PR history.

I only read the git history and `blame`. I didn't build the code or run the tests.