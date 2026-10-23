# Round 13 development gate (not a benchmark result)

Protocol: docs/HEAD-TO-HEAD.md, section "Round 13 development gate protocol" (frozen in 2794a4c before the run).
Product commit under test: f74cb3c12c75dc6d35778362377157a536e37b85 (git archive, npm ci, npm run build, bench/ removed from the arm copy so the criteria are not in the plugin folder).
Path: subscription wrapper (apiKeySource none), claude 2.1.308, model sonnet, 72 runs, parallelism 3, 3 blind votes per packet. Rival: anthropics/claude-plugins-official plugins/receipts at 465f093 with a minimal plugin.json.
Development tasks were written by the controller who also wrote the product changes; they are a gate for iteration, not evidence for the launch claim. results.txt is the output of dev/score-dev.py with outcome labels.
Raw run transcripts are kept outside the repository (scratchpad of the controller session) and are not part of this folder; the final measurement archives its runs.
