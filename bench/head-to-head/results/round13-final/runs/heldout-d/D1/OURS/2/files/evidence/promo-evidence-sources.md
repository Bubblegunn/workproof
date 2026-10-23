# Sources for promo-evidence.md (not for the committee)

Verify: npx workproof figures --author alex.rivera@northwind.example --author alex.rivera@users.noreply.github.example --since 2025-07-01 --until 2025-12-31 --doc promo-evidence.md

Filter: non-merge commits, author date 2025-07-01 to 2025-12-31, both addresses.
- 9 commits = tool "authored non-merge commits"; 12383 added / 100 deleted = tool raw lines (whitespace-ignored identical).
- Not counted: 8982bcf (merge), 7bcb190 + 3156407 (msgpack experiment and revert), 83a44bb (generated 12000-line snapshot, hand-read via git show).
- Delivered (6): 4389411 rotation helper, a6c5f5b rotation tests, 8829fe8 expiry metrics hook, e25df1f signature comparison hardening (noreply address), 7a82161 audit log, e2917d8 release notes.
- Hand-written 383 added = 60+45+80+40+55+3; net 283 = 383 - 100.
- Excluded: c568738 (Alex Rivero, different surname), 868c561 (2025-06-30), 519105e (2026-01-05).
