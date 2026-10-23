# Review notes: Priya Nair's claim on the loop detection module

**Claim:** Priya Nair designed and wrote the symlink loop detection module at her last job in 2024.

**Verdict: the history does not support the claim.** It points to Sam Okafor as the original author. Priya's real contribution is small and came later.

## Who wrote what

| Work | Author | Date written (author date) |
|---|---|---|
| Original module: all 52 lines, created from scratch | Sam Okafor | 12 Feb 2024 |
| Tests for the module | Sam Okafor | 20 Feb 2024 |
| Move of the module to a new name, no content change | Priya Nair | 3 May 2024 |
| "Rewrite" of the module | Priya Nair | 3 May 2024 |
| Added a depth limit (12 new lines) | Priya Nair | 6 May 2024 |
| Documentation page | Priya Nair | 8 May 2024 |
| Handling of permission errors (7 new lines) | Sam Okafor | 20 May 2024 |

## What holds and what does not

- **"Designed and wrote it": does not hold.** Sam Okafor created the module and its tests nearly three months before Priya's first change to it.
- **The "rewrite" is not a rewrite.** It changed 45 lines, but only the indentation (tabs to spaces). With whitespace ignored, the two versions are identical. A plain line-by-line attribution tool credits Priya with 57 of the 69 current lines, because of this reformatting. Ignoring whitespace, Sam wrote 57 and Priya wrote 12.
- **What does hold:** Priya made real, dated changes. She added the depth limit (12 lines), moved the module, and wrote a documentation page. These are modest additions to Sam's work.
- **Reverts:** none found.

## Date irregularity to raise with her

Her "Initial loop detection prototype" is a 10-line notes file. Its author date is 2 Nov 2023, but it was recorded on 9 May 2024. That is six months earlier than the module it describes, which did not exist until Feb 2024. It is also out of order with her other work, and it is the only evidence of her working on this before Sam. An author date can be set to anything, so this is not reliable proof of early work. It could be innocent, for example a re-applied older note. It does need an explanation. No dates are in the future.

## Limits

- History shows who recorded changes, when, and what changed. It does not show who had the idea, or the quality of the work.
- Author names and dates are self-declared and can be edited. Nothing here proves either person's employer. Sam's address belongs to a company domain. Priya's is a personal address.
- The module's code is mostly simple data declarations, so it gives little to judge design skill on.
- This repository is a copy of a public open-source project (about 190 other commits are by other people). Only the loop detection work was examined.

## Suggested next steps

1. Ask Priya to explain the original authorship, the rewrite and the earlier-dated prototype note.
2. Ask for the real employer and a reference who can speak to the module.
3. If she describes her role as "extended and documented Sam Okafor's module", that matches the history.

Method and commit references: see `evidence/review-notes-sources.md`.
