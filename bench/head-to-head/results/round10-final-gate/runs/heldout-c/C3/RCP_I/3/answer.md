Only part of the claim holds up. The history shows about 650 lines, not 900. Jun wrote roughly 70% of them, and the two-week March timeline isn't supported.

**Size: about 650 lines, not 900**
- The theme work is 8 commits, all additions with no deletions, and they touch 9 files.
- That comes to 652 lines added. Even if you count the lines tied to Jun's own commits plus Sam's, the total doesn't reach 900.
- Jun's claim is about 38% too high.

**Authorship: about 70% Jun's, with a collaborator**

| Author | Commits | Lines added | Share |
|---|---|---|---|
| Jun Park | 7 | 452 | 69% |
| Sam Ortiz (sam.ortiz@themes.example) | 1 | 200 | 31% |

- Sam wrote `src/theme.rs` (200 lines, the Theme trait and palette struct), which is the first theme commit (`fc6b5ab`). Jun committed it, but the author field is Sam's.
- Jun's 452 lines break down as:

| Lines | Work |
|---|---|
| 150 | the 3 bundled theme TOML files |
| 120 | `src/theme_load.rs` |
| 80 | `tests/theme_tests.rs` |
| 39 | `src/lib.rs` (the "Run cargo fmt" commit) |
| 35 | the `--theme` flag in `src/main.rs` |
| 28 | README |

- "Mostly alone" is roughly fair, since Jun wrote about 70%. But the foundation that everything else builds on isn't Jun's.
- The rest of the repo is the open-source `hexyl` project by David Peter and others, which is about 1,000 commits going back to 2018. None of that is Jun's.

**Timeline: the dates don't hold up**
- The author dates run from 4 March to 27 March 2025. Jun's own commits run 10 to 27 March, which is 17 days (about 2.5 weeks), or 23 days if you include Sam's.
- The committer dates tell a different story. All 8 theme commits were committed on 29 April 2025, between 09:00 and 09:07 UTC, one minute apart.
- That pattern is what a rebase, a cherry-pick, an `am` import or a scripted replay produces. It isn't what two weeks of real work looks like.
- Author dates are trivially editable (`git commit --date`), so they prove little by themselves. The identical-minute committer dates show the history was rewritten or replayed after the fact.
- The history doesn't show who did the rewriting or why. It could be innocent, such as squashing, importing patches from another repo or cleaning up for sharing, or it could be an attempt to make the history look better. The history alone can't tell you which.

**What the history can't tell you**
- It can't tell you whether Jun and Sam are separate people. Sam's email is on a different domain from Jun's, but that is only an email address.
- It can't tell you what the original repo looked like before it was rewritten.

**What to ask Jun**
- Who is Sam Ortiz, and did Sam write `theme.rs`?
- Why are all the commits timestamped 29 April?
- Can Jun show the original repo, a PR or a code review thread from March?