import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { git, wallClock } from "./git.js";
import { windowBound } from "./figures.js";
import { parseZone, zoneLabel, dayIn } from "./figures/zone.js";
import type { Zone } from "./figures/zone.js";
import type { Bound } from "./figures.js";

/**
 * `workproof reviews`: for each in-scope commit, whether a second person's review is recorded in
 * its message. Read-only. Everything printed from a commit (names, addresses, subjects, paths) is
 * data: control and format characters are removed and any address is replaced by "(address)"
 * before it reaches the output.
 */

const US = "\x1f";
const GS = "\x1d";
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]|\p{Cf}/gu;
const ADDRESS = /[^\s<>]+@[^\s<>]+/g;
const NAME_MAX = 80;
const SUBJECT_MAX = 200;
const DEFAULT_REVIEW_TRAILERS = ["Reviewed-by"];
const OTHER_APPROVAL = ["Acked-by", "Approved-by", "Tested-by"];
const SINGLE_VALUE_OPTIONS = new Set(["--repo", "--since", "--until", "--tz", "--format", "--out"]);

export const CONVENTION_WINDOW_TEXT = "Convention: author date, UTC date";
/** The convention sentence for a zone: UTC by default, the named zone with --tz, each commit's own offset with --tz commit. */
export const conventionWindowText = (zone: Zone): string => (zone.kind === "utc" ? CONVENTION_WINDOW_TEXT : zone.kind === "commit" ? "Convention: author date, local date in the commit's own offset" : `Convention: author date, date in ${zoneLabel(zone)}`);
export const CONVENTION_FIXED = [
  "Reverts are in scope like any commit.",
  "Review applied to a merge covers the commits merged by it and is labelled weaker.",
  "A Reviewed-by trailer is a claim recorded in the commit message, not proof that a review took place; cross-check it with the code host's approvals.",
];

export type Status = "independent review" | "self-review" | "reviewed via merge (weaker)" | "quoted in message, not a trailer" | "other approval only" | "no review trailer";

export interface ReviewsOptions {
  repo: string;
  paths: string[];
  since?: string;
  until?: string;
  trailers: string[];
  format: "text" | "csv" | "json";
  out?: string;
  /** `--tz`: the zone date-only bounds and the printed dates are read in. UTC when absent. */
  tz?: string;
}

/**
 * Removes control and format characters, replaces each address with "(address)", then keeps at
 * most `max` characters (code points). Every printed field goes through this.
 */
export function clean(s: string, max = Infinity): string {
  return Array.from(s.replace(CONTROL, "").replace(ADDRESS, "(address)")).slice(0, max).join("");
}

export function parseReviewsArgs(args: string[]): ReviewsOptions {
  const opts: ReviewsOptions = { repo: process.cwd(), paths: [], trailers: [], format: "text" };
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (SINGLE_VALUE_OPTIONS.has(a)) {
      if (seen.has(a)) throw new Error(`${a} was given more than once; give it once`);
      seen.add(a);
    }
    const value = (): string => {
      const v = args[++i];
      if (v === undefined || v === "") throw new Error(`${a} needs a value`);
      if (v.startsWith("-") && !(a === "--tz" && /^-\d/.test(v))) throw new Error(`${a} needs a value, and "${clean(v, 40)}" looks like another option`);
      return v;
    };
    if (a === "--repo") opts.repo = resolve(value());
    else if (a === "--path") opts.paths.push(value());
    else if (a === "--since") opts.since = value();
    else if (a === "--until") opts.until = value();
    else if (a === "--tz") opts.tz = value();
    else if (a === "--trailer") {
      const key = value();
      if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(key)) throw new Error(`--trailer takes a trailer key such as Reviewed-by, not "${clean(key, 40)}"`);
      opts.trailers.push(key);
    } else if (a === "--format") {
      const f = value();
      if (f !== "text" && f !== "csv" && f !== "json") throw new Error("--format must be text, csv or json");
      opts.format = f;
    } else if (a === "--out") opts.out = resolve(value());
    else throw new Error(`unknown option ${clean(a, 40)}`);
  }
  if (!opts.trailers.length) opts.trailers = [...DEFAULT_REVIEW_TRAILERS];
  return opts;
}

