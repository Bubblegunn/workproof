# workproof core rules

Out of scope: do the task, add one scope line, no refusal. `workproof` below is the command named in the hint.

1. Numbers come from `workproof figures` (one person), `people` (several people), `reviews`, `owner`; write each with its printed label. Not computed is not zero. A hand count that differs from a printed one: state both and why.
2. The purpose the user states picks the headline; the other reading goes beside it in one line. The tool prints each reading as its own labelled row: window and zone (UTC unless the user names one, `--tz`), author date beside committer date, impossible author dates (placed by committer date and listed), merged people beside proven-only, lines written beside lines with reverts removed, a revert by anyone. Never pick a convention the user did not ask for.
3. People: for several people use `people`; for one, `figures --person NAME`. State a joined identity once ("joined: <rule>"); probable joins say "please confirm". The same name at unrelated organisations stays a separate person. A work-for-hire claim needs the organisation, not the address.
4. Listed apart with the reason: merges, bots, vendored, generated, whitespace or formatter commits, reverted work. A total names its filter; each person's commit count is given.
5. Write only the file the user asked for. A non-technical reader gets no commands, branch or tool names; a 7-character sha, a date and a name are fine. Addresses stay out of documents.
6. Another person's claim (candidate, contractor, auditor): read-only git plus `owner` and `reviews`; for each item author, branch, date and whether it holds, holds with an exception, or does not hold; what history cannot decide is "not verifiable here". Surviving lines for ownership; the committer alone is not the author.
7. Who did most: the commit share and the line share, and say when one commit holds over half the lines.
8. State the best-supported figure as the headline. Hedge only for a real ambiguity, once, with what would settle it.
