# Sources for WORK_SUMMARY.md (not for the officer)

Filter: author email d.volkov@northwind-logistics.example (names "Dmitri Volkov" and "D. Volkov"); author dates; 10 non-merge commits.
Verify: npx workproof figures --author d.volkov@northwind-logistics.example

1. Manifest search: 17e0002 (2025-01-20)
2. Invoice rounding fix: 11bcb91 (2025-02-03)
3. Large-manifest reader: 94b0627 (2025-04-09)
4. Time zone fix: 9dad6e5 (author date 2031-04-02 is in the future, committer 2025-07-15; no date given in the document)
5. Tests: cb0b931 (2025-08-25)
6. Docs: c849c89 (2025-10-02)

Not counted: 278a765 generated tables (5000 lines); 038bae8 deletion of a legacy exporter written by Aiko Tanaka (2500 lines removed); eea3146 loader config; ee84951 scratch note (author date 1970-01-01, omitted).

Figures: lines added, raw = 5622 (tool). Hand figure: 5622 - 5000 generated = 622, written as "about 620". The tool does not print this filtered figure. Whitespace-ignored count equals raw (5622). No large added file has a licence/source header (0 of 5).