interface Person { name: string; email: string }
interface Ids { rawName: string; rawEmail: string; name: string; email: string }
interface Trailer extends Person { key: string; review: boolean }
interface Rec {
  sha: string;
  author: Ids;
  parents: string[];
  authorDate: Date;
  authorLocal: Date;
  committerDate: Date;
  committerLocal: Date;
  subject: string;
  body: string;
  /** Review-key trailers git parsed, including empty ones that are then dropped. */
  reviewParsed: number;
  trailers: Trailer[];
}

export interface ReviewRow {
  sha: string;
  localDate: string;
  author: string;
  reviewer: string;
  status: Status;
  satisfies: "yes" | "yes (weaker)" | "no";
  basis: string;
  subject: string;
  authorName: string;
  rawAuthorName: string;
  committerDate: string;
}

export interface OutGroup { reason: string; count: number; shas: string[] }

export interface ReviewsReport {
  window: string;
  paths: string;
  convention: string[];
  summary: string;
  rows: ReviewRow[];
  outOfScope: OutGroup[];
}

export type ReviewsOutcome = { computed: true; report: ReviewsReport } | { computed: false; reason: string };

const lower = (s: string) => s.toLowerCase();

function parsePerson(value: string): Person {
  const m = /^(.*?)\s*<([^<>]*)>/.exec(value);
  if (m) return { name: m[1]!.trim(), email: m[2]!.trim().toLowerCase() };
  const bare = value.trim();
  return bare.includes("@") ? { name: "", email: lower(bare) } : { name: bare, email: "" };
}

/** Output shows names only, capped; an address never appears. */
const displayPerson = (p: Person): string => clean(p.name, NAME_MAX) || "(no name recorded)";

/** Folds a display name for comparison: no accents, no case, single spaces. */
const foldName = (s: string): string => s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

const dayOf = (d: Date): string => (Number.isNaN(d.getTime()) ? "invalid date" : d.toISOString().slice(0, 10));

/** A commit is inside a window by its author instant, or by its author's calendar date for date-only bounds. */
function inBound(instant: Date, local: Date, since: Bound | undefined, until: Bound | undefined): boolean {
  if (Number.isNaN(instant.getTime())) return false;
  if (since && (since.day ? dayOf(local) < since.day : instant < since.at!)) return false;
  if (until && (until.day ? dayOf(local) > until.day : until.exclusive ? instant >= until.at! : instant > until.at!)) return false;
  return true;
}

/**
 * Why a reviewer is the author, or undefined when they are a different person. Rules in order:
 * the same address, a .mailmap alias (the reviewer address resolves to the author's address), the
 * same folded name. A shared local part alone is not a match: john@a.example and john@b.example
 * are different addresses.
 */
function selfRule(author: Ids, reviewer: Person, canonicalEmail: string): string | undefined {
  const re = reviewer.email;
  if (re && (re === author.rawEmail || re === author.email)) return "same address";
  if (re && canonicalEmail && (canonicalEmail === author.email || canonicalEmail === author.rawEmail)) return "mailmap alias";
  const fn = foldName(reviewer.name);
  if (fn && (fn === foldName(author.rawName) || fn === foldName(author.name))) return "same name";
  return undefined;
}

function formatFor(keys: string[]): string {
  return ["%H", "%aN", "%aE", "%an", "%ae", "%aI", "%cI", "%P", "%s", ...keys.map((k) => `%(trailers:key=${k},separator=%x1d)`), "%B"].join("%x1f");
}

