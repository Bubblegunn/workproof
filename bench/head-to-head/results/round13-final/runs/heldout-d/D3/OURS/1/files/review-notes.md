# Review notes: Priya Nair's claim on the loop detection module

**Claim:** Priya Nair designed and wrote the symlink loop detection module at her last job in 2024.

**Verdict: the history does not support "designed and wrote". It shows Sam Okafor as the original author and by far the main author of the code that exists today. Priya's contributions are real but smaller: she moved the module, reformatted it, extended it and documented it.**

All figures below were counted by hand from the commit history, read-only. The history was not run through a tool. The filter is the loop detection module and its tests, plus the docs and notes that go with it. Dates are author dates unless stated.

## Who wrote what

| Date | Person | What the commit did | Holds up for the claim? |
|---|---|---|---|
| 12 Feb 2024 | Sam Okafor | Created the module: a 52-line first version | No. This is the original design and code, and it is Sam's. It predates any change by Priya. |
| 20 Feb 2024 | Sam Okafor | Added the tests for it (30 lines) | No. Sam's. |
| 3 May 2024 | Priya Nair | Moved and renamed the module's file, with no change to its contents | Real, but only housekeeping. |
| 3 May 2024 | Priya Nair | "Rewrite loop detection module" | Does not hold. Of the 45 lines changed, none differ once spacing is ignored. It is a reformat, not a rewrite. |
| 6 May 2024 | Priya Nair | Added a maximum-depth safeguard (12 new lines, 1 removed) | Holds. This is Priya's own code change. |
| 8 May 2024 | Priya Nair | Wrote documentation (20 lines) | Holds, but documentation is not the module itself. |
| 9 May 2024 (written 2 Nov 2023) | Priya Nair | A 10-line notes file called a "prototype" | Weak. See the date note below. |
| 20 May 2024 | Sam Okafor | Added handling for permission errors (7 lines added, 1 removed) | Sam continued working on it after Priya. |

## Who wrote the code that is there now

The module is currently 69 lines. Tracing each line back to the commit that wrote it, and ignoring spacing changes and the file move:

- Sam Okafor: 57 lines (about 83%)
- Priya Nair: 12 lines (about 17%), all from the depth safeguard

So Sam originated the module and wrote most of what is in it. Priya's share is one addition.

## Things to be aware of

- **The "rewrite" label is misleading.** The commit is described as a rewrite, but the only change is spacing. This is the strongest single point against the claim, because it is the commit that sounds most like authorship.
- **The November 2023 date needs care.** The notes file carries an author date of 2 Nov 2023, but it was committed on 9 May 2024, after her other work on the module. That pattern is typical of a commit that was replayed or re-dated. Author dates can be set by whoever makes the commit, so this cannot be taken as proof she was designing the module in 2023. The file also holds only ten generic placeholder-style lines, so I could not read it as a design.
- **Different email addresses.** Sam's commits use a company-style address (brightlabs). Priya's use a personal webmail address. That is not suspicious by itself. It does mean the history alone does not show that she worked at the same company as Sam, or at any company.
- **Both dates are recorded.** Every commit has an author date and a commit date. They match except for the notes file above. No dates are in the future.

## What the history cannot tell us

- It does not show who did the thinking. Priya could have designed the safeguard, or advised Sam, without it appearing in the history. The history only shows who committed the code.
- It does not show her employer, her role or her team, or whether Sam was a colleague.
- It says nothing about the quality of anyone's work.
- This is an export. I cannot tell whether commits were removed or rewritten before it was sent.

## Suggested next steps

1. Ask Priya to describe what she contributed, specifically the depth safeguard and the documentation, and to explain the "rewrite" commit. A fair answer is that it was a reformat.
2. Ask her to walk through the design: why a loop is detected the way it is, and what the alternatives were. Someone who designed it can answer that, whatever the history shows.
3. Ask for a reference from the previous employer who can confirm her role. Sam Okafor appears in the history and is a possible person to ask, but contact should go through her and with her consent.
4. If the claim stays at "designed and wrote", ask her to account for the 12 February 2024 commits, which are Sam's.

A fairer description of what the history supports: *Priya extended and documented a loop detection module that Sam Okafor created, adding a depth safeguard in May 2024.*

Identity note: I treated each name and email address as one person. I found no second name or address that looked like either of them. Please confirm if you know of others.
