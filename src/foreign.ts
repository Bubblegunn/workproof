import { applyExclusions } from "./analyse.js";
import type { Params } from "./analyse.js";
import { listCommits, assertNotShallow } from "./git.js";
import { resolveIdentity, mergeSplits, isMine } from "./figures/identity.js";
import type { Identity } from "./figures/types.js";

/** What the verdict template needs from a comparison; verdict.ts owns the wording around it. */
export interface ForeignComparison {
  status: "do-not-trust" | "reproduces" | "not-checked";
  reason: string;
  altered: string[];
  recommendation: string;
}

type Kind = "commits" | "added" | "deleted" | "first" | "last";
interface Found { label: string; kind: Kind; value: number | string }

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;
const AUTHOR_KEY = /^(author|authors|candidate|developer|name|email|subject|committer)$/;
/** Keys that name a share, a total, another population or a window, never the author's own count. */
const EXCLUDED_TOKENS = new Set(["share", "percent", "pct", "ratio", "total", "avg", "average", "mean", "median", "repo", "repository", "team", "all", "bot", "ai", "test", "window", "period", "range", "merge", "merges"]);
const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const asInteger = (v: unknown): number | undefined => {
  if (typeof v === "number") return Number.isInteger(v) ? v : undefined;
  const t = typeof v === "string" ? v.replace(/[,\s]/g, "") : "";
  return /^\d+$/.test(t) ? Number(t) : undefined;
};

function kindOf(key: string, value: unknown): { kind: Kind; value: number | string } | undefined {
  // "non_merge_commits" is the author's own count; "merge_commits" is not.
  if (key.replace(/(^|_)(non|no)_merge/g, "").split("_").some((t) => EXCLUDED_TOKENS.has(t))) return undefined;
  const n = asInteger(value);
  if (n !== undefined) {
    if (/(lines?_?(deleted|removed)|(deleted|removed)_lines|deletions?)/.test(key)) return { kind: "deleted", value: n };
    if (/(lines?_?added|added_lines|insertions?|additions?)/.test(key)) return { kind: "added", value: n };
    if (/commit/.test(key) && !/(first|last|date|size|per|streak)/.test(key)) return { kind: "commits", value: n };
  }
  if (typeof value === "string" && ISO_DAY.test(value) && /commit/.test(key)) {
    if (/(first|earliest)/.test(key)) return { kind: "first", value: value.slice(0, 10) };
    if (/(last|latest)/.test(key)) return { kind: "last", value: value.slice(0, 10) };
  }
  return undefined;
}

/**
 * The figures recognised by key name in objects (arrays are not read), and the author strings from
 * the top level and the top-level "figures" object. A key found twice with different values is ambiguous.
 */
export function recogniseFigures(json: unknown): Recognised {
  const seen = new Map<string, Found>();
  const ambiguous = new Set<string>();
  const authors = new Set<string>();
  const walk = (v: unknown, depth: number) => {
    if (depth > 12 || typeof v !== "object" || v === null || Array.isArray(v)) return;
    for (const [k, x] of Object.entries(v)) {
      const key = norm(k);
      const hit = kindOf(key, x);
      if (hit) {
        const before = seen.get(key);
        if (!before) seen.set(key, { label: key, ...hit });
        else if (before.value !== hit.value) ambiguous.add(key);
      } else walk(x, depth + 1);
    }
  };
  walk(json, 0);
  const topLevel = (o: unknown) => {
    if (typeof o !== "object" || o === null || Array.isArray(o)) return;
    for (const [k, x] of Object.entries(o)) if (typeof x === "string" && AUTHOR_KEY.test(norm(k)) && x.trim() && x.length <= 100) authors.add(x.trim());
  };
  topLevel(json);
  topLevel((json as { figures?: unknown } | null)?.figures);
  return { found: [...seen.values()].filter((f) => !ambiguous.has(f.label)), ambiguous: [...ambiguous], authors: [...authors] };
}

interface Recognised { found: Found[]; ambiguous: string[]; authors: string[]; note?: string }