/** Parses `git log -z` output produced with formatFor(keys). Trailers are filtered by key here too, case-insensitively. */
function parseRecords(out: string, keys: string[], reviewKeys: Set<string>): Rec[] {
  const recs: Rec[] = [];
  for (const block of out.split("\0")) {
    const text = block.replace(/^\n+/, "");
    if (!text.trim()) continue;
    const f = text.split(US);
    const [sha, mName, mEmail, rName, rEmail, aIso, cIso, parents, subject] = f;
    if (!sha || !/^[0-9a-f]{40,64}$/.test(sha.trim()) || aIso === undefined || cIso === undefined) throw new Error("git log returned a record this command cannot read");
    const trailers: Trailer[] = [];
    let reviewParsed = 0;
    keys.forEach((queried, j) => {
      for (const item of (f[9 + j] ?? "").split(GS)) {
        const idx = item.indexOf(":");
        if (idx < 0) continue;
        const key = item.slice(0, idx).trim();
        if (lower(key) !== lower(queried)) continue;
        const review = reviewKeys.has(lower(queried));
        if (review) reviewParsed++;
        const person = parsePerson(item.slice(idx + 1));
        // A trailer that names nobody ("Reviewed-by:", "Reviewed-by: <>") is not a reviewer.
        if (!person.name && !person.email) continue;
        trailers.push({ key, review, ...person });
      }
    });
    recs.push({
      sha: sha.trim(),
      author: { rawName: rName ?? "", rawEmail: lower(rEmail ?? ""), name: mName ?? "", email: lower(mEmail ?? "") },
      parents: (parents ?? "").trim().split(" ").filter(Boolean),
      authorDate: new Date(aIso),
      authorLocal: wallClock(aIso),
      committerDate: new Date(cIso),
      committerLocal: wallClock(cIso),
      subject: subject ?? "",
      body: f.slice(9 + keys.length).join(US),
      reviewParsed,
      trailers,
    });
  }
  return recs;
}

/** Canonical address per address, through .mailmap, in one git call. */
async function canonicalMap(cwd: string, emails: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(emails.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const input = unique.map((e) => `<${e.replace(/[<>\r\n]/g, "")}>`).join("\n") + "\n";
  const lines = (await git(["check-mailmap", "--stdin"], cwd, input)).split("\n").filter((l) => l.length > 0);
  if (lines.length !== unique.length) throw new Error("git check-mailmap returned an unexpected number of lines");
  unique.forEach((e, i) => map.set(e, lower(/<([^<>]*)>\s*$/.exec(lines[i]!)?.[1] ?? e).trim()));
  return map;
}

/** Every commit reachable from HEAD with its parents, in one git call. */
async function parentGraph(cwd: string): Promise<Map<string, string[]>> {
  const graph = new Map<string, string[]>();
  for (const line of (await git(["rev-list", "--parents", "HEAD"], cwd)).split("\n")) {
    const [sha, ...parents] = line.trim().split(" ").filter(Boolean);
    if (sha) graph.set(sha, parents);
  }
  return graph;
}

/** Commits reachable from start, not entering a commit in stop (stop is closed under ancestry, so this is exact). */
function reach(start: string, graph: Map<string, string[]>, stop: Set<string> = new Set()): Set<string> {
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(c) || stop.has(c)) continue;
    seen.add(c);
    for (const p of graph.get(c) ?? []) stack.push(p);
  }
  return seen;
}

/** The union of `M^1..M^k` for every parent k after the first: reachable from each such parent, not from the first. */
function secondParentRanges(parents: string[], graph: Map<string, string[]>): Set<string> {
  const [first, ...rest] = parents;
  const fromFirst = reach(first!, graph);
  const covered = new Set<string>();
  for (const p of rest) for (const sha of reach(p, graph, fromFirst)) covered.add(sha);
  return covered;
}

interface Cover { merge: string; reviewers: Trailer[] }

