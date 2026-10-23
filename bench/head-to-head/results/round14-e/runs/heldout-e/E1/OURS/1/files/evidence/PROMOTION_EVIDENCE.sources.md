# Sources for PROMOTION_EVIDENCE.md (not for the committee)

Verify: npx workproof figures --author "Priya Raman" --since 2026-01-01 --until 2026-06-30
Tool figures: 11 commits, 32259 added raw, 239 deleted raw, 7 large files (6 inspected, no licence headers; vendor/datasets/cities.json too large, read by eye).
Hand: 32259 - 30002 (02e743b) - 1800 (d9924c3) = 457; minus 120 (2b9c209, reverted by 24fb23e) = 337.

Items: 2449bc2 JSON export; 0b92a08 None-cell fix (identity "priya <priya@priya-laptop.invalid>", pending confirmation); 2aa6909 JSON tests; 80c7dba + bf435d7 export options (merged in f2bd651 by Tomasz Varga); 2468e12 CLI flag (author 2026-06-28, committer 2026-07-03); 16de668 sorting tests (feature b9feb81 by Lena Fischer, Co-authored-by Priya); 3462950 pagination docs; 2b9c209 cache, reverted by 24fb23e (revert message lacks the standard trailer, so the tool reports 0 reverts).
Excluded: 9307f24 merge, 2e0c683 (July), eda312d/d09ae19 (authored Dec 2025), ca96677/fa29641 (Tomasz Varga).
