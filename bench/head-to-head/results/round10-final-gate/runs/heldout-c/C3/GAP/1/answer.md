**Short version:** the history supports "Jun wrote most of the theme feature, mostly alone". It doesn't support "about 900 lines", "alone" without qualification, or the two-week timeline.

**Scope.** I counted the 8 commits after upstream's last commit (`abc20a3`, "Bump version", Dec 2024). Together they add 652 lines and delete none, across 9 files. The rest of the 473 commits belong to other upstream authors, including David Peter.

| Author | Lines | Share | What |
|---|---|---|---|
| Jun Park | 452 | 69% | `theme_load.rs` 120, `theme_tests.rs` 80, 3 theme TOMLs 150, `lib.rs` 39, `main.rs` 35, README 28 |
| Sam Ortiz | 200 | 31% | `src/theme.rs`, the Theme trait and palette struct, in commit `fc6b5ab` |

- **Size:** 652 lines is about 28% below the claimed 900. Even if you drop the README, the 150 lines of TOML data and the tests, the code is smaller still. Jun's own share is about half of 900.
- **Alone:** Sam Ortiz wrote the foundation, and the other work builds on it. In that commit the author is Sam Ortiz (sam.ortiz@themes.example) and the committer is Jun Park. So Jun committed Sam's work, which looks like a cherry-pick, a patch applied from elsewhere, or a rebase. The history doesn't say which. `git blame` also attributes all 200 lines of `theme.rs` to Sam.
- **Timeline:** the author dates run from Mar 4 to Mar 27, 2025. That is 23 days, or about 3.3 weeks, over 8 commits. Jun's own commits start Mar 10, so their part spans 17 days, about 2.4 weeks. That is roughly in line with "two weeks" if you leave out Sam's commit.
- **Dates:** all 8 commits have a committer date of Apr 29, 2025, between 09:00 and 09:07. The author dates are spread over March. That pattern fits a rebase, a replay, or an import, and the history can't tell you why. Author dates are also easy to set to anything, so they don't prove when the work was done.

**Other oddities**
- "Run cargo fmt" (`edbfb4c`) adds 39 lines to `lib.rs` and changes nothing else. Formatting alone wouldn't add lines to a file that way. It looks like new code under a misleading message. I haven't read the diff, so I can't say whether it's theme code.
- All three theme TOMLs are exactly 50 lines each, which suggests copying from a template or generating them.

**What git can't tell you.** The history shows who committed the code and under which name and email. It doesn't show who wrote it. An author name and email can be set to anything. With only this clone, you also can't check whether the commits were rewritten. The unusual commit dates suggest they may have been.

**Ways to check:**
- Ask Jun who Sam Ortiz is and why their commit is in the history.
- Ask Jun to explain `theme_load.rs` and the parts that depend on `theme.rs`.
- Ask for the original repo or its PR history to compare against.