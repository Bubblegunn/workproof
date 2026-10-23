Only one of the five claims holds up, and it holds only in part. I checked them against `git log` on this checkout, which is the `anyhow` crate plus a `tools/errtrace` directory added in 2025.

| # | Claim | Verdict | What the history shows |
|---|---|---|---|
| 1 | 214 commits in 2025 | **False** | Sam has 15 commits in 2025, and the whole repo has only 20 for that year. Only 8 use the identity he gave us (`mailbox.example`). The other 7 use `sam.lindqvist@othercorp.example`. |
| 2 | Sole author of errtrace | **False** | He wrote 11 of the 16 errtrace commits. Wen Zhao wrote 3 (public helpers, renderer, a render test) and Tariq Mansour wrote 2 (frames and tables tests). |
| 3 | Over 11,000 lines of Rust | **Technically true, misleading** | He added 11,886 lines of Rust. But 11,500 of those are one commit, "generate symbol tables", which produced `table.rs`. That leaves about 386 hand-written lines. |
| 4 | Continuous Jan–Dec 2025 | **False** | His commits fall between 4 March and 15 September 2025, in Mar, Apr, Jun, Jul, Aug and Sep. He has none in Jan, Feb, May or Oct–Dec. Six of the seven `othercorp` commits each add one line to `tests.rs`. |
| 5 | Shipped in release 1.0.100 | **Unsupported** | The repo has no tags. `Cargo.toml` is at 1.0.95, and the last release commit is "Release 1.0.95" on 22 Dec 2024. Every errtrace commit comes after that, and no 1.0.100 exists here. |

- **Claim 3 detail:** `table.rs` is 11,500 lines of numbered constants (`SYM_1`, `SYM_2` and so on). I only looked at the first lines of the file, so it may have been produced by a generator. His other work is small: a 100-line `lib.rs` skeleton, 150 lines of frame collection and a 90-line `metrics.rs`.
- **Claim 4 detail:** The 8 `mailbox.example` commits cover March and April and include 4 one-line "docs: typo" commits. The 7 `othercorp` commits cover June to September.
- **Two identities:** I can't tell from the history whether both addresses are really his. If they are, the 15 commits are the most generous count. The `othercorp` address may mean he was employed elsewhere during that period. That is worth asking him about, not a conclusion.
- **Scope:** I only checked the git history. It can't show whether he did other work off-repo or whether the `anyhow` release numbering is what he meant.

On the evidence in this checkout, the claims are heavily inflated: 15 commits against 214, shared authorship, and a ~386-line hand-written core. Real work is visible, though: the errtrace skeleton, frame collection and symbol-table generation. I'd treat the gap as a credibility problem. If you still want to talk to him, ask him directly about the commit count, the second email address and the release claim.

I didn't run the receipts skill's mining script or write any files. That skill reports on your own Claude Code usage and isn't built to audit someone else's repo.