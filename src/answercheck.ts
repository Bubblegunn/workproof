import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { computeFigures, readBack } from "./figures.js";
import { computePeople } from "./people.js";
import { zoneLabel, zoneFromPrompt } from "./figures/zone.js";
import type { DocHit, FigureRow, FiguresOptions, FiguresResult } from "./figures.js";
import type { Turn } from "./stopcheck.js";

/**
 * The answer check of the Stop hook. It compares the commit counts and first/last commit dates that a final answer
 * (and any file the turn wrote) states about the repository with `workproof figures`, and blocks only on a near miss:
 * a claimed count that is one figure away (or two for a figure of ten or more, or 2% of it), with a claim context in
 * the same sentence, no matching figure, and no such number in the sourced text. Precision over recall: when unsure, allow.
 */

export const ANSWER_PREFIX = "Before you finish: a number or date in your answer differs slightly from the repository's own figures.";
/** Repositories with more commits than this are not checked. */
export const MAX_COMMITS = 20000;
const BUDGET_MS = 6000;
const GIT_TIMEOUT_MS = 2000;
const MAX_FINDINGS = 3;
/** The configured address plus the top two authors. */
const MAX_IDENTITIES = 3;
const DAY_MS = 86400000;
export const PROMPT_TRIGGER = /\b(commits?|contributions?|promotion|visa|invoice|timesheet|candidate|performance review|self-review|git history)\b/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_ALT = `${MONTHS.join("|")}|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec`;
const MONTH_RE = `(${MONTH_ALT})\\.?`;
/** The nouns the check reads: commits and merges. */
const COUNT_NOUNS = new Set(["commit", "commits", "merge", "merges", "merge commit", "merge commits"]);
/** A number as a count: digits with thousands groups, or plain digits. "3,4,5" is three numbers. */
const NUMBER_TOKEN = /\d{1,3}(?:,\d{3})+|\d+/g;
/** A claim context: "I" in capitals, or one of the claim words, somewhere in the same sentence. */
const CLAIM_CONTEXT = [/\bI\b/, /\b(?:my|we|our|authored|contributed|made|wrote|delivered|committed|has|have|had|total)\b/i];
/** A sentence about squashing, rebasing, cherry-picking, reverts or pull requests does not state the author's count. */
const NOT_A_CLAIM = /\b(?:squash\w*|rebase\w*|cherry\w*|revert of|pull requests?)\b|\bPRs?\b/i;
/** A number directly after one of these is a selection ("the last 8 commits"), not a total. */
const QUALIFIER_BEFORE = /\b(?:last|past|previous|recent|latest|first|top|only)\s*$/i;
const DATE_PHRASE = /\b(first|last|earliest|latest|most recent)\s+(?:authored\s+)?(?:commit|activity|contribution)\b/gi;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** The zone the prompt names, as a --tz value. UTC when it names none. */
function zoneLabelForPrompt(prompt: string): string {
  return zoneLabel(zoneFromPrompt(prompt));
}

export type FiguresFn = (opts: FiguresOptions) => Promise<FiguresResult>;

