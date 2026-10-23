# Reproduce

1. Arms: see `arms.json` (pins). Build OURS: `git archive f74cb3c... | tar -x`, `npm ci && npm run build`, delete `bench/`.
2. Public fixtures: `bench/head-to-head/make-fixtures.sh` (needs network for tj/co, RECEIPTS_PLUGIN, JD_PLUGIN, GAP_REPO). Set d fixtures: each `bench/head-to-head/heldout-d/dN/build-fixture.sh` (published under `tasks/heldout-d/`).
3. Runs: `bench/head-to-head/dev/run-set.sh <workdir> public|d 3 3` with ARM_OURS, ARM_BASE, ARM_RCP, ARM_JD, ARM_CV set; it needs a Claude Code login (the wrapper path in the script is the owner's; change PATH handling for your own). About 312 runs.
4. Grading: `dev/grade-set.sh <workdir> public|d <seed-prefix>` (five votes with seeds `<prefix>-1..5`).
5. Scores: `./recompute.sh > results.md` in this folder (no model call).
Expect differences on a rerun: model variance. The held-out d set is no longer held-out after this measurement.
