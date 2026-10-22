I saved the report as `claude-code-usage-report.md` in the current directory. It covers 2026-09-23 to 2026-10-22.

`npx workproof` wasn't available from the registry here. I ran the local copy of the same CLI from the plugin folder, with the home folder you gave me, so the figures come from `workproof sessions --days 30`.

- **Activity:** 40 sessions and 64 prompts, with Claude Code used on 28 of 30 days.
- **Output:** 14 files edited and about 3,120 lines touched. 7 pull-request commands were run, and 12 commits include files Claude Code edited.
- **Where it went:** Research with no code changes was the largest share, at 17 sessions (52.8% of usage). Of the four repositories, acme-api had the most activity, with 9 sessions, 1,953 lines touched and 5 commits. acme-web, billing-service and infra-terraform followed.

The report ends with a "What this does not show" section. The figures are self-reported from local logs, so a reader can't recompute them. They include no dollar amounts, hours saved, or claims about quality or business impact. The 12 commits are ones that include files Claude Code edited, not all commits in that period.

The project names in the table (acme-api, acme-web, billing-service, infra-terraform) are repository folder names. They're in the file, so check you're happy sharing them before you send it to your manager.