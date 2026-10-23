// export-usage.mjs: usage totals from a folder of Claude Code session files that the user
// supplied (an export), for `workproof sessions --dir <folder>`. Local and offline.
//
// Counts unique assistant responses (one per message id; synthetic and zero-usage responses
// are left out), token totals by type and per model, and tool calls (one per tool-use id).
// With --since / --until, the totals and the session rows cover only the sessions whose first
// timestamp falls on a local calendar date in that range. The output carries no paths, no prompt
// text and no message text, except the last segment of a session's working directory. Strings
// that look like secrets (API keys, tokens) or email addresses are replaced before anything is printed.
// Original code for this package (MIT).

import fs from 'node:fs';
import path from 'node:path';

const SECRET = /\b(?:sk|pk|rk)-[A-Za-z0-9_-]{16,}\b|\b(?:ghp|gho|ghu|ghs|github_pat|xox[abprs]|AKIA|AIza)[A-Za-z0-9_-]{12,}|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}|\b[A-Fa-f0-9]{32,}\b|\b[A-Za-z0-9+/_-]{40,}={0,2}(?![A-Za-z0-9])/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

/** Text with secret-looking strings and email addresses replaced. */
export function redact(text) {
  return String(text).replace(EMAIL, '(email hidden)').replace(SECRET, '(secret hidden)');
}

function findJsonl(dir) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findJsonl(full));
    else if (e.isFile() && e.name.endsWith('.jsonl')) out.push(full);
  }
  return out.sort();
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

