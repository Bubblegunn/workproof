# Sources (read-only git, run in the exported repo)

Filter: all branches, history of src/loops.rs (including its earlier name src/loopdetect.rs); author date used.
No workproof figures were used (rule: other people's claims use read-only git).

- git log --all --follow --numstat -- src/loops.rs
  59fe256 Sam Okafor 2024-02-12 +52 (creates src/loopdetect.rs)
  b224c6e Sam Okafor 2024-02-20 tests
  6fa64e8 Priya Nair 2024-05-03 rename only (0 lines changed)
  f2cc867 Priya Nair 2024-05-03 45+/45- ("rewrite")
  96cdd00 Priya Nair 2024-05-06 +12/-1
  0d899e2 Priya Nair 2024-05-08 docs/loops.md
  2af2d0a Sam Okafor 2024-05-20 +7/-1
- git diff -w 6fa64e8 f2cc867  -> empty (whitespace-only rewrite)
- git blame --line-porcelain: Priya 57 / Sam 12
- git blame -w -C -C -M --line-porcelain: Priya 12 / Sam 57 (69 lines)
- c155069 (notes/prototype.md): authored 2023-11-02T12:00+05:30, committed 2024-05-09T10:00+05:30
