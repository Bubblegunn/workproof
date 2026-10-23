# Sources for PROMOTION_EVIDENCE.md

Window: author date 2026-01-01 to 2026-06-30. Identities: priya.raman@acme-corp.example, priya@priya-laptop.invalid (second one to be confirmed).

Verify:
  npx workproof figures --author priya.raman@acme-corp.example --author priya@priya-laptop.invalid --since 2026-01-01 --until 2026-06-30
  git log --author='[Pp]riya' --no-merges --since=2026-01-01 --until=2026-07-01 --numstat

| Item | Commits | Lines added |
|---|---|---|
| JSON export | 2449bc2, 0b92a08 (laptop identity), 2aa6909 | 60 + 5 + 90 = 155 |
| Export options | 80c7dba, bf435d7 | 35 + 12 = 47 |
| CLI switch | 2468e12 (author 2026-06-28, committer 2026-07-03) | 45 |
| Pagination docs | 3462950 | 40 |
| Stable sorting tests | 16de668 | 55 added, 119 removed |
| Withdrawn | 2b9c209 reverted by 24fb23e | 120 |
| Not counted | 02e743b (30002, dataset), d9924c3 (1800, generated), 9307f24 (merge), eda312d/d09ae19 (authored 2025-12), 2e0c683 (2026-07-14) | |

Figures: 12 authored non-merge commits; 32264 added raw, 239 removed raw. Hand: 32264 - 30002 - 1800 = 462 written; 462 - 120 = 342 surviving. Tool reported 0 reverts because 24fb23e's body does not follow the standard form.
Others: b9feb81 Lena Fischer, ca96677 Tomasz Varga, f2bd651 Tomasz Varga (merge of #41).