export interface AnswerOptions {
  /** Total time for the whole check; on expiry the check allows. */
  budgetMs?: number;
  /** The commit count above which the check is skipped. */
  maxCommits?: number;
  /** The figures computation (a seam for tests). */
  figures?: FiguresFn;
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
  if (d > lastDay(y, m)) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const lastDay = (y: number, m: number): number => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** The window from the first day of month `from` to the last day of month `to` in one year, or null. */
function span(year: number, from: number, to: number): Window | null {
  const since = isoOf(year, from, 1);
  const until = isoOf(year, to, lastDay(year, to));
  return since && until && from <= to ? { since, until } : null;
}

const monthNumber = (name: string): number => MONTHS.findIndex((m) => m.startsWith(name.toLowerCase().slice(0, 3))) + 1;

/**
 * The date window a prompt states, or null. Two explicit dates are a range (the earliest and the latest). Otherwise the
 * windows of Q1..Q4 YYYY, H1/H2 YYYY, first/second half of YYYY, and Month to Month YYYY (across years too) are collected:
 * all the same window is used, several quarters are the earliest start to the latest end, and any other mix is null.
 * A lone year (in, during, or bare YYYY) is used only when no other form matched. Anything else is null.
 */
export function windowFromPrompt(prompt: string): Window | null {
  const CONN = "(?:\\s+(?:to|and|until|till|through|thru)\\s+|\\s*[-\u2013\u2014]\\s*)";
  // "1 January and 30 June 2026" and "January 1 to June 30, 2026": the first date takes the year of the second.
  const text = prompt
    .normalize("NFKC")
    .replace(new RegExp(`\\b(\\d{1,2})\\s+${MONTH_RE}(?=${CONN}\\d{1,2}\\s+${MONTH_RE}\\s+(\\d{4})\\b)`, "gi"), (_m, d: string, mo: string, _m2: string, y: string) => `${d} ${mo} ${y}`)
    .replace(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?=${CONN}${MONTH_RE}\\s+\\d{1,2},?\\s+(\\d{4})\\b)`, "gi"), (_m, mo: string, d: string, _m2: string, y: string) => `${mo} ${d}, ${y}`);
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
  if (dates.length) {
    if (dates.length !== 2) return null;
    dates.sort();
    return { since: dates[0]!, until: dates[1]! };
  }
  const found: { kind: "quarter" | "other"; w: Window }[] = [];
  const add = (kind: "quarter" | "other", w: Window | null) => {
    if (w) found.push({ kind, w });
  };
  for (const m of text.matchAll(/\bQ([1-4])\s+(\d{4})\b/gi)) {
    const q = Number(m[1]);
    add("quarter", span(Number(m[2]), 3 * q - 2, 3 * q));
  }
  for (const m of text.matchAll(/\bH([12])\s+(\d{4})\b/gi)) {
    const first = m[1] === "1";
    add("other", span(Number(m[2]), first ? 1 : 7, first ? 6 : 12));
  }
  for (const m of text.matchAll(/\b(first|second)\s+half\s+(?:of\s+)?(\d{4})\b/gi)) {
    const first = m[1]!.toLowerCase() === "first";
    add("other", span(Number(m[2]), first ? 1 : 7, first ? 6 : 12));
  }
  for (const m of text.matchAll(new RegExp(`\\b${MONTH_RE}\\s+(\\d{4})\\s+to\\s+${MONTH_RE}\\s+(\\d{4})\\b`, "gi"))) {
    const since = isoOf(Number(m[2]), monthNumber(m[1]!), 1);
    const until = isoOf(Number(m[4]), monthNumber(m[3]!), lastDay(Number(m[4]), monthNumber(m[3]!)));
    add("other", since && until && since <= until ? { since, until } : null);
  }
  for (const m of text.matchAll(new RegExp(`\\b${MONTH_RE}\\s+to\\s+${MONTH_RE}\\s+(\\d{4})\\b`, "gi"))) {
    add("other", span(Number(m[3]), monthNumber(m[1]!), monthNumber(m[2]!)));
  }
  if (found.length) {
    const first = found[0]!.w;
    if (found.every((f) => f.w.since === first.since && f.w.until === first.until)) return first;
    if (found.every((f) => f.kind === "quarter")) {
      return { since: found.map((f) => f.w.since).sort()[0]!, until: found.map((f) => f.w.until).sort().at(-1)! };
    }
    return null;
  }
  const years = new Set([...text.matchAll(/\b(?:19|20)\d{2}\b/g)].map((m) => m[0]));
  return years.size === 1 ? span(Number([...years][0]), 1, 12) : null;
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

/** The configured address and the top two author addresses by commit count, lowercase and de-duplicated. */
async function identitiesOf(cwd: string): Promise<string[]> {
  const configured = ((await git(["config", "--get", "user.email"], cwd)) ?? "").trim().toLowerCase();
  const counted = ((await git(["shortlog", "-sne", "HEAD"], cwd)) ?? "")
    .split("\n")
    .map((l) => /^\s*(\d+)\t.*<([^<>]+)>\s*$/.exec(l))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ count: Number(m[1]), email: m[2]!.trim().toLowerCase() }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_IDENTITIES - 1)
    .map((c) => c.email);
  return [...new Set([configured, ...counted])].filter((e) => e.includes("@")).slice(0, MAX_IDENTITIES);
}

/**
 * Every computed figure of every (identity, window) pair. The deadline is checked before each computation: once it has
 * passed, no new computation starts and the result is null (incomplete), so the check allows.
 */
export async function computeAll(
  cwd: string,
  identities: string[],
  windows: (Window | null)[],
  deadline: number,
  figures: FiguresFn = computeFigures,
  tz?: string,
  withPeople = false,
): Promise<FigureRow[] | null> {
  const rows: FigureRow[] = [];
  for (const email of identities) {
    for (const w of windows) {
      if (Date.now() >= deadline) return null;
      const opts: FiguresOptions = { repo: cwd, authors: [email], json: false, ...(tz ? { tz } : {}) };
      if (w) {
        opts.since = w.since;
        opts.until = w.until;
      }
      rows.push(...(await figures(opts)).rows);
    }
  }
  // Every person's own counts are figures too: an answer about several people quotes each person's number.
  if (withPeople) {
    for (const w of windows) {
      if (Date.now() >= deadline) return null;
      try {
        const r = await computePeople({ repo: cwd, json: false, emails: false, max: 200, ...(w ? { since: w.since, until: w.until } : {}), ...(tz ? { tz } : {}) });
        for (const p of r.people) {
          rows.push({ label: "authored non-merge commits, one person (people)", value: p.commits, filter: `${p.name}; merged addresses`, computed: true });
          if (p.commitsProvenOnly !== p.commits) rows.push({ label: "authored non-merge commits, one person (people), proven joins only", value: p.commitsProvenOnly, filter: p.name, computed: true });
        }
      } catch {
        // the people figures are an addition; the identity figures above stand
      }
    }
  }
  return rows.filter((r) => r.computed);
}

/** Every number of a text as its value, thousands groups read as one number. */
function numberSpans(text: string): { value: number; index: number }[] {
  return [...text.matchAll(NUMBER_TOKEN)].map((m) => ({ value: Number(m[0].replace(/,/g, "")), index: m.index ?? 0 }));
}

/** The figure rows that a noun of the answer may be compared with. */
function classRows(noun: string, label: string): boolean {
  const n = noun.toLowerCase().replace(/s$/, "");
  if (n === "merge" || n === "merge commit") return label.startsWith("merge commits");
  if (n === "commit") return label.startsWith("authored non-merge commits") || label === "all authors, non-merge commits";
  return false;
}

/** A near miss: the claimed N differs from the figure F by at most 1 when F < 10, and by at most max(1, ceil(0.02 F)) otherwise. */
export const nearMiss = (n: number, f: number): boolean => {
  const d = Math.abs(n - f);
  const band = f < 10 ? 1 : Math.max(1, Math.ceil(0.02 * f));
  return d >= 1 && d <= band;
};

const shorten = (s: string, max: number): string => (s.length > max ? `${s.slice(0, max - 3)}...` : s);

function message(excerpt: string, where: string, row: FigureRow, claimed: number | string): string {
  const figure = typeof row.value === "number" ? String(row.value) : `"${row.value}"`;
  return `The answer says "${shorten(excerpt, 80)}" (${where}) but workproof figures prints ${figure} for "${row.label}" (${shorten(row.filter, 120)}). Run \`npx workproof figures --author <the person> [--since --until]\` and use the printed figure with its label, or say which different filter gives ${claimed}.`;
}

/** The sentence of a text line that holds the hit's number, or null. */
function sentenceOf(text: string, hit: DocHit): string | null {
  const line = text.split(/\r?\n/)[hit.line - 1] ?? "";
  for (const s of line.split(/(?<=[.!?])\s+/)) {
    if (numberSpans(s).some((n) => n.value === hit.integer)) return s;
  }
  return null;
}

/** The count finding of one readBack hit, as the figure row it is compared with, or null. */
function countFinding(hit: DocHit, text: string, rows: FigureRow[], sourced: Set<number>, outputCounts: Set<number>): FigureRow | null {
  if (!COUNT_NOUNS.has(hit.noun.toLowerCase())) return null;
  if (hit.labels.length) return null;
  if (sourced.has(hit.integer) || outputCounts.has(hit.integer)) return null;
  const sentence = sentenceOf(text, hit);
  if (!sentence || !CLAIM_CONTEXT.some((re) => re.test(sentence)) || NOT_A_CLAIM.test(sentence)) return null;
  const at = numberSpans(sentence).find((n) => n.value === hit.integer)?.index ?? 0;
  if (QUALIFIER_BEFORE.test(sentence.slice(0, at))) return null;
  return rows.find((r) => typeof r.value === "number" && classRows(hit.noun, r.label) && nearMiss(hit.integer, r.value)) ?? null;
}

const dayCount = (a: string, b: string): number => Math.abs(Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY_MS;

/**
 * The date findings of one text: "first/last (authored) commit|activity|contribution" followed within 40 characters, in
 * the same sentence, by an ISO date that is one to seven days from a computed date of that kind, is none of the computed
 * dates, and is not in the sourced text.
 */
function dateFindings(text: string, where: string, rows: FigureRow[], sourcedText: string): string[] {
  const firsts = rows.filter((r) => r.label === "first authored commit date" && typeof r.value === "string" && ISO.test(r.value));
  const lasts = rows.filter((r) => r.label === "last authored commit date" && typeof r.value === "string" && ISO.test(r.value));
  const all = new Set([...firsts, ...lasts].map((r) => r.value as string));
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    for (const m of line.matchAll(DATE_PHRASE)) {
      const start = m.index ?? 0;
      const from = start + m[0].length;
      const rest = line.slice(from, from + 40);
      const cut = rest.search(/[.;!?](?:\s|$)/);
      const scope = cut >= 0 ? rest.slice(0, cut) : rest;
      const same = /^(first|earliest)$/i.test(m[1]!) ? firsts : lasts;
      for (const dm of scope.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)) {
        const date = dm[0];
        const [y, mo, d] = date.split("-").map(Number);
        if (!isoOf(y!, mo!, d!) || all.has(date) || sourcedText.includes(date)) continue;
        let nearest: FigureRow | null = null;
        for (const r of same) {
          const gap = dayCount(r.value as string, date);
          if (gap <= 7 && (!nearest || gap < dayCount(nearest.value as string, date))) nearest = r;
        }
        if (!nearest) continue;
        const excerpt = line.slice(start, from + (dm.index ?? 0) + date.length);
        out.push(message(excerpt, where, nearest, date));
      }
    }
  }
  return out;
}