function classify(r: Rec, cover: Map<string, Cover[]>, canonOf: (e: string) => string, zone: Zone): ReviewRow {
  const rule = (t: Trailer) => selfRule(r.author, t, canonOf(t.email));
  const reviews = r.trailers.filter((t) => t.review);
  const others = r.trailers.filter((t) => !t.review);
  // Names only; a reviewer who is the author shows the author's name; folded duplicates are removed.
  const names = (ts: Trailer[]) => {
    const seen = new Set<string>();
    const shown: string[] = [];
    for (const t of ts) {
      const n = rule(t) ? displayPerson({ name: r.author.name, email: "" }) : displayPerson(t);
      if (!seen.has(foldName(n))) {
        seen.add(foldName(n));
        shown.push(n);
      }
    }
    return shown.join("; ");
  };
  let status: Status;
  let reviewer = "";
  let basis: string;
  let satisfies: ReviewRow["satisfies"] = "no";
  const independent = reviews.filter((t) => !rule(t));
  const self = reviews.filter((t) => rule(t));
  const covers = cover.get(r.sha) ?? [];
  if (independent.length) {
    status = "independent review";
    reviewer = names(reviews);
    basis = "reviewer is not the author";
    satisfies = "yes";
  } else if (self.length) {
    status = "self-review";
    reviewer = names(reviews);
    basis = [...new Set(self.map((t) => `same person: ${rule(t)}`))].join("; ");
  } else if (covers.length) {
    // A merge's reviewer who is this commit's author does not review it.
    const coverage = covers.map((c) => ({ merge: c.merge, reviewers: c.reviewers.filter((t) => !rule(t)) })).filter((c) => c.reviewers.length > 0);
    if (coverage.length) {
      status = "reviewed via merge (weaker)";
      reviewer = names(coverage[0]!.reviewers);
      basis = `in the second-parent range of merge ${coverage[0]!.merge}`;
      satisfies = "yes (weaker)";
    } else {
      status = "self-review";
      reviewer = displayPerson({ name: r.author.name, email: "" });
      basis = `only the author is named on the merge (merge ${covers[0]!.merge})`;
    }
  } else if (/reviewed-by:/i.test(r.body) && r.reviewParsed === 0) {
    status = "quoted in message, not a trailer";
    basis = "the text Reviewed-by: is in the message, but git did not parse it as a trailer";
  } else {
    const approvals = others.filter((t) => !rule(t));
    if (approvals.length) {
      status = "other approval only";
      reviewer = approvals.map((t) => `${t.key}: ${displayPerson(t)}`).join("; ");
      basis = approvals.map((t) => `${t.key} trailer`).join("; ");
    } else {
      status = "no review trailer";
      basis = "no review trailer";
    }
  }
  const revertTarget = /This reverts commit ([0-9a-f]{7,40})/i.exec(r.body)?.[1];
  const isRevert = /^Revert\b/.test(r.subject) || revertTarget !== undefined;
  const note = isRevert ? (revertTarget ? `revert of ${revertTarget.slice(0, 7)}` : "revert (target not named in the message)") : "";
  const raw = r.author;
  const recorded = clean(raw.rawName, NAME_MAX) !== clean(raw.name, NAME_MAX);
  return {
    sha: r.sha,
    localDate: zone.kind === "commit" ? dayOf(r.authorLocal) : dayIn(r.authorDate, zone),
    author: displayPerson({ name: raw.name, email: "" }) + (recorded ? ` (as recorded: ${displayPerson({ name: raw.rawName, email: "" })})` : ""),
    reviewer: clean(reviewer),
    status,
    satisfies,
    basis: clean([basis, note].filter(Boolean).join("; ")),
    subject: clean(r.subject, SUBJECT_MAX),
    authorName: clean(raw.name, NAME_MAX),
    rawAuthorName: clean(raw.rawName, NAME_MAX),
    committerDate: r.committerDate.toISOString(),
  };
}

const SAMPLE = 10;

export function scopeText(opts: Pick<ReviewsOptions, "since" | "until" | "paths">): { window: string; paths: string } {
  const since = opts.since ? clean(opts.since, 40) : "start of history";
  const until = opts.until ? clean(opts.until, 40) : "now";
  return {
    window: `${since} to ${until}`,
    paths: opts.paths.length ? opts.paths.map((p) => clean(p, 200)).join(", ") : "whole repository",
  };
}

