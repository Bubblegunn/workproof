I wrote `promo-evidence.md` in this folder. It has no code in it.

- **Commits:** 8 under your work email between 1 July and 31 December 2025.
- **Net lines:** +243 of hand-written work. The total is +12,243 if you count a 12,000-line generated API snapshot for the docs site. I showed both and labelled the snapshot, so the committee doesn't read it as hand-written work.
- **Themes:** key rotation with tests, token-expiry metrics, an audit log for signing failures, a serializer experiment that you reverted, and the year-end release notes.

Some choices to check before you hand it over:
- **Possible missing commit:** a commit titled "Harden signature comparison (#412)" on 1 October is under `alex.rivera@users.noreply.github.example`, not your work email. It looks like yours, probably a GitHub squash-merge. I left it out because I can't confirm it. If it's yours, that adds 1 commit and +40 lines, and it's a good security example.
- **Someone else's commit:** a "Fix typos in docs" commit is under `alex.rivero@northwind.example`. That spelling is different, so I treated it as another person and excluded it.
- **Timezone:** the release-notes commit is timestamped 22:30 on 31 December Pacific time, which is 1 January in UTC. I counted it as 2025.
- **Merge commit:** I left out the merge commit for the audit-log branch, since its content is already counted in the original commit.
- **The reverted experiment:** I included it, framed as testing an idea and backing it out. Cut it if you'd rather not show it.