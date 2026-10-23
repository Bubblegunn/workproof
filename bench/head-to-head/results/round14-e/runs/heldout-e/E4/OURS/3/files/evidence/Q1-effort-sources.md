# Sidecar (not for the funder)
Commits: `npx workproof figures --author elif.demir@studio-kalem.example --since 2026-01-01 --until 2026-03-31` -> authored non-merge commits = 5 (author date, commit's own +03:00 offset). Excluded: 65cdcc2 (author date 2026-04-01T01:30+03:00).
Identity: only elif.demir@studio-kalem.example found; no extra addresses.
Hours: workproof has no active-time figure; computed by /tmp/wp-scripts/active.py over agent-sessions/ (events deduped by uuid, p-limit-fork cwd only, window 2025-12-31T21:00Z to 2026-03-31T21:00Z, gaps >30 min dropped, pooled across overlapping sessions).
 - sessG 2026-01-20: 2:00; sessA+sessB pooled 2026-02-10: 2:56; sessE clipped at midnight: 0:54 (raw 1:21). Total 5:50.
 - Excluded: sessD (client-site), sessF (2026-04-02), duplicate "session-A (1).jsonl".
Note: sessB contains a test key and a personal email in a prompt; nothing from prompts is in the report.
