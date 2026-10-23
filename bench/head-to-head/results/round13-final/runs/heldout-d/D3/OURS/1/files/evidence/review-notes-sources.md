# Sources for review-notes.md (read-only git, run in the exported repo)

- Full history for the module: `git log --all --format='%h %an %aI %cI %s' -- src/loopdetect.rs src/loops.rs`
- Original module and tests: commits 59fe256 (12 Feb 2024, 52 lines), b224c6e (20 Feb 2024, 30 lines), both Sam Okafor
- Move only: `git show -M --stat 6fa64e8` shows a rename, 0 lines changed
- "Rewrite" is whitespace only: `git show -w --stat f2cc867` prints no changes
- Priya's safeguard: `git show -w 96cdd00` (12 added, 1 removed)
- Sam's later change: `git show 2af2d0a` (7 added, 1 removed)
- Notes file author/commit date gap: `git log --format='%h a:%aI c:%cI' c155069 -1`
- Line shares: `git blame -w -M -C -C src/loops.rs` gives 69 lines: Sam 57 (49 from 59fe256 + 1 + 7 from 2af2d0a), Priya 12 (96cdd00)
