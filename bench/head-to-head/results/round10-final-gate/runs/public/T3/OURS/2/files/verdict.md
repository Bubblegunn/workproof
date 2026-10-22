# Verdict on workproof-report.json

## Verdict
**Do not trust as is.**
2 figures differ from the repository, so the report does not reproduce.

## Altered figures
| Figure | The report says | The repository says |
|---|---|---|
| commitShare | {"author":103,"total":131,"share":0.7862595419847328} | {"author":63,"total":131,"share":0.48091603053435117} |
| survivingLines | {"lines":1197,"linesAttributed":1417,"share":0.844742413549753,"filesSampled":19,"filesTotal":19,"sample":1,"seed":"","byYear":[{"year":2013,"lines":104},{"year":2014,"lines":550},{"year":2015,"lines":43}]} | {"lines":697,"linesAttributed":1417,"share":0.4918842625264644,"filesSampled":19,"filesTotal":19,"sample":1,"seed":"","byYear":[{"year":2013,"lines":104},{"year":2014,"lines":550},{"year":2015,"lines":43}]} |

## Hash status
Offline check: hash ok d54f0828857d.
A passing offline check shows only that the document was not edited after it was written. Someone who changes a figure can recompute the hash, so it does not show the figures are true.

## Merged-address claim
The report claims 3 other addresses were merged (reasons: same name on another address, GitHub login matches, address name matches your GitHub login). The repository has 3 addresses under the names the report gives (re-derived). Not consistent: the report counts 4 addresses (its own plus the merged ones) and the repository has 3.
Commits under those names, re-derived: 63; the report says 103.

## What a passing check would not prove
- History can be rewritten before a report is made, so a report that reproduces from a rewritten history still reproduces.
- The figures show survival and activity, not quality, review, design or mentoring.

## Recommendation
Do not rely on these figures. Ask the sender for a fresh report made from the original repository, the fingerprint key, and references from people who worked with them.
