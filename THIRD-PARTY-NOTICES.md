# Third-party notices

## receipts plugin (session miner)

- Used in: `src/sessions/mine-sessions.mjs` (the code behind `workproof sessions`).
- Original: `skills/receipts/scripts/mine-transcripts.mjs` in the receipts plugin of <https://github.com/anthropics/claude-plugins-official>.
- Licence: Apache License, Version 2.0. The licence text is in `src/sessions/LICENSE-APACHE-2.0`.
- Copyright holder: the original carries no copyright notice and the plugin ships no NOTICE file, so none is named here. The code is attributed to the receipts plugin authors as published in that repository.
- What was adapted: the transcript aggregation, kept as a local, offline reader of Claude Code session files. Changed from the original (Apache-2.0 section 4(b), also listed in the file header): the HTML report output and the CSV export were removed; the user-name field was removed; project labels carry no paths; the output is JSON on stdout only; an export folder can be read with `--dir`, and `WORKPROOF_HOME` selects the home folder.

No text from other rival plugins examined in `docs/BEST-RIVAL-r11.md` was copied into this repository.