/** Collects figures under a label; a label found twice with different values is ambiguous. */
function collector() {
  const seen = new Map<string, Found>();
  const ambiguous = new Set<string>();
  return {
    add(label: string, hit: { kind: Kind; value: number | string }) {
      const before = seen.get(label);
      if (!before) seen.set(label, { label, ...hit });
      else if (before.value !== hit.value) ambiguous.add(label);
    },
    done: (authors: string[]): Recognised => ({ found: [...seen.values()].filter((f) => !ambiguous.has(f.label)), ambiguous: [...ambiguous], authors }),
  };
}

/** A text value ("1,197", "+63", "2026-03-01T10:00") as kindOf reads it, or undefined for a share, a decimal or a word. */
function textValue(raw: string): string | undefined {
  const t = raw.trim().replace(/^[*`_"'\s]+/, "");
  const day = ISO_DAY.exec(t);
  if (day) return day[0];
  const n = /^\+?\d[\d,]*/.exec(t);
  if (!n || /^(\.\d|\s*%|\s*percent)/i.test(t.slice(n[0].length))) return undefined;
  return n[0].replace(/^\+/, "");
}

/** A longer line is not a report row; it is skipped before any pattern runs. */
const MAX_LINE = 2000;

const SINGLE_FIGURE = /(\+?\d[\d,]*)\s+((?:[a-z-]+\s+){0,2}?)(commits?|lines\s+(?:added|deleted|removed)|insertions?|deletions?|additions?)\b/gi;
const PLUS_MINUS = /\+\s*(\d[\d,]*)\s*(?:\/|,|;|and|\s)\s*[-\u2212\u2013]\s*(\d[\d,]*)/g;
const KEY_VALUE = /^[\s>*+\-#]*([A-Za-z][A-Za-z0-9 _\-/()]{1,50}?)[\s*]*[:=][\s*]*(.+)$/;

const isHeaderCell = (x: string) => /^[A-Za-z][A-Za-z _\-/()]{0,30}$/.test(x);

/** The cells of a tab, pipe or comma separated line; a comma line counts only as a header or as a row under a header of the same width. */
function splitCells(line: string, width: number | undefined): string[] | undefined {
  const sep = line.includes("\t") ? "\t" : line.includes("|") ? "|" : line.includes(",") ? "," : undefined;
  if (!sep) return undefined;
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === sep && !quoted) { cells.push(cur.trim()); cur = ""; } else cur += ch;
  }
  cells.push(cur.trim());
  if (sep === "|") { if (cells[0] === "") cells.shift(); if (cells[cells.length - 1] === "") cells.pop(); }
  if (cells.length < 2 || !cells.every((x) => x.length <= 60)) return undefined;
  return sep !== "," || cells.length === width || cells.every(isHeaderCell) ? cells : undefined;
}

/**
 * The figures recognised in a report that is not JSON: "key: value" lines, "123 commits", "1,197 lines added",
 * "+1197/-30", two-column tables and header/row pairs (CSV, markdown tables). With author names, a table that
 * has exactly one row naming one of them is read from that row only. A figure found twice with different values is ambiguous.
 */
export function recogniseText(text: string, authors: string[] = []): Recognised {
  const c = collector();
  const named = new Set<string>();
  const wanted = authors.map((a) => a.trim().toLowerCase()).filter(Boolean);
  const addKeyed = (key: string, value: string) => {
    const v = textValue(value);
    const hit = v === undefined ? undefined : kindOf(key, v);
    if (hit) c.add(key, hit);
    return hit !== undefined;
  };
  let header: string[] | undefined;
  let rows: string[][] = [];
  const flush = () => {
    if (header) {
      const own = wanted.length ? rows.filter((r) => r.some((x) => wanted.some((a) => x.toLowerCase().includes(a)))) : [];
      for (const r of own.length === 1 ? own : rows) header.forEach((h, i) => addKeyed(norm(h), r[i] ?? ""));
    }
    header = undefined;
    rows = [];
  };
  for (const raw of text.split(/\r?\n/)) {
    if (raw.length > MAX_LINE) continue;
    const line = raw.replace(/[*`]/g, "");
    const cells = /^[\s|:\-+]*$/.test(line) ? undefined : splitCells(line, header?.length);
    if (cells) {
      if (cells.every((x) => /[A-Za-z]/.test(x))) { flush(); header = cells; } else if (header && cells.length === header.length) rows.push(cells);
      else if (cells.length === 2) addKeyed(norm(cells[0]!), cells[1]!);
      continue;
    }
    flush();
    for (const m of line.matchAll(PLUS_MINUS)) {
      c.add("lines_added", { kind: "added", value: Number(m[1]!.replace(/,/g, "")) });
      c.add("lines_deleted", { kind: "deleted", value: Number(m[2]!.replace(/,/g, "")) });
    }
    for (const part of line.split(/;\s*|,\s+(?=[A-Za-z][^,:=]*[:=])/)) {
      const kv = KEY_VALUE.exec(part);
      if (!kv) continue;
      const key = norm(kv[1]!);
      if (AUTHOR_KEY.test(key)) { const v = kv[2]!.trim(); if (v && v.length <= 100) named.add(v); } else addKeyed(key, kv[2]!);
    }
    for (const m of line.matchAll(SINGLE_FIGURE)) {
      const phrase = `${m[2]} ${m[3]}`.replace(/\blines\s+(added|deleted|removed)/i, "lines_$1");
      // The two words before the number only exclude (shares, totals, merges); the phrase after it names the figure.
      const around = norm(`${line.slice(0, m.index).trim().split(/\s+/).slice(-2).join(" ")} ${phrase}`);
      if (around.replace(/(^|_)(non|no)_merge/g, "").split("_").some((t) => EXCLUDED_TOKENS.has(t))) continue;
      const label = norm(phrase);
      const hit = kindOf(label, m[1]!.replace(/^\+/, ""));
      if (hit) c.add(label, hit);
    }
  }
  flush();
  return c.done([...named]);
}

