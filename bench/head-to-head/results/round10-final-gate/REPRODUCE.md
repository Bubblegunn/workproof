# Reproduce round 10

All commands run from the root of a clone of the repository on branch `plugin-leadership`. `tools/` holds the evidence scripts (Python 3 standard library only); `tools/config.round10.json` is the build config used here (it contains the paths of the original machine and is not needed to check anything).

Paths below use `$W` for a scratch directory outside the repository. Never run an interpreter or a plugin from inside downloaded rival code; use the archive copies.

## 1. Check the folder without any model call (free, about 1 s)
```
cd bench/head-to-head/results/round10-final-gate
python3 -I score.py --check SUMMARY.md        # tables equal score.py output
python3 -I tools/make_sums.py --check .       # SHA256SUMS
python3 -I tools/test_redact.py               # redaction tests
```
`score.py` reads only `tasks/`, `grades/` and `runs/*/*/*/*/cost.json` of this folder.

## 2. Build the product under test
```
git archive 523ddc4a71b2efc3f8d4c9f20ddcd7acdd8e0a21 | tar -x -C $W/code
cd $W/code && npm ci && npm run build && node dist/src/cli.js --help   # must list sessions, verdict, bullets, mine, stop-check
```

## 3. Install the pinned rival arms (see `arms.json` for URLs, licences, commits)
Clone each rival, `git -C <clone> archive <pin> | tar -x -C $W/<arm>`, and run from the archive copy only. Receipts needs its patch (only `skills/receipts/scripts/mine-transcripts.mjs`, so the session-log folder follows `RECEIPTS_HOME`); the exact patched file is not stored here, the difference to the pinned file is what `arms.json` states. cv-builder: delete `.mcp.json` and pass `--strict-mcp-config`. BASE is an empty plugin directory.

## 4. Rebuild the fixtures
- Public: `bash bench/head-to-head/make-fixtures.sh $W/fixtures` (needs network for the public repository clone; see the script header).
- Held-out c: `bash tasks/heldout-c/c<N>/build-fixture.sh $W/fx-c<N>` for N = 1..5, then `python3 -I tasks/heldout-c/c<N>/truth.py $W/fx-c<N>` and compare with `truth.txt`. The fixtures are generated with a synthetic history, so ground truth is exact.

## 5. Run a cell
Put the shim first on PATH (`tools/sdk-shim-claude.py` is the `claude` wrapper; it needs `claude_agent_sdk` 0.2.172 and a file `REAL_CLAUDE` with the path of the CLI 2.1.308; the key file named in its `ACTIVE_KEY` is read at run time and is not included). Then, with the variables documented in `bench/head-to-head/run-one.sh` (H2H_FIXTURES, H2H_RUNS, H2H_TASKS for set c, ARM_OURS, ARM_BASE, ARM_RCP, ARM_JD, ARM_GAP, ARM_SR, ARM_CV, H2H_MODEL=claude-sonnet-5-5):
```
bash bench/head-to-head/run-one.sh C1 OURS 1      # task, arm, repetition
```
Public rival cells of this round were not re-run; their original transcripts are in `runs/public/<task>/<arm>/<rep>/`.

## 6. Regrade and rescore
```
python3 bench/head-to-head/assemble.py <runs-dir> <grade-dir> <seed> <fixtures-dir>   # seeds: r10-public-seed, r10-heldout-c-seed
for f in <grade-dir>/[TCH]*-prompt.txt; do t=$(basename $f -prompt.txt); claude -p --model sonnet --setting-sources project --strict-mcp-config --tools "" < $f > <grade-dir>/$t-grade.json; done
```
(`grade.sh` globs `[TH]*`; set c needs `C*` as in the loop above.) The stored grader prompts and packets are in `grades/<set>/`; sending a stored `<task>-prompt.txt` regrades the exact packet that was graded, with the redactions described in `grades/GRADER.md`. To rescore a regrade, replace `<task>-grade.json` and `<task>-labels.json` in `grades/<set>/` and run `python3 -I score.py`.

## Cost and time observed
- Held-out c, 165 runs, parallelism 3: about 11.7 USD and 35 minutes (`runs/timestamps.tsv`).
- Public OURS, 24 runs: about 1.7 USD, 5 minutes. Grading: about 2.1 USD (public, 8 calls) and 1.3 USD (set c, 5 calls). Total of the round in `cost.tsv`: 23.93 USD, including writer, implementer, reviewer and a discarded grading round.

## What will differ on a rerun
Model variance. Within this round, the same cell varied between runs by up to the min-max range printed in each table cell (for example public T1 ours 3 to 4 of 4, set c C4 ours 3 to 5 of 5, JD_I C1 0 to 5 of 5). The agreement rate between independent re-runs and an independent re-grade (F6) was **not measured**: F6 did not run because the held-out gate failed. Expect single cells to move by one or two criteria and set totals by a few points; the public ordering of ours against the rivals was far outside that range (34.67 against 25.00), the set c ordering was not (18.33 against 22.33 and 21.67 for JD).
