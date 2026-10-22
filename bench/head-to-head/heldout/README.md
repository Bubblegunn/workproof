# Held-out evaluation set: private-repo engineering evidence

Written 2026-10-21. Each task has prompt.txt, build-fixture.sh (`bash build-fixture.sh <dir>` creates <dir>/repo), truth.py (`python3 -I truth.py <dir>`), criteria.md and truth.txt.

- t1: visa evidence package from an NDA repo (express, Wes Todd, 3 identities, vendored tree, lockfile, bots, squash, merge, lookalike).
- t2: promotion CV bullets that a reviewer can re-check (click, Kevin Deldycke, vendored, generated docs, lockfile, revert pair, squash, bot, lookalike).
- t3: reviewer must decide whether to trust a received report with two altered figures (express, Ulises Gascon, 3 identities, vendored, bundle, squash, lookalike); build also writes report.json.
