I wrote `promo-evidence.md` in this folder. It has no code in it. I didn't use the cv-builder skills, since they're for resumes and this was a git summary.

For 1 July to 31 December 2025, under alex.rivera@northwind.example:
- **Commits:** 9. That is 8 authored changes plus the merge of the audit-log branch.
- **Net lines:** +12,243 raw, but 12,000 of those are one imported, machine-generated docs snapshot. Hand-written net is about **243 lines**. The file shows both numbers and says so, so the committee isn't misled.
- **Themes:**
  - Key rotation, with its tests.
  - Observability: a token-expiry metrics hook and an audit log for signing failures.
  - A serializer experiment that was reverted, which nets to zero.
  - Docs and the year-end release notes.

Two things need your decision:
- **Possible missing commit.** One commit, "Harden signature comparison (#412)", on 2025-10-01 (+40 lines), is authored as `alex.rivera@users.noreply.github.example`. It looks like yours, but it isn't your work email, so I left it out. If it's yours, the totals become 10 commits and about 283 hand-written net lines. Tell me and I'll add it, since it fits the security theme.
- **Not yours.** A typo-fix commit from "alex.rivero@northwind.example" (spelled with an "o") is probably someone else, so I excluded it.

The line counts show little hand-written code, so the doc leans on themes rather than volume. If you can add review work, design input or outcomes, I can add those too.