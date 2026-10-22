import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { basename, dirname, join, resolve, sep } from "node:path";
import { git } from "./git.js";

/** One problem found in an attached data file. */
export interface RowProblem {
  file: string;
  commit: string;
  check: string;
  said: string;
  actual: string;
}

export interface RowChecks {
  /** Names of the data files that were read. */
  files: string[];
  /** One line per file about its SHA-256 and the hash strings in the report. */
  hashLines: string[];
  /** Hash lines that say the file does not match. */
  hashMismatch: boolean;
  rowsChecked: number;
  problems: RowProblem[];
  /** Commit ids of rows that are not in the repository. */
  missing: string[];
  /** Why rows were not compared, when they were not. */
  note?: string;
}

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const HASH_STRING = /(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])/gi;
const DATA_NAME = /(?<![\w./\\-])[\w./\\-]{1,200}\.(?:csv|tsv|json)\b/gi;
const MAX_REPORT_CHARS = 200_000;
const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** Comma, tab or semicolon separated text as rows of cells; quotes protect a separator. */
export function parseDelimited(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  const sep = first.includes("\t") ? "\t" : first.includes(",") ? "," : first.includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const push = () => {
    row.push(cell.trim());
    cell = "";
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) push();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      push();
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  push();
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

/** Records of an attached file: CSV or TSV by header, or the first array of objects in JSON. */
export function recordsOf(name: string, text: string): Record<string, string>[] {
  if (/\.json$/i.test(name)) {
    let data: unknown;
    try { data = JSON.parse(text); } catch { return []; }
    const list = Array.isArray(data) ? data : data && typeof data === "object" ? Object.values(data).find(Array.isArray) : undefined;
    if (!Array.isArray(list)) return [];
    return list.filter((r): r is Record<string, unknown> => !!r && typeof r === "object" && !Array.isArray(r)).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [norm(k), v === null || typeof v === "object" ? "" : String(v)])));
  }
  const rows = parseDelimited(text);
  const head = rows[0]?.map(norm);
  if (!head) return [];
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const pick = (r: Record<string, string>, re: RegExp): string | undefined => {
  const key = Object.keys(r).find((k) => re.test(k));
  return key === undefined ? undefined : r[key];
};
const toInt = (v: string | undefined): number | undefined => {
  const t = (v ?? "").replace(/[,\s+]/g, "");
  return /^\d+$/.test(t) ? Number(t) : undefined;
};
const DAY_MS = 86_400_000;
/** The date in the commit's own offset, its UTC date, and the UTC dates one day either side of that. */
const dayCandidates = (dates: string[]): Set<string> => {
  const out = new Set<string>();
  for (const d of dates) {
    out.add(d.slice(0, 10));
    const t = Date.parse(d);
    if (!Number.isNaN(t)) for (const k of [-1, 0, 1]) out.add(new Date(t + k * DAY_MS).toISOString().slice(0, 10));
  }
  return out;
};
const sameDay = (cell: string, ...dates: string[]) => /^\d{4}-\d{2}-\d{2}/.test(cell) && dayCandidates(dates).has(cell.slice(0, 10));

interface GitCommit { name: string; email: string; authorDate: string; commitDate: string; added: number | null; deleted: number | null; merge: boolean }

async function showCommit(dir: string, id: string): Promise<GitCommit | null> {
  try {
    const out = await git(["show", "--numstat", "--no-color", "--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%cI%x1f%P", id, "--"], dir);
    const [head = "", ...rest] = out.split("\n");
    const [, name = "", email = "", authorDate = "", commitDate = "", parents = ""] = head.split("\x1f");
    let added = 0;
    let deleted = 0;
    for (const line of rest) {
      const m = /^(\d+|-)\t(\d+|-)\t/.exec(line);
      if (m) { added += m[1] === "-" ? 0 : Number(m[1]); deleted += m[2] === "-" ? 0 : Number(m[2]); }
    }
    const merge = parents.trim().split(/\s+/).filter(Boolean).length > 1;
    return { name, email, authorDate, commitDate, added: merge ? null : added, deleted: merge ? null : deleted, merge };
  } catch {
    return null;
  }
}

/** Data files beside the report and files the report names, without the report itself. */
async function attachedFiles(reportPath: string, reportText: string): Promise<string[]> {
  const dir = dirname(resolve(reportPath));
  const found = new Set<string>();
  const self = resolve(reportPath);
  const add = async (p: string) => {
    const full = resolve(p);
    if (!full.startsWith(dir + sep)) return;
    if (full === self || found.has(full) || found.size >= MAX_FILES) return;
    try {
      const s = await stat(full);
      if (s.isFile() && s.size <= MAX_BYTES) found.add(full);
    } catch {
      // a name in the report that is not a file here
    }
  };
  for (const m of reportText.slice(0, MAX_REPORT_CHARS).matchAll(DATA_NAME)) {
    await add(join(dir, m[0]));
    await add(join(dir, basename(m[0])));
  }
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (e.isFile() && /\.(csv|tsv)$/i.test(e.name)) await add(join(dir, e.name));
  }
  return [...found];
}

/**
 * Checks what comes with a received report: the SHA-256 of each attached data file against the
 * hash strings in the report, and each row that has a commit id against the repository (exists,
 * author, date, lines added and deleted by `git show --numstat`). Reads files and runs read-only git.
 */
