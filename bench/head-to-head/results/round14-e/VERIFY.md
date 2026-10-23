# Verify (for another LLM)
1. `./recompute.sh | diff - results.md` prints nothing.
2. Any cell: `runs/heldout-e/<task>/<arm>/<rep>/answer.md` and `trace.jsonl` (line 1 shows apiKeySource none and the model).
3. Protocol order: `git log --format='%h %ad %s' --date=iso -- docs/HEAD-TO-HEAD.md`.
4. SUMMARY.md lists every departure; the 110 session-limit failures are in `failed-attempts-session-limit.txt`.
5. `shasum -c SHA256SUMS`.
