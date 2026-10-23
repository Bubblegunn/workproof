# Weekly update: 8–12 September 2025

Prepared by Sora Tanaka

## Delivered

- **Fixed colour helpers failing in modern module-based projects.** The named colour imports from the colours module did not work in projects using native ES modules. The problem was reproduced, fixed, and covered by a regression check so it cannot quietly return. This was requested ahead of the client's Friday release and is complete. (8 Sept)
- **Documented how the library behaves when colour is switched off.** Added user-facing documentation explaining how the standard "no colour" setting is handled. (9 Sept)
- **Added test coverage for the "force colour" setting.** New checks confirm that setting it to off behaves the same as the no-colour setting, and also cover the on and unset cases. (11 Sept)

## Evaluated, not adopted

- **Faster start-up through lazy loading of the colour table.** A trial implementation was built and compared. It caused several existing checks to fail, so it was judged too risky for this release and was discarded. Nothing from it shipped.

## Still open

- No blockers or unfinished client deliverables from this week.
- Start-up speed remains a possible future improvement if the team wants to revisit it with a safer approach.
