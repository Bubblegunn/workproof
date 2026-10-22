import type { Report } from "./report.js";
import { checkReport } from "./verify.js";

/**
 * A tailoring draft built from fixed rules, with no model. The JD becomes rows; the facts
 * (a portfolio bank, a past resume, or a workproof report) become entries; a row is covered
 * only by fact text, Stack, Domain, a name, or a skills line, never because the JD asks for it.
 */

export interface JdRow {
  /** The row as the reader sees it in the Gaps and Coverage sections. */
  label: string;
  must: boolean;
  /** Listed terms. One term for a single row; several for an alternatives row. */
  terms: string[];
  mode: "single" | "alternatives";
  /** Wording the person cannot fix by rewording: must have, work authorisation, visa, clearance, degree, years. Listed in Gaps with a marker when no fact covers it. */
  hard?: boolean;
}

export interface Fact {
  tag: string;
  text: string;
  index: number;
}

export interface Entry {
  id: string;
  name: string;
  status: "complete" | "in-progress";
  domain: string;
  stack: string[];
  facts: Fact[];
  /** Reading order. The skills pseudo-entry sorts last. */
  order: number;
  /** "skills" entries cover rows but never produce bullets. */
  kind: "entry" | "skills";
  /** Source lines that name the entry and its dates, checked against the source text. */
  sourceLines: string[];
  /** The resume section the entry is printed under: projects for P entries and report repositories. */
  section: "Experience" | "Projects";
  /** Lines printed above the entry's bullets, copied from the source (the bank's ### heading and fields, or a resume's two header lines). */
  head: string[];
}

export type BulletsSource = { kind: "facts"; name: string; markdown: string } | { kind: "report"; report: Report };

export interface BulletsInput {
  jd: string;
  source: BulletsSource;
  /** The finished resume shape instead of the draft template. */
  resume?: boolean;
  /** Word cap of the finished resume (default 450); a resume over it is trimmed. Ignored for the draft template. */
  maxWords?: number;
}

export interface BulletsResult {
  markdown: string;
  gaps: string[];
  /** The words of `markdown`, counted as `wc -w` counts them. */
  words: number;
  /** One line saying what was dropped to meet the cap; empty when nothing was. */
  notice: string;
}

export const DEFAULT_MAX_WORDS = 450;

/** Words as `wc -w` counts them: runs of non-whitespace, so tags, table bars and headings count. */
export const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

const MAX_BULLETS = 8;
const BULLETS_PER_ENTRY = 2;
const CONTENT_STOP = new Set(["experience", "with", "using", "strong", "knowledge"]);

/** Plain synonyms. A key is a fragment of the row label; its values count as listed terms. */
const ROW_SYNONYMS: [string, string[]][] = [
  ["llm applications", ["LLM", "LangGraph", "RAG"]],
  ["computer vision", ["YOLO", "computer vision", "vision"]],
  ["queue based systems", ["SQS", "queue"]],
  ["event driven design", ["event-driven"]],
  ["churn or customer models", ["churn model"]],
  ["onnx or edge deployment", ["ONNX"]],
];

/** Alternative spellings of one term. */
const TERM_ALIASES: Record<string, string[]> = {
  chroma: ["ChromaDB"],
};

