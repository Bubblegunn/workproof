# Review notes: Priya Nair's claim to have designed and written the symlink loop detection module (2024)

## Verdict

**The history does not support the claim as stated.** The original module was written by a different person, Sam Okafor, three months before Priya Nair's first change to it. Priya Nair's own contribution to the code is small and later. The history does show real, dated involvement, so this is "overstated", not "fabricated".

## Who wrote what (author dates used)

| Date | Who | What |
|---|---|---|
| 12 Feb 2024 | Sam Okafor | Created the loop detection module from scratch (52 lines). |
| 20 Feb 2024 | Sam Okafor | Added its tests (30 lines). |
| 3 May 2024 | Priya Nair | Renamed and moved the module. No lines of code changed. |
| 3 May 2024 | Priya Nair | A "rewrite" that changes only spacing and indentation. The content is identical once spacing is ignored, so it is not a rewrite. |
| 6 May 2024 | Priya Nair | Added a block of depth-limit settings (about 12 lines). This is real, but small. |
| 8 May 2024 | Priya Nair | Wrote a 20-line documentation page. |
| 9 May 2024 (see flag below) | Priya Nair | Added a 10-line notes file titled as a prototype. It contains placeholder text only and no working code. |
| 20 May 2024 | Sam Okafor | Added permission-error handling (about 7 lines). |

## Share of the current module

Of the 69 lines in the module today, **Sam Okafor wrote 57 and Priya Nair wrote 12**. This counts who wrote each line, with spacing-only changes and the rename ignored. A plain count that ignores that gives a misleading picture (57 for Priya, 12 for Sam), because the spacing-only "rewrite" makes Priya look like the author of most lines. This is the one place where careless reading of the history would wrongly back the claim.

## Things that need a flag

- **Backdated entry.** The "prototype" notes entry carries a creation date of 2 Nov 2023, which would put it before Sam Okafor's work. It was actually recorded on 9 May 2024, and it sits after other May 2024 entries in the sequence, so its earlier date cannot be genuine ordering. Dates like this can be set by hand or produced by replaying history. It is the only entry that would support "earlier than Sam", and it contains no code, so it proves nothing about design.
- **Spacing-only "rewrite".** The entry described as a rewrite makes no change to the substance. The description overstates the work.
- **Dating is Priya Nair's to explain.** I used the author date throughout. All other entries have matching author and recorded dates. No dates are in the future.

## What the history can and cannot show

- It shows who recorded each change, and when. It does not show who designed the approach, how long anything took, or its quality.
- The names are whatever was configured on each person's machine, and the export could have been edited before it was sent. I cannot rule that out from the repository alone.
- Priya Nair may have contributed design ideas, review or discussion that never appear in the history. Nothing here shows or disproves that.
- The earliest history in this export belongs to a well-known open-source project. It is unrelated to this question.

## Suggested next steps

1. Ask Priya Nair directly: who is Sam Okafor, what was the relationship, and why the module's first version carries Sam Okafor's name. Ask about the 2023 date on the notes entry.
2. Ask for a design document, ticket, or review thread from 2024 that shows design ownership.
3. With the candidate's consent, check with the former employer or Sam Okafor.
4. A fair, supported wording of the claim would be: "extended and documented the loop detection module and added the depth limit (May 2024)".

Source references and how to re-check are in `evidence/review-notes-sources.md`.
