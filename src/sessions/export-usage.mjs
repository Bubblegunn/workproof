// export-usage.mjs: usage totals from a folder of Claude Code session files that the user
// supplied (an export), for `workproof sessions --dir <folder>`. Local and offline.
//
// Counts unique assistant responses (one per message id; synthetic and zero-usage responses
// are left out), token totals by type and per model, and tool calls (one per tool-use id).
// The output carries no paths, no prompt text and no message text. Strings that look like
// secrets (API keys, tokens) or email addresses are replaced before anything is printed.
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

/** The usage summary of every .jsonl file under `dir`. */
export function usageFromDir(dir) {
  const files = findJsonl(dir);
  const sessions = new Set();
  const messages = new Map(); // message id -> the occurrence with the most output tokens (the final one of a streamed reply)
  const toolIds = new Map(); // tool-use id -> name
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
      if (row && (row.type === 'user' || row.type === 'assistant')) {
        any = true;
        sessions.add(typeof row.sessionId === 'string' && row.sessionId ? row.sessionId : fallback);
      }
      if (!row || row.type !== 'assistant' || !row.message || typeof row.message !== 'object') continue;
      const m = row.message;
      for (const b of Array.isArray(m.content) ? m.content : []) {
        if (b && b.type === 'tool_use' && typeof b.id === 'string' && !toolIds.has(b.id)) toolIds.set(b.id, typeof b.name === 'string' ? b.name : '(unknown)');
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
      const before = messages.get(id);
      if (!before || entry.output + entry.input + entry.cacheRead + entry.cacheCreation >= before.output + before.input + before.cacheRead + before.cacheCreation) messages.set(id, entry);
    }
    if (!any && text.trim() === '') sessions.delete(fallback);
  }

  const zero = () => ({ responses: 0, input: 0, output: 0, cacheRead: 0, cacheCreation: 0 });
  const totals = zero();
  const byModel = new Map();
  let syntheticOrEmpty = 0;
  for (const e of messages.values()) {
    if (e.model === '<synthetic>' || e.input + e.output + e.cacheRead + e.cacheCreation === 0) {
      syntheticOrEmpty++;
      continue;
    }
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
  for (const name of toolIds.values()) toolCounts.set(name, (toolCounts.get(name) ?? 0) + 1);
  const rank = (m) => [...m.entries()].sort((a, b) => (b[1].responses ?? b[1]) - (a[1].responses ?? a[1]) || a[0].localeCompare(b[0]));
  const result = {
    source: 'export folder',
    files: files.length,
    ...(unreadable ? { unreadableFiles: unreadable } : {}),
    sessions: sessions.size,
    assistantResponses: totals.responses,
    excludedResponses: { syntheticOrZeroUsage: syntheticOrEmpty },
    tokens: { input: totals.input, output: totals.output, cacheRead: totals.cacheRead, cacheCreation: totals.cacheCreation, all: totals.input + totals.output + totals.cacheRead + totals.cacheCreation },
    byModel: Object.fromEntries(rank(byModel).map(([k, v]) => [redact(k), { responses: v.responses, input: v.input, output: v.output, cacheRead: v.cacheRead, cacheCreation: v.cacheCreation }])),
    toolCalls: { total: toolIds.size, byTool: Object.fromEntries([...toolCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => [redact(k), v])) },
    notes: [
      'One response per message id; a reply that was written to the file several times counts once, with its final token counts.',
      'Synthetic responses and responses with zero usage are not counted.',
      'Tool calls are counted once per tool-use id.',
      'No co-authored commit count: this reads session files, not a git repository.',
    ],
  };
  return result;
}

/** Runs `sessions --dir <folder>`: prints the JSON summary. Returns the exit code. */
export function runExport(dir) {
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`mine-sessions: --dir needs a folder that exists`);
    return 2;
  }
  const result = usageFromDir(path.resolve(dir));
  process.stdout.write(redact(JSON.stringify(result, null, 2)));
  return 0;
}
