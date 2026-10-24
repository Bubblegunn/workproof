import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { computeFigures, readBack } from "./figures.js";
import type { DocHit, FigureRow, FiguresOptions } from "./figures.js";
import type { Turn } from "./stopcheck.js";

/**
 * The answer check of the Stop hook. It compares the numbers and dates a final answer (and any file the turn wrote)
 * states about the repository with `workproof figures`, and blocks only on a near miss: a figure that differs from
 * the computed one by a small margin, with no matching figure and nothing in the sourced text that says it.
 * Precision over recall: whenever a check is unsure it allows.
 */

export const ANSWER_PREFIX = "Before you finish: a number or date in your answer differs slightly from the repository's own figures.";
/** Repositories with more commits than this are not checked (the figures would take too long). */
export const MAX_COMMITS = 20000;
const BUDGET_MS = 6000;
const GIT_TIMEOUT_MS = 2000;
const MAX_FINDINGS = 3;
const DAY_MS = 86400000;
const PROMPT_TRIGGER = /\b(commits?|git history|history of|repo(sitory)?|contribution|promotion|visa|invoice|timesheet|candidate|audit(or)?|statement|evidence|performance review|self-review)\b/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_RE = `(${MONTHS.join("|")})`;
/** The nouns the check reads: commits, merge commits, authors and lines. */
const COUNT_NOUNS = new Set(["commit", "commits", "merge commit", "merge commits", "author", "authors", "line", "lines"]);

export interface AnswerOptions {
  /** Total time for the whole check; on expiry the check allows. */
  budgetMs?: number;
  /** The commit count above which the check is skipped. */
  maxCommits?: number;
}

export interface Window {
  since: string;
  until: string;
}

interface Checked {
  where: string;
  text: string;
}

/** A valid calendar date as YYYY-MM-DD, or null. */
function isoOf(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1) return null;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > last) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** The window from the first day of month `from` to the last day of month `to` in one year. */
function span(year: number, from: number, to: number): Window | null {
  const since = isoOf(year, from, 1);
  const until = isoOf(year, to, new Date(Date.UTC(year, to, 0)).getUTCDate());
  return since && until && from <= to ? { since, until } : null;
}

const monthNumber = (name: string): number => MONTHS.indexOf(name.toLowerCase()) + 1;

/**
 * The date window a prompt states, or null. Forms: two explicit dates (the earliest and the latest are used),
 * Q1..Q4 YYYY, H1/H2 YYYY, first/second half of YYYY, Month to Month YYYY (the whole last month included),
 * in/during YYYY, and a lone YYYY. Anything else, including a single explicit date, is null.
 */
export function windowFromPrompt(prompt: string): Window | null {
  const text = prompt.normalize("NFKC");
  const dates: string[] = [];
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const d = isoOf(Number(m[1]), Number(m[2]), Number(m[3]));
    if (d) dates.push(d);
  }
  for (const m of text.matchAll(new RegExp(`\\b(\\d{1,2})\\s+${MONTH_RE}\\s+(\\d{4})\\b`, "gi"))) {
    const d = isoOf(Number(m[3]), monthNumber(m[2]!), Number(m[1]));
    if (d) dates.push(d);
  }
  for (const m of text.matchAll(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, "gi"))) {
    const d = isoOf(Number(m[3]), monthNumber(m[1]!), Number(m[2]));
    if (d) dates.push(d);
  }
  if (dates.length >= 2) {
    dates.sort();
    return { since: dates[0]!, until: dates[dates.length - 1]! };
  }
  if (dates.length === 1) return null;
  const quarter = /\bQ([1-4])\s+(\d{4})\b/i.exec(text);
  if (quarter) {
    const q = Number(quarter[1]);
    return span(Number(quarter[2]), 3 * q - 2, 3 * q);
  }
  const half = /\bH([12])\s+(\d{4})\b/i.exec(text) ?? /\b(first|second)\s+half\s+(?:of\s+)?(\d{4})\b/i.exec(text);
  if (half) {
    const first = half[1]!.toLowerCase() === "1" || half[1]!.toLowerCase() === "first";
    return span(Number(half[2]), first ? 1 : 7, first ? 6 : 12);
  }
  const monthToMonth = new RegExp(`\\b${MONTH_RE}\\s+to\\s+${MONTH_RE}\\s+(\\d{4})\\b`, "i").exec(text);
  if (monthToMonth) return span(Number(monthToMonth[3]), monthNumber(monthToMonth[1]!), monthNumber(monthToMonth[2]!));
  const inYear = /\b(?:in|during)\s+((?:19|20)\d{2})\b/i.exec(text);
  if (inYear) return span(Number(inYear[1]), 1, 12);
  const years = new Set([...text.matchAll(/\b(?:19|20)\d{2}\b/g)].map((m) => m[0]));
  if (years.size === 1) return span(Number([...years][0]), 1, 12);
  return null;
}

