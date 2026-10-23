# Weekly update: 8–12 September 2025

Prepared by Sora Tanaka

## Delivered

- **Colour library works correctly with modern module loading (8 Sep).** Named imports from the colour helpers were failing in current JavaScript environments. This is fixed and a regression test now guards against it coming back. It was reproduced first, and the new test passes.
- **Documentation for the "no colour" setting (9 Sep).** Added a guide explaining how the library behaves when users turn colour output off.
- **Extra test coverage for forced-colour settings (11 Sep).** New tests confirm that turning colour off, forcing it on, and leaving it unset each behave as intended.

## Still open

- **Dependency upgrades:** the review of development dependencies was written up on 12 Sep. The upgrades themselves have not been applied yet.
- **Start-up speed experiment:** a trial of loading colour data on demand was tried and set aside because it made some tests fail. No change was released and it is not planned for now.
