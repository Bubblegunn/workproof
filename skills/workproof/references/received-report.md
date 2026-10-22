# A report someone else sent

Use this when the user has a `workproof-report.json` (and maybe the `.md`) from another person and asks whether to trust it, or whether it matches a repository.

## Steps

1. Run `npx workproof verdict <report.json> --repo . --out <verdict file>` in the clone of the repository the report is about. The verdict file is the one the user named, or `verdict.md`. Add `--fingerprint-key <hex>` when the sender gave the key. The command runs the offline check and recomputes every figure, and writes the verdict in a fixed template: Verdict, Altered figures, Hash status, a Merged-address claim section when the report makes one, What a passing check would not prove, and Recommendation. Do not recount with `git log` or `git blame`, and do not write the verdict freehand.
2. Read the file. You may add a short note above the first heading for facts the command cannot know (for example that the applicant's name is spelled differently from the name in the report and the history; quote both spellings), but never remove, reorder or soften a section.
3. If there is no clone, run the same command anyway: it says "Could not be checked" and tells the user to run it in a clone. Say plainly that the figures were not compared with any repository.
4. Tell the user the verdict in one paragraph: quote its Verdict line, name the altered figures with both values, say what the Hash status section says (a passing offline check does not make the figures true), and repeat the two limits from the section "What a passing check would not prove". When the file has a Merged-address claim section, say whether the explanation holds. When its Recommendation says the fingerprint was not compared, ask the sender for the fingerprint key.
5. Never write that the report is valid or authentic when the command printed "Do not trust as is".
