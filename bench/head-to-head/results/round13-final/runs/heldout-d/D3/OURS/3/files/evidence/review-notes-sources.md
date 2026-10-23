# Sources for review-notes.md (read-only git, no workproof figures: this is another person's claim)

- 59fe256 Sam Okafor 2024-02-12, src/loopdetect.rs +52 (original module)
- b224c6e Sam Okafor 2024-02-20, tests +30
- 6fa64e8 Priya Nair 2024-05-03, pure rename loopdetect.rs -> loops.rs (0 lines changed)
- f2cc867 Priya Nair 2024-05-03, 45+/45- but `git diff -w --quiet 6fa64e8 f2cc867` succeeds: whitespace-only
- 96cdd00 Priya Nair 2024-05-06, +12/-1 (depth_guard fields)
- 0d899e2 Priya Nair 2024-05-08, docs/loops.md +20
- c155069 Priya Nair author date 2023-11-02, committer date 2024-05-09, notes/prototype.md +10 (placeholder text)
- 2af2d0a Sam Okafor 2024-05-20, +7/-1 (perm_err fields)

Line share: `git blame -w -M -C --line-porcelain src/loops.rs | grep '^author ' | sort | uniq -c`
 -> Sam Okafor 57, Priya Nair 12 (69 lines). Without -w: Priya 57, Sam 12 (misleading, due to whitespace rewrite).
Dates: `git log --all --format='%h %an | %ad | %cd' --date=iso`
Hand-counted from git; not produced by `workproof figures`.
