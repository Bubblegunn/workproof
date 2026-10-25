Writer w17: five audit tasks from one compliance/security auditor job. Facts about the upstream repositories (what they are, their layout) are from memory except what was read from the clones. Validation: each fixture built twice, same HEAD, truth.py output equal to truth.txt (see bottom).

t1 pallets/itsdangerous (Python), pin 1ad903dd. Review independence on signer.py, encoding.py, .github/workflows since 2025-03-01. Hazards: Reviewed-by trailer at an alternate address of the author (mailmap), Co-authored-by, re-commit by another committer, GitHub squash committer, bot, self-merge vs merge by other, mixed-author branch, pre-window commit. Conventions: only trailers are positive review evidence; merge by another person is integration, not approval; identity by .mailmap.

t2 mattn/go-isatty (Go), pin a7c02353. Out-of-window changes (Mon-Fri 08:00-20:00 America/New_York) for 2026-01-01..2026-06-30 NY dates. Hazards: DST, UTC vs NY dates at range ends, rebased commit author vs committer date, branch commit landed by merge, 20:00:00 boundary, bot, future and earlier-than-parent clocks, one person two addresses. Conventions: landing = first-parent commit at committer date; 08:00 inclusive, 20:00 exclusive; unreliable clocks reported not counted.

t3 sindresorhus/p-limit (JS), pin 7d14b3f0. Identities outside an approved list. Hazards: name match with unknown address, e-mail case, committer differs, look-alike bot address, GitHub committer accepted, Co-authored-by, build-host committer, outside contributor via merge. Conventions: case-insensitive e-mail; trailers are not identities.

t4 dtolnay/itoa (Rust), pin 758499d5. Quiet back-outs in config/policy.toml (synthetic file). Hazards: reverts without the word, revert of revert, revert-named commits that change no value or another file, block removal, upstream reverts. Conventions: key-level value history; durations between recorded commit dates.

t5 sinatra/mustermann (Ruby), pin 573cd316. Accountability table for a module renamed access/ -> authz/. Hazards: rename, whitespace reindent, vendored and generated files, bot, mailmap vs same-name identity, Co-authored-by, unrelated commit. Conventions: blame -w -M at HEAD, vendor and generated excluded; commits counted across the rename.

Validation 2026-10-25: all five fixtures built twice with identical HEAD sha; truth.py output equal to truth.txt on both builds.
