# Verify (written for another LLM)

1. `python3 -I --version` not needed; run `./recompute.sh | diff - results.md`: must print nothing (scores recompute from `grades/*/votes/v1..v5` and `tasks/*/{tasks,labels}.json`).
2. Open `runs/<set>/<task>/<arm>/<rep>/answer.md` and `trace.jsonl` for any cell; line 1 of `trace.jsonl` shows `apiKeySource` (none = subscription login) and the model.
3. Check the protocol order: `git log --format='%h %ad %s' --date=iso -- docs/HEAD-TO-HEAD.md`.
4. Check that `grades/<set>/votes/vN/<task>-labels.json` maps letters to arms and that the packet shows arms only as letters.
5. Check that SUMMARY.md states the departures (five-vote amendment after seeing three-vote d scores; F6/F9 not done).
6. `shasum -c SHA256SUMS` in this folder.
