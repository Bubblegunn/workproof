# Evidence package

Files: workproof-report.md (readable), workproof-report.json (machine-checkable).
Tool: workproof 0.7.0. Report hash: e18d4a127bb12ca8ccbbc9d154a838fb686bb8a35b0562e54111f667e3ef6b51
Repository HEAD: 249bbdc

Checks run on these files (both passed):
- npx workproof check workproof-report.json        -> schema ok, hash ok (offline; shows the JSON was not edited)
- npx workproof verify workproof-report.json --repo <clone> --fingerprint-key <key>   -> fingerprint ok, all figures reproduce

A reader with legitimate access to the repository can run these. The fingerprint key is kept by the author.
Source tags for work-summary.md: [commit share, 63 of 131 #e18d4a12] [surviving lines, 697 of 1,417 #e18d4a12]
Hand figures (workproof figures, same three identities): 63 non-merge commits, 1,276 added / 1,762 deleted raw (1,200 / 1,686 ignoring whitespace), 13 merges, 1 revert. The report's 1,276/1,762 equals the raw figure; there is no difference.
Note: report lists 13 merge commit ids by short hash in its body.
Limits: history can be rewritten before a report is made; figures do not show quality, review, design or mentoring.
No remote is configured, so nothing indicates the repository is public.
