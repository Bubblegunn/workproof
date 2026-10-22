---
description: Produce a verifiable report of your own work from this git repository (hash, no source code), then check and verify it
argument-hint: "[--author <email>] [--no-merge-identities]"
---

Use the workproof skill. Follow its rules: first tell me whether this repository looks public, then run `npx workproof` in the current repository with any arguments I gave ($ARGUMENTS), then run `npx workproof check workproof-report.json` and `npx workproof verify workproof-report.json --repo . --fingerprint-key <the key the first run printed>`. Tell me which email addresses were merged into my identity. Quote the report, never recount, and end with the two limits.
