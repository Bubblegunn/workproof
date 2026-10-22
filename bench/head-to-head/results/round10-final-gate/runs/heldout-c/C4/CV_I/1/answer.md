I wrote the summary to `q3-summary.md`. It describes what got done and has no code.

**Included**
- **Hex alpha support (July):** the 212 passing tests come from your session. The customer report is mentioned without a name.
- **Node 22 in CI (August).**
- **Alpha syntax in the readme (September).**
- **TypeScript level-detection types:** listed under "Tried and not shipped", since you added them on Sept 19 and reverted them on Sept 24. Delete that section if you'd rather not show it.

**Left out on purpose**
- **Chained-lookup performance work (August):** you stashed it because the "2x faster" numbers looked off. It appears only as a short note that it was started and not merged.
- **Recipe side project:** it's personal, not work.
- **v6 migration guide:** it's dated October 2 and was never committed.
- **Lint-rules commit:** it's dated June 27, before the quarter.

**Secrets in your export:** the July alpha session contains what look like an AWS access key and a production database URL with a password. I didn't copy any of it into the summary. Consider rotating those credentials and removing them from the exports. `2025-07-15-alpha (copy).jsonl` is an exact duplicate of the original, so I ignored it.

I used the rewrite-achievements rules, which allow only confirmed numbers and results. That's why there are no invented metrics or impact claims. If you have real outcomes, such as how many customers the alpha fix helped, send them and I'll add them.