/** A JSON array of per-author records: read from the record naming the application name, when exactly one does. */
export function recogniseRecords(records: unknown[], authors: string[]): Recognised {
  const wanted = authors.map((a) => a.trim().toLowerCase()).filter(Boolean);
  const empty = (note: string): Recognised => ({ found: [], ambiguous: [], authors: [], note });
  if (!wanted.length) return empty("the report holds a list of records and no author name was given (--author <name or email>) to choose one.");
  const hits = records.filter((r): r is Record<string, unknown> => {
    if (typeof r !== "object" || r === null || Array.isArray(r)) return false;
    return Object.entries(r).some(([k, x]) => typeof x === "string" && AUTHOR_KEY.test(norm(k)) && wanted.some((a) => x.toLowerCase().includes(a)));
  });
  if (hits.length !== 1) return empty(`${hits.length ? "more than one" : "no"} record in the list names the author, so no record was chosen.`);
  return recogniseFigures(hits[0]);
}

interface Counts { commits: number; added: number; deleted: number; first?: string; last?: string }

/** The same figures counted from the repository: non-merge commits of the identity, bots and generated, vendored and lock files out. */
async function countRepo(dir: string, authors: string[], fromReport: string[]): Promise<Counts | undefined> {
  await assertNotShallow(dir);
  const everything = await listCommits(dir, {});
  const { commits } = await applyExclusions(dir, everything, {} as Params);
  let id: Identity | undefined;
  if (authors.length) id = await resolveIdentity(commits, authors, dir).catch(() => undefined);
  else {
    const emails = new Set<string>();
    const names = new Set<string>();
    for (const a of fromReport) {
      const one = await resolveIdentity(commits, [a], dir).catch(() => undefined);
      one?.emails.forEach((e) => emails.add(e));
      one?.names.forEach((n) => names.add(n));
    }
    id = emails.size ? { emails: [...emails].sort(), names: [...names].sort() } : await resolveIdentity(commits, undefined, dir).catch(() => undefined);
  }
  if (!id) return undefined;
  // An explicit --author is exact, as in analyseRepo; only a report-derived or configured author absorbs look-alike addresses.
  const merged = authors.length ? id : mergeSplits(commits, id).identity;
  const mine = commits.filter((c) => c.parents <= 1 && isMine(c, merged));
  const days = mine.map((c) => c.localDate.toISOString().slice(0, 10)).sort();
  let added = 0;
  let deleted = 0;
  for (const c of mine) for (const f of c.files) { added += f.added ?? 0; deleted += f.deleted ?? 0; }
  return { commits: mine.length, added, deleted, ...(days.length ? { first: days[0]!, last: days[days.length - 1]! } : {}) };
}

