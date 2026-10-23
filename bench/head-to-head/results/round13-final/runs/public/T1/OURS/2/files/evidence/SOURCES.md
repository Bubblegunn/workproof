# Sources and verification (for a technical verifier, not the visa reader)

Repository HEAD 249bbdc. Identities: <email:d29caa5c> (configured), plus <email:4132b6bd> and <email:266aea16> (included: same name / same GitHub login, please confirm).

| Figure in work-summary.md | Source |
|---|---|
| 56 / 63 changes, 13 merges, 1 revert (5e443cf reverts 2a94e82), 19 by others committed by identity | `npx workproof figures --author ...` -> figures.txt (the 56 and 19 are from the run with the configured address only) |
| 230 changes by all authors, 60 authors | same tool, "all authors" / "distinct authors" lines |
| 1,276 / 1,762 raw; 1,200 / 1,686 whitespace ignored | same tool, with all three addresses |
| 697 of 1,417 lines surviving (49%) | workproof-report.md/json (blame at HEAD) |
| 17 releases | hand count of version-number commits (3.0.1 ... 4.6.0); matches "17 of 23 release tags" in the report |
| 389 added / 630 removed (rewrite) | hand: `git show --stat 4d2a63c` |
| 386 lines of examples removed | hand: `git show --stat 46743f0` |

Verify: `npx workproof verify evidence/workproof-report.json` in the repository (result when written: all figures reproduce, hash 6380b25d...).
Countersign (optional, by someone with their own clone): `npx workproof countersign evidence/workproof-report.json --key <ssh-key>`.

Limits: the history shows what, who and when; it does not show hours, quality or the engagement terms. Rewritten history would still reproduce.
