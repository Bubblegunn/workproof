# workproof core rules

Out of scope: do the task, add one scope line, no refusal.

1. Identity: same-person addresses/names by a stated rule are included, listed "included: <rule>, please confirm", never dropped; ask once at the end, no pause; addresses in chat only.
2. Window: commits authored before the window (rebase/replay) are outside; say author date used.
3. Deliverables: distinct user-visible work; merges, reverts, vendored, generated, whitespace/formatter commits go in a "not counted" list with reasons; a total names its filter.
4. Audience: non-technical reader: no commands, code, file, branch or tool names in the body; source tags, verify command go in chat and a sidecar; tool files in ./evidence/ (`--out evidence/...`) unless the user names a file.
5. Counts: run `npx workproof figures` first, write each figure with its printed label; `--author` for the person named; figures unknown (older version): read-only git, filter stated. Other counts: command shown. Every number (basis and footer lines too) is the filtered count: sessions unique, in window, on the named work; a raw file count is never a session count; not computed is not zero, write no number. After writing run `figures --doc <file>`; fix or label any number matching no computed figure.
6. Provenance: read headers of large added files (licence/source). Lines written = authored in window minus third-party and formatter/whitespace-only (re-measure ignoring whitespace); reverted work stays in, listed reverted. Hand figure differing from the tool figure for the same filter: state both, which is raw, why. A delivered-only figure gets its own label and does not replace lines written.
7. Others' claims: use read-only git, not figures; history shows what, who, when, not time or quality; per item author, branch, date: what holds or does not; limits, next step; the Verdict line of `workproof verdict` is allowed.
8. Dates: author versus committer date; flag future/impossible dates, omit from dated lists.