async function check(turn: Turn, cwd: string, opts: AnswerOptions, deadline: number): Promise<string | null> {
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
  const rows = await computeAll(cwd, identities, [null, ...(stated ? [stated] : [])], deadline, opts.figures, zoneLabelForPrompt(prompt), true);
  if (rows === null) return null;
  const outputs = turn.outputs ?? [];
  const sourcedText = [prompt, ...outputs].join("\n");
  const sourced = new Set(numberSpans(sourcedText).map((n) => n.value));
  const outputCounts = new Set(outputs.map((o) => o.split("\n").filter((l) => l.trim()).length));
  const findings: string[] = [];
  const dir = await mkdtemp(join(tmpdir(), "workproof-answer-"));
  try {
    for (const [i, t] of texts.entries()) {
      const file = join(dir, `text-${i}.md`);
      await writeFile(file, t.text, "utf8");
      const doc = await readBack(file, rows);
      for (const hit of doc.hits) {
        const row = countFinding(hit, t.text, rows, sourced, outputCounts);
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
  const budget = opts.budgetMs ?? BUDGET_MS;
  const deadline = Date.now() + budget;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), budget);
  });
  try {
    return await Promise.race([check(turn, cwd, opts, deadline).catch(() => null), expired]);
  } finally {
    clearTimeout(timer);
  }
}
