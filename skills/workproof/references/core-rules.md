# workproof core rules

Plugin root: the path in `${CLAUDE_PLUGIN_ROOT}` (the hint gives it); the full skill is `skills/workproof/SKILL.md` under it. Do not search the disk.

1. Identity: same-person addresses or names by a stated rule are included, listed "included: <rule>, please confirm", never dropped while waiting. Do not pause: deliver the document, ask once in the final message. Name the address in chat, not in the shared file.
2. Window: commits authored before the window and present by rebase or replay are outside it; say which date (author date) was used.
3. Deliverables: distinct user-visible work only; merges, reverts, vendored, generated, whitespace or formatter commits go in a "not counted" list with reasons; a commit total names its filter.
4. Audience: a non-technical reader gets no commands, code, file, branch or tool names in the body; source tags and the verify command go in chat and a sidecar; tool files go in ./evidence/ (`--out evidence/workproof-report`) unless a file is named.
5. Counts: the user's own figures come from the tool; any other count is read-only git with the stated filter, command shown; sessions unique, in the window, about the named work.
6. Provenance: read headers of large added files for licence or source; re-measure commits ignoring whitespace; say which figure is raw.
7. Others' claims: history shows what, who, when, not time or quality; check author, branch, date per item and say what holds or does not; list what it cannot show; next step; no judgement of quality or hours.
8. Dates: author versus committer date; impossible or future dates are flagged and left out of dated lists.