/** Runs read-only git and returns its stdout, or null on any failure or after the git timeout. */
async function git(args: string[], cwd: string): Promise<string | null> {
  try {
    const out = await promisify(execFile)("git", ["-C", cwd, ...args], {
      encoding: "utf8",
      timeout: GIT_TIMEOUT_MS,
      maxBuffer: 1024 * 1024 * 64,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    });
    return String(out.stdout);
  } catch {
    return null;
  }
}

/** The configured address and the three most frequent author addresses, lowercase and de-duplicated. */
async function identitiesOf(cwd: string): Promise<string[]> {
  const configured = ((await git(["config", "--get", "user.email"], cwd)) ?? "").trim().toLowerCase();
  const counted = ((await git(["shortlog", "-sne", "HEAD"], cwd)) ?? "")
    .split("\n")
    .map((l) => /^\s*(\d+)\t.*<([^<>]+)>\s*$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ count: Number(m[1]), email: m[2]!.trim().toLowerCase() }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((c) => c.email);
  return [...new Set([configured, ...counted])].filter((e) => e.includes("@"));
}

/** Every figure of every (identity, window) pair. Windows are none plus the one the prompt states, if any. */
async function computeAll(cwd: string, identities: string[], windows: (Window | null)[]): Promise<FigureRow[]> {
  const rows: FigureRow[] = [];
  for (const email of identities) {
    for (const w of windows) {
      const opts: FiguresOptions = { repo: cwd, authors: [email], json: false };
      if (w) {
        opts.since = w.since;
        opts.until = w.until;
      }
      rows.push(...(await computeFigures(opts)).rows);
    }
  }
  return rows.filter((r) => r.computed);
}

/** Every integer digit run of the sourced text, commas removed. */
function numbersIn(text: string): Set<number> {
  return new Set([...text.matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replace(/,/g, ""))));
}

/** The figure rows that a noun of the answer may be compared with. */
function classRows(noun: string, label: string): boolean {
  const n = noun.toLowerCase().replace(/s$/, "");
  if (n === "merge commit") return label.startsWith("merge commits");
  if (n === "commit") return label.startsWith("authored non-merge commits") || label === "all authors, non-merge commits";
  if (n === "author") return label === "distinct authors";
  if (n === "line") return label.startsWith("lines added") || label.startsWith("lines deleted");
  return false;
}

/** A near miss: the claimed N differs from the figure F by at least 1 and at most max(2, ceil(0.1 F)). */
const nearMiss = (n: number, f: number): boolean => {
  const d = Math.abs(n - f);
  return d >= 1 && d <= Math.max(2, Math.ceil(0.1 * f));
};

const shorten = (s: string, max: number): string => (s.length > max ? `${s.slice(0, max - 3)}...` : s);

function message(excerpt: string, where: string, row: FigureRow, claimed: number | string): string {
  const figure = typeof row.value === "number" ? String(row.value) : `"${row.value}"`;
  return `The answer says "${shorten(excerpt, 80)}" (${where}) but workproof figures prints ${figure} for "${row.label}" (${shorten(row.filter, 120)}). Run \`npx workproof figures --author <the person> [--since --until]\` and use the printed figure with its label, or say which different filter gives ${claimed}.`;
}

/** The count findings of one readBack hit, or null. */
function countFinding(hit: DocHit, rows: FigureRow[], sourced: Set<number>, outputCounts: Set<number>): FigureRow | null {
  if (!COUNT_NOUNS.has(hit.noun.toLowerCase())) return null;
  if (hit.labels.length) return null;
  if (sourced.has(hit.integer) || outputCounts.has(hit.integer)) return null;
  const near = rows.filter((r) => typeof r.value === "number" && classRows(hit.noun, r.label) && nearMiss(hit.integer, r.value));
  return near[0] ?? null;
}