const DATE = /^\d{4}-\d{2}-\d{2}$/;
/** A real calendar date written YYYY-MM-DD (2026-02-30 is refused), or null. */
export function calendarDate(value) {
  if (typeof value !== 'string' || !DATE.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const t = new Date(y, m - 1, d);
  return t.getFullYear() === y && t.getMonth() === m - 1 && t.getDate() === d ? value : null;
}

/** The local calendar date (YYYY-MM-DD) of a time given in milliseconds. */
function localDate(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The last segment of a working directory: no control characters, at most 64 characters, redacted. */
function folderName(cwd) {
  const segment = cwd.split(/[\\/]/).filter(Boolean).pop() ?? '';
  const clean = segment.replace(/\p{Cc}/gu, '').slice(0, 64);
  return clean ? redact(clean) : null;
}

const MAX_SESSION_ROWS = 100;

/**
 * The usage summary of every .jsonl file under `dir`. `range` is null (no window) or
 * { since, until } as YYYY-MM-DD strings, either of which may be null for an open side.
 */
export function usageFromDir(dir, range = null) {
  const files = findJsonl(dir);
  const sessions = new Map(); // session id -> { first, last, folder } in milliseconds; first and last are null when no row has a parseable time
  const messages = new Map(); // message id -> { entry, session }: the occurrence with the most tokens (the final one of a streamed reply)
  const toolIds = new Map(); // tool-use id -> { name, session }
  const seenInEarlierFile = new Set();
  let filesRepeating = 0;
  let lines = 0;
  let unreadable = 0;
  for (const file of files) {
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      unreadable++;
      continue;
    }
    const fallback = path.basename(file, '.jsonl');
    const fileSessions = new Set();
    let any = false;
    for (const raw of text.split('\n')) {
      if (!raw.trim()) continue;
      let row;
      try {
        row = JSON.parse(raw);
      } catch {
        continue;
      }
      lines++;
      if (!row || (row.type !== 'user' && row.type !== 'assistant')) continue;
      any = true;
      const key = typeof row.sessionId === 'string' && row.sessionId ? row.sessionId : fallback;
      fileSessions.add(key);
      let info = sessions.get(key);
      if (!info) {
        info = { first: null, last: null, folder: null };
        sessions.set(key, info);
      }
      const t = typeof row.timestamp === 'string' ? Date.parse(row.timestamp) : NaN;
      if (Number.isFinite(t)) {
        if (info.first === null || t < info.first) info.first = t;
        if (info.last === null || t > info.last) info.last = t;
      }
      if (info.folder === null && typeof row.cwd === 'string') info.folder = folderName(row.cwd);
      if (row.type !== 'assistant' || !row.message || typeof row.message !== 'object') continue;
      const m = row.message;
      for (const b of Array.isArray(m.content) ? m.content : []) {
        if (b && b.type === 'tool_use' && typeof b.id === 'string' && !toolIds.has(b.id)) toolIds.set(b.id, { name: typeof b.name === 'string' ? b.name : '(unknown)', session: key });
      }
      const id = typeof m.id === 'string' && m.id ? m.id : typeof row.uuid === 'string' ? `uuid:${row.uuid}` : null;
      if (!id) continue;
      const u = m.usage && typeof m.usage === 'object' ? m.usage : {};
      const entry = {
        model: typeof m.model === 'string' ? m.model : '(unknown)',
        input: num(u.input_tokens),
        output: num(u.output_tokens),
        cacheRead: num(u.cache_read_input_tokens),
        cacheCreation: num(u.cache_creation_input_tokens),
      };
      const before = messages.get(id)?.entry;
      if (!before || entry.output + entry.input + entry.cacheRead + entry.cacheCreation >= before.output + before.input + before.cacheRead + before.cacheCreation) messages.set(id, { entry, session: key });
    }
    if (!any && text.trim() === '') sessions.delete(fallback);
    if ([...fileSessions].some((k) => seenInEarlierFile.has(k))) filesRepeating++;
    for (const k of fileSessions) seenInEarlierFile.add(k);
  }

  // Sessions with a parseable time, in the window when one is given. A session is in the window
  // when its first timestamp's local calendar date lies between since and until, both included.
  const dated = [...sessions.entries()].filter(([, info]) => info.first !== null);
  const sessionsWithoutDate = sessions.size - dated.length;
  const inRange = ([, info]) => {
    if (!range) return true;
    const day = localDate(info.first);
    return (range.since === null || day >= range.since) && (range.until === null || day <= range.until);
  };
  const rowSessions = dated.filter(inRange).sort((a, b) => a[1].first - b[1].first || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const kept = range ? new Set(rowSessions.map(([k]) => k)) : null;
  const uniqueSessions = range ? rowSessions.length : sessions.size;

  const zero = () => ({ responses: 0, input: 0, output: 0, cacheRead: 0, cacheCreation: 0 });
  const totals = zero();
  const byModel = new Map();
  const responsesBySession = new Map();
  let syntheticOrEmpty = 0;
  for (const { entry: e, session } of messages.values()) {
    if (kept && !kept.has(session)) continue;
    if (e.model === '<synthetic>' || e.input + e.output + e.cacheRead + e.cacheCreation === 0) {
      syntheticOrEmpty++;
      continue;
    }
    responsesBySession.set(session, (responsesBySession.get(session) ?? 0) + 1);
    const row = byModel.get(e.model) ?? zero();
    byModel.set(e.model, row);
    for (const t of [totals, row]) {
      t.responses++;
      t.input += e.input;
      t.output += e.output;
      t.cacheRead += e.cacheRead;
      t.cacheCreation += e.cacheCreation;
    }
  }
  const toolCounts = new Map();
  const toolsBySession = new Map();
  let toolTotal = 0;
  for (const { name, session } of toolIds.values()) {
    if (kept && !kept.has(session)) continue;
    toolTotal++;
    toolCounts.set(name, (toolCounts.get(name) ?? 0) + 1);
    toolsBySession.set(session, (toolsBySession.get(session) ?? 0) + 1);
  }
  const rank = (m) => [...m.entries()].sort((a, b) => (b[1].responses ?? b[1]) - (a[1].responses ?? a[1]) || a[0].localeCompare(b[0]));
  const sessionRows = rowSessions.slice(0, MAX_SESSION_ROWS).map(([key, info]) => ({
    id: redact(key.slice(0, 8)),
    first: new Date(info.first).toISOString(),
    last: new Date(info.last).toISOString(),
    responses: responsesBySession.get(key) ?? 0,
    toolCalls: toolsBySession.get(key) ?? 0,
    ...(info.folder ? { folder: info.folder } : {}),
  }));
  const windowNotes = range
    ? [
        `Window: sessions whose first timestamp falls on a local calendar date from ${range.since ?? 'the first date in the export'} to ${range.until ?? 'the last date in the export'}, both included. Sessions with no parseable timestamp are left out and counted in sessionsWithoutDate.`,
        `The totals above cover only the sessions in the window. sessionRows lists ${sessionRows.length} of the ${rowSessions.length} sessions in the window (at most ${MAX_SESSION_ROWS}). The number of rows the reader keeps is the session count it may state.`,
      ]
    : [];
  const result = {
    source: 'export folder',
    files: files.length,
    ...(unreadable ? { unreadableFiles: unreadable } : {}),
    exportedFiles: files.length,
    sessions: uniqueSessions,
    uniqueSessions,
    filesRepeatingASession: filesRepeating,
    sessionsWithoutDate,
    ...(range ? { window: { since: range.since, until: range.until } } : {}),
    assistantResponses: totals.responses,
    excludedResponses: { syntheticOrZeroUsage: syntheticOrEmpty },
    tokens: { input: totals.input, output: totals.output, cacheRead: totals.cacheRead, cacheCreation: totals.cacheCreation, all: totals.input + totals.output + totals.cacheRead + totals.cacheCreation },
    byModel: Object.fromEntries(rank(byModel).map(([k, v]) => [redact(k), { responses: v.responses, input: v.input, output: v.output, cacheRead: v.cacheRead, cacheCreation: v.cacheCreation }])),
    toolCalls: { total: toolTotal, byTool: Object.fromEntries([...toolCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => [redact(k), v])) },
    notes: [
      'One response per message id; a reply that was written to the file several times counts once, with its final token counts.',
      'Synthetic responses and responses with zero usage are not counted.',
      'Tool calls are counted once per tool-use id.',
      'No co-authored commit count: this reads session files, not a git repository.',
      ...windowNotes,
    ],
    sessionRows,
  };
  return result;
}

/**
 * Runs `sessions --dir <folder> [--since YYYY-MM-DD] [--until YYYY-MM-DD]`: prints the JSON summary.
 * Returns the exit code. A bad date or a reversed window exits 2 and prints nothing to stdout.
 */
export function runExport(dir, options = {}) {
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`mine-sessions: --dir needs a folder that exists`);
    return 2;
  }
  let range = null;
  if (options.since !== undefined || options.until !== undefined) {
    const since = options.since === undefined ? null : calendarDate(options.since);
    const until = options.until === undefined ? null : calendarDate(options.until);
    if ((options.since !== undefined && since === null) || (options.until !== undefined && until === null)) {
      console.error('mine-sessions: --since and --until expect a calendar date written YYYY-MM-DD (e.g. --since 2026-07-01)');
      return 2;
    }
    if (since !== null && until !== null && since > until) {
      console.error('mine-sessions: --since is after --until, so the window is empty');
      return 2;
    }
    range = { since, until };
  }
  const result = usageFromDir(path.resolve(dir), range);
  process.stdout.write(redact(JSON.stringify(result, null, 2)));
  return 0;
}
