# Promotion evidence: Priya Raman, 1 January to 30 June 2026

Prepared from the project's change history. The committee does not see the code, so this describes the work in plain terms. Dates are the date each change was written (author date), not the date it was merged. Only work written inside the window is counted.

## What was delivered

1. **Export of tables to JSON** (written 12 January). A new capability, about 60 lines. A follow-up fix so that empty cells export correctly (20 January, 5 lines) is included on the assumption that it is mine; see "To confirm" below.
2. **Automated checks for the JSON export** (14 March, about 90 lines), covering the feature above.
3. **Export options** (10 and 12 March, two changes, about 47 lines in total), merged together through a colleague's merge (the history does not show review comments).
4. **Command-line switch for JSON export** (written 28 June, about 45 lines). It reached the main line on 3 July, after the window closed. It counts because it was written inside the window, but a reader should know it landed later.
5. **Rewritten checks for stable sorting** (2 June). The sorting feature itself was written by a colleague, Lena Fischer, who credited me as co-author on it. That credit is not counted as my commit, only mentioned here. My own change replaced a larger set of checks with a tighter one (55 lines added, 119 removed).
6. **Documentation explaining pagination** (15 April, about 40 lines).

## Tried and reverted

A caching layer for paginated tables (about 120 lines, written 5 March) was withdrawn the next day because it slowed small tables down. The revert message records that reason. It is shown here rather than hidden; it is not counted as a delivery.

## How much, roughly

The per-item line counts above are my own reading of each change's size (hand figures, not printed by the tool); they add up to the hand-computed total below.

| Figure | Value | What it covers |
|---|---|---|
| Commits authored | 11 | My work address, written 1 Jan to 30 Jun 2026, merges excluded |
| Lines added, raw | 32259 | Same filter. Misleading: see below |
| Lines deleted, raw | 239 | Same filter |
| Lines written, hand-computed | 457 | Raw added lines minus the two items below |
| Lines written and still standing | 337 | The 457 minus the withdrawn caching layer (120) |

Why the raw figure is not the real one: of the 32259 added lines, 30002 are a sample data file for benchmarking and 1800 are an automatically generated list of dependency versions. Neither was written by hand, so I removed both. The remaining 457 are hand-written; the 457 includes the withdrawn caching layer, which is why a second figure (337) is given for work that is still in the product. The 457 is my own subtraction from the tool's raw figure, not a figure the tool prints. Lines written is a rough measure of effort, not of value; the sorting test change shrank the codebase on purpose.

## Not counted

- A merge of a side branch (11 May): housekeeping, no new work.
- The withdrawal of the caching layer (6 March): reverses item above.
- The sample data file and the generated dependency list (February): not hand-written.
- A short documentation note dated 14 July: outside the window.
- Two small helper changes dated 29 and 30 December 2025: written before the window, although saved to the repository on 8 and 9 January 2026. Author date used.
- A spreadsheet-format option (4 May) and a side experiment (8 May): written by a colleague, Tomasz Varga. The first thanks me for reviewing it; the history cannot show how much review I did.

## How far the numbers can be trusted

- **Reliable:** commit count, dates and the split between hand-written and generated material. These come straight from the history, and I checked the main large files for licence or copyright headers; none had one (one very large data file was too big for the automatic check, so I read its opening by eye: plainly synthetic placeholder data).
- **Approximate:** line counts. They vary with style, and they say nothing about difficulty or impact.
- **Not shown by the history:** hours spent, quality, who reviewed what, or whether features are used. The history records what was saved, by whom, and when. Impact claims (adoption, time saved) would need evidence from outside the repository, such as users, tickets or reviewer comments.
- **Shared repository:** several colleagues contribute. These figures are for my work only.

## To confirm

One change (the empty-cells fix, 20 January) is saved under a different name and address, a laptop login "priya" rather than my work address. I included it on the basis that it is the same first name and falls between my other JSON export work. Please confirm it is mine. If so, lines written become 462 (342 still standing) and commits 12; I have not folded it into the table above. The two December helper changes carry the same laptop identity and are outside the window either way.