const DATE_PHRASE = /\b(first|earliest|last|latest|most recent)(?: authored)?(?: (?:commit|activity|contribution))?\b/gi;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dayCount = (a: string, b: string): number => Math.abs(Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY_MS;

/** The date findings of one text: an ISO date after a first/last phrase, one to seven days from a computed date of that kind. */
function dateFindings(text: string, where: string, rows: FigureRow[], sourcedText: string): string[] {
  const firsts = rows.filter((r) => r.label === "first authored commit date" && typeof r.value === "string" && ISO.test(r.value));
  const lasts = rows.filter((r) => r.label === "last authored commit date" && typeof r.value === "string" && ISO.test(r.value));
  const all = new Set([...firsts, ...lasts].map((r) => r.value as string));
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    for (const m of line.matchAll(DATE_PHRASE)) {
      const start = m.index ?? 0;
      const from = start + m[0].length;
      const rest = line.slice(from, from + 80);
      const cut = rest.search(/[.;!?](?:\s|$)/);
      const scope = cut >= 0 ? rest.slice(0, cut) : rest;
      const first = /^(first|earliest)$/i.test(m[1]!);
      const same = first ? firsts : lasts;
      for (const dm of scope.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)) {
        const date = dm[0];
        const [y, mo, d] = date.split("-").map(Number);
        if (!isoOf(y!, mo!, d!) || all.has(date) || sourcedText.includes(date)) continue;
        let nearest: FigureRow | null = null;
        for (const r of same) if (dayCount(r.value as string, date) <= 7 && (!nearest || dayCount(r.value as string, date) < dayCount(nearest.value as string, date))) nearest = r;
        if (!nearest) continue;
        const excerpt = line.slice(start, from + (dm.index ?? 0) + date.length);
        out.push(message(excerpt, where, nearest, date));
      }
    }
  }
  return out;
}

async function check(turn: Turn, cwd: string, opts: AnswerOptions): Promise<string | null> {
  const prompt = turn.prompt ?? "";
  if (!turn.finalText.trim()) return null;
  if (!turn.runs.length && !PROMPT_TRIGGER.test(prompt)) return null;
  if ((await git(["rev-parse", "--is-inside-work-tree"], cwd))?.trim() !== "true") return null;
  const commits = Number((await git(["rev-list", "--count", "HEAD"], cwd))?.trim());
  if (!Number.isInteger(commits) || commits < 1 || commits > (opts.maxCommits ?? MAX_COMMITS)) return null;
  const texts: Checked[] = [
    { where: "final answer", text: turn.finalText },
    ...(turn.writes ?? []).map((w) => ({ where: basename(w.file), text: w.content })),
  ];
  if (!texts.some((t) => /\d/.test(t.text))) return null;
  const identities = await identitiesOf(cwd);
  if (!identities.length) return null;
  const stated = windowFromPrompt(prompt);
  const rows = await computeAll(cwd, identities, [null, ...(stated ? [stated] : [])]);
  const outputs = turn.outputs ?? [];
  const sourcedText = [prompt, ...outputs].join("\n");
  const sourced = numbersIn(sourcedText);
  const outputCounts = new Set(outputs.map((o) => o.split("\n").filter((l) => l.trim()).length));
  const findings: string[] = [];
  const dir = await mkdtemp(join(tmpdir(), "workproof-answer-"));
  try {
    for (const [i, t] of texts.entries()) {
      const file = join(dir, `text-${i}.md`);
      await writeFile(file, t.text, "utf8");
      const doc = await readBack(file, rows);
      for (const hit of doc.hits) {
        const row = countFinding(hit, rows, sourced, outputCounts);
        if (row) findings.push(message(hit.excerpt, t.where, row, hit.integer));
      }
      findings.push(...dateFindings(t.text, t.where, rows, sourcedText));
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  if (!findings.length) return null;
  const reason = `${ANSWER_PREFIX} ${findings.slice(0, MAX_FINDINGS).join(" ")}`;
  return reason.replace(EMAIL, "<identity>");
}

/**
 * The reason to block for the turn, or null to allow. Never throws. A timeout (the budget) or any error allows.
 * Read-only: git and the figures computation only; the text is written to a temporary file that is removed.
 */
export async function answerReason(turn: Turn, cwd: string, opts: AnswerOptions = {}): Promise<string | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), opts.budgetMs ?? BUDGET_MS);
  });
  try {
    return await Promise.race([check(turn, cwd, opts).catch(() => null), expired]);
  } finally {
    clearTimeout(timer);
  }
}