/** Reads git and classifies every commit. Never throws: a git failure comes back as computed:false. */
export async function computeReviews(opts: ReviewsOptions, since?: Bound, until?: Bound): Promise<ReviewsOutcome> {
  const cwd = opts.repo;
  const keys: string[] = [];
  for (const k of [...opts.trailers, ...OTHER_APPROVAL]) if (!keys.some((x) => lower(x) === lower(k))) keys.push(k);
  const reviewKeys = new Set(opts.trailers.map(lower));
  const fmt = formatFor(keys);
  const pathArgs = opts.paths.length ? ["--", ...opts.paths] : [];
  try {
    const path = parseRecords(await git(["log", "--no-merges", "-z", "--use-mailmap", `--format=${fmt}`, "HEAD", ...pathArgs], cwd), keys, reviewKeys);
    const pathShas = new Set(path.map((r) => r.sha));
    const allNonMerge = opts.paths.length ? (await git(["log", "--no-merges", "--format=%H", "HEAD"], cwd)).split("\n").map((s) => s.trim()).filter(Boolean) : [];
    const merges = parseRecords(await git(["log", "--merges", "--reverse", "-z", "--use-mailmap", `--format=${fmt}`, "HEAD"], cwd), keys, reviewKeys);
    const canon = await canonicalMap(cwd, [...path, ...merges].flatMap((r) => r.trailers.map((t) => t.email)));
    const canonOf = (e: string) => canon.get(e) ?? e;

    // A merge's Reviewed-by from someone other than the merge's author covers every commit on the
    // merge's non-first parents' side (M^1..M^k for each k), except for the author's own commits.
    const cover = new Map<string, Cover[]>();
    let graph: Map<string, string[]> | undefined;
    for (const m of merges) {
      const reviewers = m.trailers.filter((t) => t.review && !selfRule(m.author, t, canonOf(t.email)));
      if (!reviewers.length || m.parents.length < 2) continue;
      graph ??= await parentGraph(cwd);
      for (const sha of secondParentRanges(m.parents, graph)) {
        const list = cover.get(sha) ?? [];
        list.push({ merge: m.sha.slice(0, 7), reviewers });
        cover.set(sha, list);
      }
    }

    const inScope = path.filter((r) => inBound(r.authorDate, r.authorLocal, since, until));
    const rows = inScope.map((r) => classify(r, cover, canonOf, parseZone(opts.tz)));
    const outside = path.filter((r) => !inBound(r.authorDate, r.authorLocal, since, until));
    const committedInside = (r: Rec) => inBound(r.committerDate, r.committerLocal, since, until);
    const group = (reason: string, shas: string[]): OutGroup => ({ reason, count: shas.length, shas: shas.slice(0, SAMPLE) });
    const outOfScope: OutGroup[] = [
      group("merge commits, counted only (their reviews apply to the commits they merged)", []),
      group("authored outside the window, committed inside it", outside.filter(committedInside).map((r) => r.sha)),
      group("authored outside the window", outside.filter((r) => !committedInside(r)).map((r) => r.sha)),
      group("do not touch the paths", allNonMerge.filter((s) => !pathShas.has(s))),
    ];
    outOfScope[0]!.count = merges.length;
    const counts = { independent: 0, merge: 0, self: 0, none: 0, quoted: 0, other: 0 };
    for (const row of rows) {
      if (row.status === "independent review") counts.independent++;
      else if (row.status === "reviewed via merge (weaker)") counts.merge++;
      else if (row.status === "self-review") counts.self++;
      else if (row.status === "quoted in message, not a trailer") counts.quoted++;
      else if (row.status === "other approval only") counts.other++;
      else counts.none++;
    }
    const notSatisfied = rows.length - counts.independent - counts.merge;
    const summary = `${rows.length} in scope: ${counts.independent} independent, ${counts.merge} via merge (weaker), ${notSatisfied} do not satisfy (self-review ${counts.self}, no trailer ${counts.none}, quoted ${counts.quoted}, other approval ${counts.other})`;
    const text = scopeText(opts);
    return {
      computed: true,
      report: {
        ...text,
        convention: [`${conventionWindowText(parseZone(opts.tz))}; window ${text.window}; paths ${text.paths}.`, ...CONVENTION_FIXED],
        summary,
        rows,
        outOfScope,
      },
    };
  } catch (err) {
    return { computed: false, reason: reasonOf(err) };
  }
}

function reasonOf(err: unknown): string {
  const e = err as { stderr?: unknown; message?: unknown };
  const raw = typeof e.stderr === "string" && e.stderr.trim() ? e.stderr : typeof e.message === "string" ? e.message : String(err);
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  return clean(lines.find((l) => /^(fatal|error):/.test(l)) ?? lines[0] ?? "git failed", 200);
}