const COUNT_WITH_GIT = "Do not stop here: count the same figures with plain git in the clone, read-only commands only (git shortlog -sne --no-merges for commits, git log --no-merges --author=<the person> --numstat for lines; leave out bots, vendored, generated and lock files), then show what the report says next to what the repository says (steps in skills/workproof/references/received-report.md).";

/** Compares a report in another format with the repository by the figures it names. Never reads or prints an address or a path. */
export async function compareForeign(input: unknown, repoDirs: string[], authors: string[]): Promise<ForeignComparison> {
  const { found, ambiguous, authors: named, note } = typeof input === "string" ? recogniseText(input, authors) : Array.isArray(input) ? recogniseRecords(input, authors) : recogniseFigures(input);
  const none = (reason: string, recommendation: string): ForeignComparison => ({ status: "not-checked", reason, altered: [`Not compared: ${reason}`], recommendation });
  if (!found.length && !ambiguous.length) return none(`${note ?? "no figure in the report was recognised as a commit count, a line count or a first or last commit date."} A hash in an unknown format cannot be checked either.`, COUNT_WITH_GIT);
  if (!repoDirs.length) return none("no directory given.", `Run this command again with --repo <clone of the repository the report is about>. ${COUNT_WITH_GIT}`);
  const total: Counts = { commits: 0, added: 0, deleted: 0 };
  let any = false;
  let shallow = false;
  for (const dir of repoDirs) {
    const c = await countRepo(dir, authors, named).catch((e: Error) => {
      if (/shallow clone/.test(e.message)) shallow = true;
      return undefined;
    });
    if (!c) continue;
    any = true;
    total.commits += c.commits;
    total.added += c.added;
    total.deleted += c.deleted;
    if (c.first && (!total.first || c.first < total.first)) total.first = c.first;
    if (c.last && (!total.last || c.last > total.last)) total.last = c.last;
  }
  if (shallow) return none("shallow clone, fetch full history.", "Fetch the full history with git fetch --unshallow and run this command again.");
  if (!any) return none("the repository could not be opened or has no commits by the author, so nothing was compared.", `Run this command in a clone of the repository the report is about and name the author with --author <name or email>. ${COUNT_WITH_GIT}`);
  const actual = (f: Found): string | undefined => {
    const v = f.kind === "commits" ? total.commits : f.kind === "added" ? total.added : f.kind === "deleted" ? total.deleted : f.kind === "first" ? total.first : total.last;
    return v === undefined ? undefined : String(v);
  };
  const rows = found.map((f) => ({ f, said: String(f.value), real: actual(f) })).filter((r) => r.real !== undefined);
  if (!rows.length) return none("no recognised figure could be counted from the repository.", COUNT_WITH_GIT);
  const differ = rows.filter((r) => r.said !== r.real);
  const compared = [`Compared: ${rows.map((r) => r.f.label).join(", ")}.`, ...ambiguous.map((k) => `Not compared: ${k} (ambiguous: the key appears with different values).`)];
  if (differ.length) {
    return {
      status: "do-not-trust",
      reason: `${differ.length} recognised ${differ.length === 1 ? "figure differs" : "figures differ"} from the repository, so the report does not reproduce.`,
      altered: ["| Figure | The report says | The repository says |", "|---|---|---|", ...differ.map((r) => `| ${r.f.label.replace(/\|/g, "\\|")} | ${r.said} | ${r.real} |`), ...compared],
      recommendation: "Do not rely on these figures. Ask the sender for a fresh report made from the original repository and for references from people who worked with them.",
    };
  }
  return {
    status: "reproduces",
    reason: "Every recognised figure matches the repository. The hash and the fingerprint were not checked, because the report is in a foreign format.",
    altered: ["None: every recognised figure matches.", ...compared],
    recommendation: "The recognised figures can be relied on as far as the two limits above allow. The hash and the repository fingerprint were not checked. Keep the report and the repository state it was compared with.",
  };
}