const normalise = (s: string): string => s.replace(/\*/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Whole-word match on the text as written. A hyphen and a space are the same separator, so
 * "event-driven" and "event driven" match each other, but a hyphen is part of a word, so "Java"
 * does not match "Java-Script". Terms of two characters or fewer (Go, R, C) are case-sensitive and
 * never touch a neighbouring symbol (R&D, C#, C++, e.g. ...).
 */
function hasTerm(term: string, text: string): boolean {
  const short = [...term].length <= 2;
  const plain = term.replace(/\*/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (plain === "") return false;
  const body = plain.split(" ").map(escapeRe).join("[ -]");
  const hay = text.replace(/\*/g, "").replace(/\s+/g, " ");
  const before = short ? "(?<![\\p{L}\\p{N}_#&+/.-])" : "(?<![\\p{L}\\p{N}_-])";
  const after = short ? "(?![\\p{L}\\p{N}_#&+/-]|\\.[\\p{L}\\p{N}])" : "(?![\\p{L}\\p{N}_-])";
  return new RegExp(`${before}${body}${after}`, short ? "u" : "iu").test(hay);
}

/** Quantity phrases such as "3+ years" or "5 yrs", which are not skills. */
const stripQuantity = (label: string): string => label.replace(/\b\d+\+?\s*(?:years?|yrs?)\b/gi, "").replace(/\s+/g, " ").trim();

const expansions = (term: string): string[] => [term, ...(TERM_ALIASES[normalise(term)] ?? [])];
const termIn = (term: string, texts: string[]): boolean => expansions(term).some((t) => texts.some((x) => hasTerm(t, x)));

/** Prose rows with no tool name: every content word (longer than three letters, minus the stop words) must appear. */
const contentWords = (label: string): string[] =>
  stripQuantity(label)
    .split(/[^\p{L}\p{N}+#]+/u)
    .filter((w) => [...w].length > 3 && !CONTENT_STOP.has(w.toLowerCase()));

function synonymsFor(label: string): string[] {
  const key = normalise(label);
  const out: string[] = [];
  for (const [fragment, terms] of ROW_SYNONYMS) if (key.includes(fragment)) out.push(...terms);
  return [...new Set(out)];
}

interface Coverage {
  covered: boolean;
  matched: string[];
  missing: string[];
}

/** Whether a row is covered by any of the texts, and which terms matched. Pure. */
export function coverage(row: JdRow, texts: string[]): Coverage {
  const synonyms = synonymsFor(row.label);
  const listedHit = row.terms.filter((t) => termIn(t, texts));
  const synHit = synonyms.filter((t) => termIn(t, texts));
  if (row.mode === "single") {
    const words = contentWords(row.label);
    const phrase = termIn(stripQuantity(row.label) || row.label, texts);
    const prose = words.length > 0 && words.every((w) => termIn(w, texts));
    if (phrase || prose) return { covered: true, matched: [row.label], missing: [] };
    if (synHit.length) return { covered: true, matched: [synHit[0]!], missing: [] };
    return { covered: false, matched: [], missing: [] };
  }
  // The listed terms that matched are the ones shown; a synonym stands in only when none did.
  const matched = listedHit.length > 0 ? listedHit : synHit.slice(0, 1);
  return {
    covered: matched.length > 0,
    matched,
    missing: row.terms.filter((t) => !listedHit.includes(t)),
  };
}

/** Splits a list of terms on commas, " or " and " and ". */
function splitTerms(text: string): string[] {
  return text
    .split(/,|\s+or\s+|\s+and\s+/i)
    .map((t) => t.trim().replace(/\.$/, "").trim())
    .filter((t) => t !== "");
}

function rowsFor(body: string, must: boolean): JdRow[] {
  const label = body.replace(/\s+/g, " ").trim();
  const suchAs = /\bsuch as\b/i.exec(label);
  if (suchAs) {
    return [{ label, must, terms: splitTerms(label.slice(suchAs.index + suchAs[0].length)), mode: "alternatives" }];
  }
  if (label.includes("/")) {
    return [{ label, must, terms: label.split("/").map((t) => t.trim()).filter((t) => t !== ""), mode: "alternatives" }];
  }
  const colon = label.indexOf(":");
  if (colon >= 0) {
    const tail = label.slice(colon + 1).replace(/\bor (similar|equivalent)\b/gi, "");
    return [{ label, must, terms: splitTerms(tail), mode: "alternatives" }];
  }
  if (/\s+or\s+/i.test(label)) {
    const terms = label.split(/,|\s+or\s+/i).map((t) => stripQuantity(t).replace(/\.$/, "").trim()).filter((t) => t !== "");
    return [{ label, must, terms, mode: "alternatives" }];
  }
  if (label.includes(",")) {
    return splitTerms(label).map((t) => ({ label: t, must, terms: [t], mode: "single" as const }));
  }
  return [{ label, must, terms: [label], mode: "single" }];
}

const HARD_REQUIREMENT = /\b(must have|work authori[sz]ation|right to work|citizenship|visa (?:sponsorship|status|required|requirements?)|security clearance|degree in|years of experience)\b/i;
const HARD_REQUIRED = /\brequired\b/i;
const HARD_FORCE = /\b(must|mandatory|essential)\b/i;
const isHard = (label: string): boolean => HARD_REQUIREMENT.test(label) || (HARD_REQUIRED.test(label) && HARD_FORCE.test(label));
const REQUIREMENT_WORDING = /\b(must|required|requires?|experience (?:with|in)|proficien\w*|knowledge of|familiar\w*|ability to|years? of|degree|certified)\b/i;
const OPTIONAL_WORDING = /\b(nice to have|preferred|bonus|a plus|desirable)\b/i;

/** The sentences and clauses of running prose that hold requirement wording, for a JD without bullets or required headings. */
function proseRows(lines: string[]): JdRow[] {
  const rows: JdRow[] = [];
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) continue;
    for (const sentence of line.split(/(?<=[.!?])\s+|;\s*/)) {
      for (const clause of sentence.split(/,\s*(?:and|but|while)\s+|\s+and\s+(?=(?:must|experience|proficien|knowledge|familiar|ability|a degree|\d+\+? years))/i)) {
        const text = clause.replace(/[.!?]+$/, "").trim();
        if (text !== "" && REQUIREMENT_WORDING.test(text)) rows.push(...rowsFor(text, !OPTIONAL_WORDING.test(text)));
      }
    }
  }
  return rows;
}

/** Flags rows built from hard-requirement wording; the label is the row text, so the wording is in it. */
const flagHard = (rows: JdRow[]): JdRow[] => rows.map((r) => (isHard(r.label) ? { ...r, hard: true } : r));

/**
 * The JD as rows. Lines under a heading containing "required" or "must" are must-have, lines
 * under "nice" are nice-to-have, other bullet lines are must-have, and plain lines under other
 * headings are ignored. A JD with none of those yields rows from the sentences and clauses that hold
 * requirement wording (must, required, experience with, years of, degree and similar).
 */
export function parseJd(text: string): { target: string; rows: JdRow[] } {
  const lines = text.split(/\r?\n/);
  const target = (lines.find((l) => l.trim() !== "") ?? "").replace(/^#+/, "").trim();
  const rows: JdRow[] = [];
  let section: "must" | "nice" | "other" = "other";
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") continue;
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      const h = heading[1] ?? "";
      section = /required|must/i.test(h) ? "must" : /nice/i.test(h) ? "nice" : "other";
      continue;
    }
    const bullet = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (bullet) {
      rows.push(...rowsFor(bullet[1] ?? "", section !== "nice"));
      continue;
    }
    if (section === "other") continue;
    rows.push(...rowsFor(line, section === "must"));
  }
  return { target, rows: flagHard(rows.length ? rows : proseRows(lines)) };
}

const BANK_HEAD = /^##\s+([A-Z]\d+)\s+(.+)$/;
const RESUME_HEAD = /^\*\*(.+?)\*\*\s*\|\s*(.+)$/;
const ROLE_LINE = /^\*(.+?)\*\s*\|\s*\*(.+?)\*$/;
const CAPS_SECTION = /^[A-Z][A-Z &/]+$/;
const SKILL_LINE = /^\*\*[^*]+:\*\*\s*\S/;
const SECTION_WORDS = new Set(["SUMMARY", "PROFILE", "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "SKILLS", "EDUCATION", "PROJECTS", "CERTIFICATIONS", "CONTACT"]);

/**
 * The resume name: the first all-capitals line that is not a heading or a blockquote. It is the name only when it
 * has at most four words and is not a section heading word; otherwise there is no name and the resume is titled "Resume".
 */
function nameLine(markdown: string): string | undefined {
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#") || line.startsWith(">")) continue;
    if (line !== line.toUpperCase() || !/\p{L}/u.test(line)) continue;
    const words = line.split(/\s+/).length;
    return words <= 4 && !SECTION_WORDS.has(line.replace(/:$/, "").trim()) ? line : undefined;
  }
  return undefined;
}

/**
 * Parses a portfolio bank (`## E01 Name`, `Status:`, `Stack:`, `- F1: text`) or a past resume
 * (`**Employer** | Place`, `*Title* | *Dates*`, `- text`, `**Label:** a, b`). Pure.
 */
export function parseFactsMarkdown(markdown: string): { entries: Entry[]; person?: string | undefined } {
  const entries: Entry[] = [];
  const skills: Fact[] = [];
  let current: Entry | null = null;
  let resumeCount = 0;
  const person = nameLine(markdown);
  const addEntry = (id: string, name: string, header: string, head: string[]): Entry => {
    // A repeated id (a second "## E01") takes the next free suffix, so its tags stay distinct: E01b, E01c.
    let unique = id;
    for (let k = 1; entries.some((e) => e.id === unique); k++) unique = `${id}${String.fromCharCode(97 + k)}`;
    const section = unique.startsWith("P") ? "Projects" : "Experience";
    const entry: Entry = { id: unique, name, status: "complete", domain: "", stack: [], facts: [], order: entries.length, kind: "entry", sourceLines: [header], section, head };
    entries.push(entry);
    return entry;
  };
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    const bank = BANK_HEAD.exec(line);
    if (bank) {
      const name = (bank[2] ?? "").trim();
      current = addEntry(bank[1] ?? "", name, line, [`### ${name}`]);
      continue;
    }
    if (line.startsWith("#")) {
      current = null;
      continue;
    }
    const resume = RESUME_HEAD.exec(line);
    if (resume) {
      resumeCount += 1;
      current = addEntry(`E${String(resumeCount).padStart(2, "0")}`, (resume[1] ?? "").trim(), line, [line]);
      continue;
    }
    if (CAPS_SECTION.test(line)) {
      current = null;
      continue;
    }
    if (SKILL_LINE.test(line)) {
      skills.push({ tag: `SK-F${skills.length + 1}`, text: line, index: skills.length });
      continue;
    }
    if (current === null) continue;
    const role = ROLE_LINE.exec(line);
    if (role) {
      current.sourceLines.push(line);
      current.head.push(line);
      continue;
    }
    if (/^Role:/.test(line)) {
      current.sourceLines.push(line);
      current.head.push(line);
      continue;
    }
    const status = /^Status:\s*(.+)$/.exec(line);
    if (status) {
      current.status = (status[1] ?? "").trim().toLowerCase() === "in-progress" ? "in-progress" : "complete";
      current.head.push(line);
      continue;
    }
    const domain = /^Domain:\s*(.+)$/.exec(line);
    if (domain) {
      current.domain = (domain[1] ?? "").trim();
      current.head.push(line);
      continue;
    }
    const stack = /^Stack:\s*(.+)$/.exec(line);
    if (stack) {
      current.stack = (stack[1] ?? "").split(",").map((s) => s.trim()).filter((s) => s !== "");
      current.head.push(line);
      continue;
    }
    const fact = /^-\s+(.+)$/.exec(line);
    if (fact) {
      const body = (fact[1] ?? "").trim();
      const coded = /^([A-Z]\d+):\s+(.+)$/.exec(body);
      const number = current.facts.length + 1;
      const id = coded ? `${current.id}-${coded[1]}` : `${current.id}-F${number}`;
      const text = coded ? (coded[2] ?? "").trim() : body;
      if (text === "TODO") continue;
      current.facts.push({ tag: id, text, index: current.facts.length });
    }
  }
  if (skills.length > 0) {
    entries.push({ id: "SK", name: "Skills", status: "complete", domain: "", stack: [], facts: skills, order: Number.MAX_SAFE_INTEGER, kind: "skills", sourceLines: [], section: "Experience", head: [] });
  }
  return { entries, person: resumeCount > 0 ? person : undefined };
}

const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;
const count = (x: number): string => x.toLocaleString("en-US");

/** Facts from a workproof report: one entry per figure, with fixed sentence templates. */
function entriesFromReport(report: Report): Entry[] {
  const tag8 = report.hash.slice(0, 8);
  const entries: Entry[] = [];
  const add = (figure: string, text: string, repoName: string) => {
    entries.push({ id: figure, name: figure, status: "complete", domain: "", stack: [], facts: [{ tag: `${figure} #${tag8}`, text, index: 0 }], order: entries.length, kind: "entry", sourceLines: [], section: "Projects", head: [`### ${repoName}`] });
  };
  const languages: string[] = [];
  for (const repo of report.repositories) {
    for (const f of repo.figures) {
      const v = f.value as Record<string, unknown>;
      if (f.id === "commitShare") {
        const x = v as { author: number; total: number; share: number };
        add(f.id, `Made ${count(x.author)} of the ${count(x.total)} non-merge commits in the tenure window (${pct(x.share)})`, repo.name);
      } else if (f.id === "survivingLines") {
        const x = v as { lines: number; linesAttributed: number; share: number };
        add(f.id, `Authored ${count(x.lines)} of the ${count(x.linesAttributed)} lines still in the project today (${pct(x.share)})`, repo.name);
      } else if (f.id === "filesAuthored") {
        const x = v as { authored: number; total: number; share: number };
        add(f.id, `Authored ${count(x.authored)} of the ${count(x.total)} files alive at HEAD (${pct(x.share)})`, repo.name);
      } else if (f.id === "testsAndDocs") {
        const x = v as { testChangesAuthor: number; testChangesTotal: number; testShare: number; docsCreated: number };
        add(f.id, `Authored ${count(x.testChangesAuthor)} of the ${count(x.testChangesTotal)} test-file changes (${pct(x.testShare)}) and created ${count(x.docsCreated)} documents`, repo.name);
      } else if (f.id === "cadence") {
        const x = v as { activeWeeks: number; weeksInTenure: number; commitsPerActiveWeek: number; longestStreakWeeks: number };
        add(f.id, `Active in ${x.activeWeeks} of ${x.weeksInTenure} weeks, ${x.commitsPerActiveWeek} commits per active week, longest streak ${x.longestStreakWeeks} weeks`, repo.name);
      } else if (f.id === "footprint") {
        for (const l of (v.languages as { language: string }[] | undefined) ?? []) languages.push(l.language);
      }
    }
  }
  if (languages.length > 0) {
    entries.push({ id: "SK", name: "Skills", status: "complete", domain: "", stack: [], facts: [{ tag: `footprint #${tag8}`, text: `Languages by lines added: ${languages.join(", ")}`, index: 0 }], order: Number.MAX_SAFE_INTEGER, kind: "skills", sourceLines: [], section: "Experience", head: [] });
  }
  return entries;
}

const NO_ENTRY = "No entry of the source covers a requirement. Every requirement is listed under Gaps.";

/** The resume sections in the order they are printed: a resume has Experience, then Projects. */
const PRINTED_SECTIONS: readonly Entry["section"][] = ["Experience", "Projects"];

/** The Ordering check over entries in the order they are printed: the first in-progress entry before a complete one. */
function printedOrder(entries: Entry[]): string {
  let inProgress: Entry | undefined;
  for (const e of entries) {
    if (e.status === "in-progress") inProgress ??= e;
    else if (inProgress) return `violated (${inProgress.name})`;
  }
  return "ok";
}

/**
 * The report-mode Summary line from the commit-share and surviving-lines figures of the first repository
 * that has both. With more than one repository the line names that repository first. Undefined when none has both.
 */
function reportSummary(report: Report): string | undefined {
  for (const repo of report.repositories) {
    const commitFigure = repo.figures.find((f) => f.id === "commitShare");
    const linesFigure = repo.figures.find((f) => f.id === "survivingLines");
    if (!commitFigure || !linesFigure) continue;
    const commit = commitFigure.value as { author: number; total: number; share: number };
    const lines = linesFigure.value as { lines: number; linesAttributed: number; share: number };
    const tag8 = report.hash.slice(0, 8);
    const body = `Made ${count(commit.author)} of the ${count(commit.total)} non-merge commits in the tenure window (${pct(commit.share)}) and authored ${count(lines.lines)} of the ${count(lines.linesAttributed)} lines still in the project today (${pct(lines.share)}). [commitShare #${tag8}, survivingLines #${tag8}]`;
    return report.repositories.length > 1 ? `In ${repo.name}: ${body}` : body;
  }
  return undefined;
}

const firstWords = (text: string, n: number): string => text.replace(/\*/g, "").split(/\s+/).slice(0, n).join(" ").replace(/\|/g, "\\|");
const cell = (s: string): string => s.replace(/\|/g, "\\|");

/**
 * Builds the tailoring draft. Throws when a report source fails checkReport.
 * Deterministic: the same input gives the same bytes.
 */
export function buildBullets(input: BulletsInput): BulletsResult {
  const { target, rows } = parseJd(input.jd);
  let entries: Entry[];
  let sourceLine: string;
  let person: string | undefined;
  let markdownSource = "";
  if (input.source.kind === "report") {
    const integrity = checkReport(input.source.report);
    if (!integrity.ok) throw new Error(`the report fails its check: ${integrity.problems.join("; ")}`);
    entries = entriesFromReport(input.source.report);
    sourceLine = `workproof report ${input.source.report.hash.slice(0, 8)}`;
  } else {
    const parsed = parseFactsMarkdown(input.source.markdown);
    entries = parsed.entries;
    person = parsed.person;
    sourceLine = input.source.name.split(/[\\/]/).pop() ?? input.source.name;
    markdownSource = input.source.markdown;
  }

  const scoring = entries.filter((e) => e.kind === "entry" && e.facts.length > 0);
  const skillEntries = entries.filter((e) => e.kind === "skills");
  const textsOf = (e: Entry): string[] => [e.name, e.domain, ...e.stack, ...e.facts.map((f) => f.text)].filter((t) => t !== "");
  const allTexts = [...scoring, ...skillEntries].flatMap(textsOf);

  // Ranking: complete before in-progress, then must-have rows covered (descending), then reading order.
  const mustCovered = new Map<Entry, number>(
    scoring.map((e) => [e, rows.filter((r) => r.must && coverage(r, textsOf(e)).covered).length]),
  );
  const ranked = [...scoring].sort((a, b) => {
    const ga = a.status === "in-progress" ? 1 : 0;
    const gb = b.status === "in-progress" ? 1 : 0;
    return ga - gb || (mustCovered.get(b) ?? 0) - (mustCovered.get(a) ?? 0) || a.order - b.order;
  });

  // Attribution: each row goes to the first covering entry in ranked order (skills last), and
  // within it to the first fact that covers it, or the entry's first fact when only the
  // Stack, Domain or name covers it.
  const factCount = new Map<string, number>();
  const tagOf = new Map<number, string | undefined>();
  rows.forEach((row, ri) => {
    for (const e of [...ranked, ...skillEntries]) {
      if (!coverage(row, textsOf(e)).covered) continue;
      const fact = e.facts.find((f) => coverage(row, [f.text]).covered) ?? e.facts[0];
      if (!fact) continue;
      factCount.set(fact.tag, (factCount.get(fact.tag) ?? 0) + 1);
      tagOf.set(ri, fact.tag);
      return;
    }
  });

  // Bullets: the top two facts of each ranked entry by covered rows, then by reading order.
  const bullets: { entry: Entry; fact: Fact }[] = [];
  for (const e of ranked) {
    const sorted = [...e.facts].sort((a, b) => (factCount.get(b.tag) ?? 0) - (factCount.get(a.tag) ?? 0) || a.index - b.index);
    for (const f of sorted.slice(0, BULLETS_PER_ENTRY)) bullets.push({ entry: e, fact: f });
  }
  const shown = bullets.slice(0, MAX_BULLETS);

  // The Summary's one fixed line: report figures, or the first ranked entry's name (no digit).
  const summaryLine =
    input.source.kind === "report"
      ? (reportSummary(input.source.report) ?? NO_ENTRY)
      : ranked.length > 0
        ? `Ranked first: ${ranked[0]!.name}. Requirements that no fact covers are listed under Gaps.`
        : NO_ENTRY;

  // Skills, gaps and the coverage table, from the whole fact set.
  const skills: string[] = [];
  const gaps: string[] = [];
  const coverageRows: string[] = [];
  const coverageCovered: boolean[] = [];
  if (rows.length === 0) coverageRows.push("| (no requirements found) | - | - | none |");
  rows.forEach((row, ri) => {
    const c = coverage(row, allTexts);
    for (const m of c.matched) if (!skills.includes(m)) skills.push(m);
    if (!c.covered) {
      gaps.push(`${row.label}: not in your facts${row.hard ? " (hard requirement)" : ""}`);
    } else if (row.mode === "alternatives" && c.missing.length > 0) {
      gaps.push(`${c.missing.join(", ")}: not in your facts; ${c.matched.join(", ")} ${c.matched.length === 1 ? "is" : "are"} covered`);
    }
    const tag = tagOf.get(ri);
    coverageRows.push(`| ${cell(row.label)} | ${row.must ? "yes" : "no"} | ${c.covered ? "yes" : "no"} | ${tag ?? "none"} |`);
    coverageCovered.push(c.covered);
  });

  // Ordering check over the entries that produce bullets, in emitted order.
  let order = "ok";
  let sawInProgress: Entry | undefined;
  for (const b of shown) {
    if (b.entry.status === "in-progress") sawInProgress ??= b.entry;
    else if (sawInProgress) {
      order = `violated (${b.entry.name})`;
      break;
    }
  }
  const unchanged = scoring.every((e) => e.sourceLines.every((l) => markdownSource.includes(l)));

  if (input.resume) {
    // The finished shape: Experience, then Projects, each with its bullets grouped under the entry heading in ranked order.
    // The Ordering check walks the entries in this printed order, not in ranked order.
    const render = (kept: typeof shown, coverage: string[]): string => {
      const body: string[] = [];
      const printed: Entry[] = [];
      for (const name of PRINTED_SECTIONS) {
        const groups = new Map<string, { head: string[]; lines: string[]; entries: Entry[] }>();
        for (const b of kept) {
          if (b.entry.section !== name) continue;
          const key = b.entry.head.join("\n");
          const group = groups.get(key) ?? { head: b.entry.head, lines: [], entries: [] };
          groups.set(key, group);
          group.lines.push(`- ${b.fact.text} [${b.fact.tag}]`);
          group.entries.push(b.entry);
        }
        if (groups.size === 0) continue;
        body.push(`## ${name}`);
        for (const g of groups.values()) {
          body.push(...g.head, ...g.lines, "");
          printed.push(...g.entries);
        }
      }
      const resumeOrder = printedOrder(printed);
      return [
        `# ${person ?? "Resume"}`,
        `Target role: ${target}`,
        "",
        "## Summary",
        summaryLine,
        "",
        "## Skills",
        skills.length ? skills.join(", ") : "(none supported by the facts)",
        "",
        ...body,
        "## Gaps",
        ...(gaps.length ? gaps.map((g) => `- ${g}`) : ["None."]),
        "",
        "## Keyword coverage",
        "| JD item | Must-have? | Covered | Source tag |",
        "|---|---|---|---|",
        ...coverage,
        "",
        "## Ordering check",
        `Complete before in-progress: ${resumeOrder}`,
        `Entries and dates unchanged from the source: ${unchanged ? "ok" : "changed"}`,
        "",
      ].join("\n");
    };
    // Over the cap: drop coverage rows of covered items from the end first (the Gaps section keeps the uncovered ones),
    // then the lowest-ranked bullets, until the file fits or one bullet is left.
    const max = input.maxWords ?? DEFAULT_MAX_WORDS;
    let kept = shown;
    let cov = coverageRows.map((row, i) => ({ row, covered: coverageCovered[i] ?? false }));
    let markdown = render(kept, cov.map((c) => c.row));
    let droppedBullets = 0;
    let droppedRows = 0;
    while (countWords(markdown) > max) {
      const at = cov.map((c) => c.covered).lastIndexOf(true);
      if (at >= 0) {
        cov = cov.filter((_, i) => i !== at);
        droppedRows += 1;
      } else if (kept.length > 1) {
        kept = kept.slice(0, -1);
        droppedBullets += 1;
      } else break;
      markdown = render(kept, cov.map((c) => c.row));
    }
    const words = countWords(markdown);
    const notice =
      droppedBullets + droppedRows > 0
        ? `Trimmed to fit ${max} words: dropped ${droppedBullets} lowest-ranked ${droppedBullets === 1 ? "bullet" : "bullets"} and ${droppedRows} coverage ${droppedRows === 1 ? "row" : "rows"} of covered items${words > max ? `; still ${words} words` : ""}.`
        : "";
    return { markdown, gaps, words, notice };
  }

  const bulletLines = shown.map((b, i) => `${i + 1}. ${b.fact.text} [${b.fact.tag}]`);
  const factRows = entries.flatMap((e) => e.facts).map((f) => `| ${f.tag} | ${firstWords(f.text, 6)} |`);

  const out: string[] = [
    "# Tailoring draft",
    `Target: ${target}`,
    ...(rows.length === 0 ? ["Note: the job description has no requirement lines, so there is nothing to match."] : []),
    `Source: ${sourceLine}`,
    "",
    "## Summary",
    summaryLine,
    "",
    "## Ranked bullets",
    ...(bulletLines.length ? bulletLines : ["None."]),
    "",
    "## Skills supported by the facts",
    `- ${skills.length ? skills.join(", ") : "None."}`,
    "",
    "## Gaps",
    ...(gaps.length ? gaps.map((g) => `- ${g}`) : ["None."]),
    "",
    "## Coverage",
    "| JD item | Must-have? | Covered | Source tag |",
    "|---|---|---|---|",
    ...coverageRows,
    "",
    "## Ordering check",
    `Complete before in-progress: ${order}`,
    `Entries and dates unchanged from the source: ${unchanged ? "ok" : "changed"}`,
    "",
    "## Fact table",
    "| Tag | Fact (first six words) |",
    "|---|---|",
    ...factRows,
    "",
    "## Checklist before you finish",
    "- [ ] Summary: keep the first line above and add at most one more sentence made only of the facts above",
    "- [ ] Ranked bullets: every fact verbatim with its source tag, in this order",
    "- [ ] Gaps: present, and every line named in your answer to the person",
    "- [ ] Ordering: complete before in-progress, entries and dates unchanged from the source",
    "",
  ];
  const markdown = out.join("\n");
  return { markdown, gaps, words: countWords(markdown), notice: "" };
}