/** A cell that spreadsheets would evaluate gets a leading single quote; then RFC 4180 quoting. */
export function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

export function renderReviews(outcome: ReviewsOutcome, format: ReviewsOptions["format"]): string {
  if (!outcome.computed) {
    return format === "json" ? `${JSON.stringify({ computed: false, reason: outcome.reason })}\n` : `not computed (${outcome.reason})\n`;
  }
  const r = outcome.report;
  if (format === "json") {
    const rows = r.rows.map((row) => ({
      sha: row.sha,
      author: row.author,
      author_date: row.localDate,
      reviewer: row.reviewer,
      status: row.status,
      satisfies: row.satisfies,
      basis: row.basis,
      subject: row.subject,
      author_name: row.authorName,
      raw_author_name: row.rawAuthorName,
      committer_date: row.committerDate,
    }));
    return `${JSON.stringify({ computed: true, window: r.window, paths: r.paths, convention: r.convention, summary: r.summary, rows, outOfScope: r.outOfScope }, null, 2)}\n`;
  }
  if (format === "csv") {
    const header = ["sha", "author", "author_date", "reviewer", "status", "satisfies", "basis", "subject"];
    const lines = [header.join(",")];
    for (const row of r.rows) lines.push([row.sha, row.author, row.localDate, row.reviewer, row.status, row.satisfies, row.basis, row.subject].map(csvCell).join(","));
    return `${lines.join("\n")}\n`;
  }
  const out: string[] = [...r.convention, r.summary, ""];
  out.push("sha7 | author date | author | reviewer(s) | status | basis/notes | subject");
  for (const row of r.rows) {
    out.push([row.sha.slice(0, 7), row.localDate, row.author, row.reviewer || "-", row.status, row.basis, clean(row.subject, 60)].join(" | "));
  }
  out.push("");
  const total = r.outOfScope.reduce((n, g) => n + g.count, 0);
  out.push(`Out of scope: ${total}`);
  for (const g of r.outOfScope) {
    if (!g.count) continue;
    const more = g.count > g.shas.length ? `, and ${g.count - g.shas.length} more` : "";
    out.push(`- ${g.count} ${g.reason}${g.shas.length ? `: ${g.shas.map((s) => s.slice(0, 7)).join(", ")}${more}` : ""}`);
  }
  return `${out.join("\n")}\n`;
}

/**
 * `workproof reviews`: 0 when it ran, 1 for a usage error, 2 when nothing could be computed
 * (not a repository, a git failure). A not-computed run never prints a zero.
 */
export async function runReviews(args: string[], out: { write(s: string): unknown } = process.stdout): Promise<number> {
  const usage = "usage: workproof reviews [--repo <dir>] [--path <pathspec>]... [--since <date>] [--until <date>] [--tz <zone>] [--trailer <Key>]... [--format text|csv|json] [--out <file>]";
  let opts: ReviewsOptions;
  let since: Bound | undefined;
  let until: Bound | undefined;
  try {
    opts = parseReviewsArgs(args);
    const zone = parseZone(opts.tz);
    since = await windowBound(opts.since, "since", opts.repo, zone);
    until = await windowBound(opts.until, "until", opts.repo, zone);
    if (opts.out && existsSync(opts.out)) throw new Error(`${clean(opts.out, 200)} already exists; reviews does not overwrite a file`);
  } catch (err) {
    console.error(`${err instanceof Error ? err.message : String(err)}\n${usage}`);
    return 1;
  }
  const outcome = await computeReviews(opts, since, until);
  const code = outcome.computed ? 0 : 2;
  const text = renderReviews(outcome, opts.format);
  if (!opts.out) {
    out.write(text);
    return code;
  }
  try {
    await writeFile(opts.out, text, { flag: "wx" });
  } catch (err) {
    console.error(`could not write ${clean(opts.out, 200)}: ${err instanceof Error ? err.message : String(err)}\n${usage}`);
    return 1;
  }
  const summary = outcome.computed ? outcome.report.summary : `not computed (${outcome.reason})`;
  out.write(`wrote ${clean(opts.out, 200)}\n${summary}\n`);
  return code;
}
