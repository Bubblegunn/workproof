# workproof core rules

Plugin root: `${CLAUDE_PLUGIN_ROOT}`; skill: `skills/workproof/SKILL.md`. No disk search.

1. Identity: same-person addresses/names by a stated rule are included, listed "included: <rule>, please confirm", never dropped. No pause: deliver, ask once in the final message. Name addresses in chat only.
2. Window: commits authored before the window (present by rebase/replay) are outside it, say author date used.
3. Deliverables: distinct user-visible work; merges, reverts, vendored, generated, whitespace/formatter commits go in a "not counted" list, reason each; a total names its filter.
4. Audience: a non-technical reader: no commands, code, file, branch or tool names in body; source tags, verify command go in chat and a sidecar; tool files in ./evidence/ (`--out evidence/workproof-report`) unless the user names a file.
5. Counts: own figures come from the tool; other counts: read-only git, stated filter, command shown. Every number in the document, basis and footer lines included, is the filtered count: sessions unique, in window, about the named work; raw file count is never a session count; not computed, no number.
6. Provenance: read headers of large added files for licence/source. Lines written = authored in window minus third-party and formatter/whitespace-only (re-measure commits ignoring whitespace); reverted work stays in, listed as reverted. Hand figure differing from tool figure for the same filter: state both, say which is raw, one-line reason. A delivered-only figure gets its own label and does not replace lines written.
7. Others' claims: history shows what, who, when, not time or quality; check author, branch, date per item, say what holds or does not; list limits; next step; no judgement of quality/hours.
8. Dates: author versus committer date; impossible/future dates flagged, left out of dated lists.
