Sources (not for the manager):
- HOME=<fixtures/F4/home> npx workproof sessions --days 30  -> evidence/sessions.txt (40 sessions, 64 prompts, 28 active days, 7 PR-create commands)
- npx workproof sessions --dir <home>/.claude/projects/sample --since 2026-09-24 --until 2026-10-23 -> evidence/sessions-dir.txt (40 unique sessions, 417 responses, tokens, tool calls)
- Area split: session working folder (acme-api 9, acme-web 5, billing-service 3, infra-terraform 2, notes 4, home dir/no project 17), counted by hand from file names/cwd.
- Web research 221 = WebFetch 119 + WebSearch 102.
