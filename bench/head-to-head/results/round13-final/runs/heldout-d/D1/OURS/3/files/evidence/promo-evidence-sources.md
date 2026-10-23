# Sources for promo-evidence.md (internal, not for the committee)

Verify: npx workproof figures --author alex.rivera@northwind.example --since 2025-07-01 --until 2025-12-31

Commits counted (author date):
- 4389411 2025-07-08 key rotation helper (+60)
- a6c5f5b 2025-07-22 rotation tests (+45)
- 83a44bb 2025-08-12 generated API snapshot (+12000) - commit counted, lines excluded
- 8829fe8 2025-08-19 token expiry metrics hook (+80)
- 7bcb190 2025-09-09 msgpack experiment (+100) - reverted
- 3156407 2025-09-16 revert of the above (-100)
- e25df1f 2025-10-01 harden signature comparison (+40) - noreply address, same name; included pending confirmation
- 7a82161 2025-10-28 audit log (+55)
- e2917d8 2025-12-31 release notes (+3)
Not counted: 8982bcf merge; c568738 (Alex Rivero, different surname); 994fb16, 1ee5319 (Maya Chen).
Note: the tool's revert count is 0 because 3156407 lacks the "This reverts commit" text; found by hand.
Arithmetic: work account 343 added (60+45+80+100+55+3), 100 deleted; with e25df1f 383 added, net 283.
Per-theme commit counts (2,1,2,2,2 = 9) and the 12,000 / 100 line figures are hand tallies of the list above; the tool has no per-theme or per-commit figure.
