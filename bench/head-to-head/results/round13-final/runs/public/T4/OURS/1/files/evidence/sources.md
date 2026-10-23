# Sources and verification (not for the manager)
Logs: HOME=<fixture home> npx workproof sessions --days 30  -> sessions 40, prompts 64, activeDays 28, prCreateCmds 7 (evidence/sessions-30d.txt)
Export-style check: npx workproof sessions --dir <home>/.claude/projects/sample --since 2026-09-24 --until 2026-10-23 -> uniqueSessions 40, assistantResponses 417, toolCalls 417 (WebFetch 119, WebSearch 102, Edit 70, Read 70, Write 30, Bash 26) (evidence/sessions-dir.txt)
Split by working folder from sessionRows: no folder 17, acme-api 9, acme-web 5, billing-service 3, infra-terraform 2, notes 4 (=40)
Commits: npx workproof figures --repo <home>/code/<repo> --since 2026-09-24 --until 2026-10-23 -> acme-api 5, acme-web 3, billing-service 2, infra-terraform 2 (evidence/figures-*.txt); 12 total, minus 4 "initial" = 8
Note: the "initial" commits are dated 23 Oct yet sit below earlier-dated commits (history order vs dates is odd); treated as baseline.