export async function rowChecks(reportPath: string, reportText: string, repoDir: string | undefined): Promise<RowChecks> {
  const result: RowChecks = { files: [], hashLines: [], hashMismatch: false, rowsChecked: 0, problems: [], missing: [] };
  const files = await attachedFiles(reportPath, reportText);
  if (!files.length) return result;
  const body = reportText.slice(0, MAX_REPORT_CHARS);
  const stated = new Set([...body.matchAll(HASH_STRING)].map((m) => m[0].toLowerCase()));
  for (const full of files) {
    const name = basename(full);
    const bytes = await readFile(full);
    const sha = createHash("sha256").update(bytes).digest("hex");
    result.files.push(name);
    if (!stated.size) result.hashLines.push(`${name}: SHA-256 ${sha.slice(0, 12)}; the report holds no hash string to compare it with.`);
    else if (stated.has(sha)) result.hashLines.push(`${name}: SHA-256 ${sha.slice(0, 12)} matches a hash in the report.`);
    else if (!body.toLowerCase().includes(name.toLowerCase())) result.hashLines.push(`${name}: SHA-256 ${sha.slice(0, 12)}; the report holds no hash for it.`);
    else {
      result.hashMismatch = true;
      result.hashLines.push(`${name}: SHA-256 ${sha.slice(0, 12)} does not match any hash in the report (the report has ${[...stated].map((h) => h.slice(0, 12)).join(", ")}).`);
    }
    const records = recordsOf(name, bytes.toString("utf8"));
    const withId = records.map((r) => ({ r, id: pick(r, /^(commit|commit_?(id|hash|sha)|sha|hash|id|short_?(sha|hash))$/) })).filter((x): x is { r: Record<string, string>; id: string } => /^[0-9a-f]{7,40}$/i.test(x.id ?? ""));
    if (!withId.length) continue;
    if (!repoDir) {
      result.note = "no repository directory, so the rows were not compared.";
      continue;
    }
    for (const { r, id } of withId) {
      const c = await showCommit(repoDir, id);
      result.rowsChecked += 1;
      if (!c) {
        result.missing.push(id.slice(0, 12));
        continue;
      }
      const short = id.slice(0, 7);
      const add = toInt(pick(r, /(^|_)(added|additions|insertions)(_|$)|lines_?added/));
      const del = toInt(pick(r, /(^|_)(deleted|deletions|removed)(_|$)|lines_?deleted/));
      if (add !== undefined && c.added !== null && add !== c.added) result.problems.push({ file: name, commit: short, check: "lines added", said: String(add), actual: String(c.added) });
      if (del !== undefined && c.deleted !== null && del !== c.deleted) result.problems.push({ file: name, commit: short, check: "lines deleted", said: String(del), actual: String(c.deleted) });
      const date = pick(r, /date|time/);
      if (date && /^\d{4}-\d{2}-\d{2}/.test(date) && !sameDay(date, c.authorDate, c.commitDate)) result.problems.push({ file: name, commit: short, check: "date", said: date.slice(0, 10), actual: c.authorDate.slice(0, 10) });
      const who = pick(r, /^(author|author_?name|author_?email|committer|name|email)$/);
      if (who) {
        const w = who.toLowerCase();
        const ok = [c.name, c.email].some((g) => g && (g.toLowerCase() === w || w.includes(g.toLowerCase()) || g.toLowerCase().includes(w)));
        if (!ok) result.problems.push({ file: name, commit: short, check: "author", said: who.includes("@") ? "(address hidden)" : who, actual: c.name });
      }
    }
  }
  return result;
}

const cell = (t: string) => t.replace(/\|/g, "\\|");

/** The "Row checks" section of the verdict, one line per fact. */
export function renderRowChecks(rc: RowChecks): string[] {
  if (!rc.files.length) return [];
  const out = ["## Row checks", `Attached data files read: ${rc.files.join(", ")}.`, ...rc.hashLines];
  if (rc.note) out.push(`Not compared: ${rc.note}`);
  else if (rc.rowsChecked > 0) {
    const bad = new Set(rc.problems.map((p) => `${p.file}:${p.commit}`)).size;
    out.push(`${rc.rowsChecked} rows with a commit id compared with \`git show --numstat\`: ${rc.rowsChecked - rc.missing.length - bad} match, ${bad} differ, ${rc.missing.length} not in the repository.`);
  } else out.push("No row with a commit id was found in these files, so no row was compared.");
  if (rc.problems.length) out.push("", "| Commit | Check | The file says | The repository says |", "|---|---|---|---|", ...rc.problems.map((p) => `| ${p.commit} | ${p.check} | ${cell(p.said)} | ${cell(p.actual)} |`));
  if (rc.missing.length) out.push("", `Commit ids not in the repository: ${rc.missing.slice(0, 30).join(", ")}${rc.missing.length > 30 ? ` and ${rc.missing.length - 30} more` : ""}. The clone may lack a branch that holds them.`);
  out.push("");
  return out;
}

const mostMissing = (rc: RowChecks): boolean => rc.missing.length > 0 && rc.missing.length * 2 > rc.rowsChecked;
/** Do-not-trust: a hash or row value differs, or most rows are not in the repository. */
export const rowChecksFail = (rc: RowChecks): boolean => rc.hashMismatch || rc.problems.length > 0 || mostMissing(rc);
/** Some rows are not in the repository but most are: the figures cannot be confirmed, nothing is shown to be wrong. */
export const rowChecksUnconfirmed = (rc: RowChecks): boolean => !rowChecksFail(rc) && rc.missing.length > 0;
export const rowChecksReason = (rc: RowChecks): string => {
  const parts: string[] = [];
  if (rc.hashMismatch) parts.push("an attached file does not match the hash in the report");
  if (rc.problems.length) parts.push(`${rc.problems.length} ${rc.problems.length === 1 ? "row value differs" : "row values differ"} from the repository`);
  if (rc.missing.length) parts.push(`${rc.missing.length} ${rc.missing.length === 1 ? "commit id is" : "commit ids are"} not in the repository (the clone may lack a branch)`);
  return `${parts.join("; ")} (see Row checks).`;
};
