# Weekly update: 8–12 September 2025

Prepared by Sora Tanaka.

## Delivered

- **Fixed named imports in the colour library under native module loading (8 Sept).** Named imports of the colour helpers failed in modern module-based projects. We reproduced the problem, corrected it, and added an automated check so it cannot quietly return. The check passes.
- **Documented how the library behaves when colour is switched off by the user's environment (9 Sept).** A new documentation page explains the behaviour, so teams know what to expect in logs and CI output.
- **Added automated tests for the "colour forced off / forced on" setting (11 Sept).** The tests cover the setting turned off, turned on, and not set at all, confirming that turning it off behaves the same as the standard "no colour" preference.

## Still open

- **Startup-speed improvement: not adopted.** We tried loading the colour table on demand to reduce start-up time. It caused test failures, so it was set aside and nothing from it was released. It could be revisited with a safer approach if start-up time becomes a priority.

## Scope

This covers work I authored in the repository, dated by the date each change was written. Other contributors' work is not included.
