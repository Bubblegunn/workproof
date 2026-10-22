I saved the report as `claude-code-usage-report.md` in the current directory. The figures cover 2026-09-23 to 2026-10-22 and come from `npx workproof sessions --days 30` run against `/private/tmp/h2h-wp-r7/F4/home`.

**Totals**
- You had 40 sessions and 64 prompts, with Claude Code used on 28 of the 30 days.
- Claude Code edited 14 files, touching 3,120 lines.
- You ran 7 pull-request create commands.
- 12 commits include files Claude Code edited. That counts commits touching those files, not all commits.

**By project**
- **Research with no project:** 17 sessions, about 53% of usage.
- **acme-api:** 9 sessions and 1,953 lines touched.
- **acme-web:** 5 sessions and 580 lines touched.
- **billing-service:** 3 sessions and 303 lines touched.
- **infra-terraform:** 2 sessions and 60 lines touched.
- **Directories outside a repository:** 4 sessions and 224 lines touched.

**Before you send it**
- The project names in the table are your repository folder names (acme-api, acme-web, billing-service, infra-terraform). Check you're happy for her to see them.
- The report has a short paragraph she can use as the summary.
- It also says what the numbers don't show:
  - The figures are self-reported from local logs, with no hash, so she can't recompute them.
  - There are no dollar or hours-saved figures.
  - There is no claim about quality or business impact.
  - A PR create command isn't a merged PR.