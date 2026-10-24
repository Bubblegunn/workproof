import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { git, wallClock } from "./git.js";
import { windowBound } from "./figures.js";
import type { Bound } from "./figures.js";

/**
 * `workproof reviews`: for each in-scope commit, whether a second person's review is recorded in
 * its message. Read-only. Everything printed from a commit (names, addresses, subjects, paths) is
 * data: control characters are removed before it reaches the output.
 */

const US = "\x1f";
const GS = "\x1d";
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g;
const DEFAULT_REVIEW_TRAILERS = ["Reviewed-by"];
const OTHER_APPROVAL = ["Acked-by", "Approved-by", "Tested-by", "Signed-off-by"];

export const CONVENTION_WINDOW_TEXT = "Convention: author date, local date in the commit's own offset";
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
}

/** Clears control characters, then keeps at most `max` characters (code points). */
export function clean(s: string, max = Infinity): string {
  return Array.from(s.replace(CONTROL, "")).slice(0, max).join("");
}

export function parseReviewsArgs(args: string[]): ReviewsOptions {
  const opts: ReviewsOptions = { repo: process.cwd(), paths: [], trailers: [], format: "text" };
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    const value = (): string => {
      const v = args[++i];
      if (v === undefined || v === "") throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--repo") opts.repo = resolve(value());
    else if (a === "--path") opts.paths.push(value());
    else if (a === "--since") opts.since = value();
    else if (a === "--until") opts.until = value();
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
  authorEmail: string;
  rawAuthorName: string;
  rawAuthorEmail: string;
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

const displayPerson = (p: Person): string => (p.name && p.email ? `${p.name} <${p.email}>` : p.name || p.email || "(none)");

/** Folds a display name for comparison: no accents, no case, single spaces. */
const foldName = (s: string): string => s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

const dayOf = (d: Date): string => (Number.isNaN(d.getTime()) ? "invalid date" : d.toISOString().slice(0, 10));

/** A commit is inside a window by its author instant, or by its author's calendar date for date-only bounds. */
function inBound(instant: Date, local: Date, since: Bound | undefined, until: Bound | undefined): boolean {
  if (Number.isNaN(instant.getTime())) return false;
  if (since && (since.day ? dayOf(local) < since.day : instant < since.at!)) return false;
  if (until && (until.day ? dayOf(local) > until.day : instant > until.at!)) return false;
  return true;
}

/**
 * Why a reviewer is the author, or undefined when they are a different person. Rules in order:
 * the same address, a .mailmap alias (the reviewer address resolves to the author's address),
 * the same folded name, the same local part of the address.
 */
function selfRule(author: Ids, reviewer: Person, canonicalEmail: string): string | undefined {
  const re = reviewer.email;
  if (re && (re === author.rawEmail || re === author.email)) return "same address";
  if (re && canonicalEmail && (canonicalEmail === author.email || canonicalEmail === author.rawEmail)) return "mailmap alias";
  const fn = foldName(reviewer.name);
  if (fn && (fn === foldName(author.rawName) || fn === foldName(author.name))) return "same name";
  if (re.includes("@")) {
    const local = re.split("@")[0]!;
    if (local && (local === author.rawEmail.split("@")[0] || local === author.email.split("@")[0])) return "same local part";
  }
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
    keys.forEach((queried, j) => {
      for (const item of (f[9 + j] ?? "").split(GS)) {
        const idx = item.indexOf(":");
        if (idx < 0) continue;
        const key = item.slice(0, idx).trim();
        if (lower(key) !== lower(queried)) continue;
        trailers.push({ key, review: reviewKeys.has(lower(queried)), ...parsePerson(item.slice(idx + 1)) });
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

interface Cover { merge: string; reviewers: string }

function classify(r: Rec, cover: Map<string, Cover>, canonOf: (e: string) => string): ReviewRow {
  const rule = (t: Trailer) => selfRule(r.author, t, canonOf(t.email));
  const reviews = r.trailers.filter((t) => t.review);
  const others = r.trailers.filter((t) => !t.review);
  const names = (ts: Trailer[]) => ts.map(displayPerson).join("; ");
  let status: Status;
  let reviewer = "";
  let basis: string;
  let satisfies: ReviewRow["satisfies"] = "no";
  const independent = reviews.filter((t) => !rule(t));
  const self = reviews.filter((t) => rule(t));
  const covered = cover.get(r.sha);
  if (independent.length) {
    status = "independent review";
    reviewer = names(reviews);
    basis = "reviewer is not the author";
    satisfies = "yes";
  } else if (self.length) {
    status = "self-review";
    reviewer = names(reviews);
    basis = self.map((t) => `${rule(t)} (${displayPerson(t)})`).join("; ");
  } else if (covered) {
    status = "reviewed via merge (weaker)";
    reviewer = covered.reviewers;
    basis = `in the second-parent range of merge ${covered.merge}`;
    satisfies = "yes (weaker)";
  } else if (/reviewed-by:/i.test(r.body)) {
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
      basis = others.length ? "no Reviewed-by trailer; only the author's own sign-off, which is not an approval" : "no review trailer";
    }
  }
  const revertTarget = /This reverts commit ([0-9a-f]{7,40})/i.exec(r.body)?.[1];
  const isRevert = /^Revert\b/.test(r.subject) || revertTarget !== undefined;
  const note = isRevert ? (revertTarget ? `revert of ${revertTarget.slice(0, 7)}` : "revert (target not named in the message)") : "";
  const raw = r.author;
  const recorded = raw.rawName !== raw.name || raw.rawEmail !== raw.email;
  return {
    sha: r.sha,
    localDate: dayOf(r.authorLocal),
    author: displayPerson({ name: clean(raw.name), email: clean(raw.email) }) + (recorded ? ` (as recorded: ${displayPerson({ name: clean(raw.rawName), email: clean(raw.rawEmail) })})` : ""),
    reviewer: clean(reviewer),
    status,
    satisfies,
    basis: clean([basis, note].filter(Boolean).join("; ")),
    subject: clean(r.subject),
    authorName: clean(raw.name),
    authorEmail: clean(raw.email),
    rawAuthorName: clean(raw.rawName),
    rawAuthorEmail: clean(raw.rawEmail),
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

    // A merge's Reviewed-by from someone other than the merge's author covers the commits it merged.
    const cover = new Map<string, Cover>();
    for (const m of merges) {
      const independent = m.trailers.filter((t) => t.review && !selfRule(m.author, t, canonOf(t.email)));
      if (!independent.length || m.parents.length < 2) continue;
      const covered = (await git(["rev-list", `${m.parents[0]}..${m.parents[1]}`], cwd)).split("\n").map((s) => s.trim()).filter(Boolean);
      for (const sha of covered) if (!cover.has(sha)) cover.set(sha, { merge: m.sha.slice(0, 7), reviewers: independent.map(displayPerson).join("; ") });
    }

    const inScope = path.filter((r) => inBound(r.authorDate, r.authorLocal, since, until));
    const rows = inScope.map((r) => classify(r, cover, canonOf));
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
        convention: [`${CONVENTION_WINDOW_TEXT}; window ${text.window}; paths ${text.paths}.`, ...CONVENTION_FIXED],
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
      author_email: row.authorEmail,
      raw_author_name: row.rawAuthorName,
      raw_author_email: row.rawAuthorEmail,
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

/** `workproof reviews`: returns the exit code, 0 whenever it ran and 1 for a usage error. */
export async function runReviews(args: string[], out: { write(s: string): unknown } = process.stdout): Promise<number> {
  const usage = "usage: workproof reviews [--repo <dir>] [--path <pathspec>]... [--since <date>] [--until <date>] [--trailer <Key>]... [--format text|csv|json] [--out <file>]";
  let opts: ReviewsOptions;
  let since: Bound | undefined;
  let until: Bound | undefined;
  try {
    opts = parseReviewsArgs(args);
    since = await windowBound(opts.since, "since", opts.repo);
    until = await windowBound(opts.until, "until", opts.repo);
    if (opts.out && existsSync(opts.out)) throw new Error(`${clean(opts.out, 200)} already exists; reviews does not overwrite a file`);
  } catch (err) {
    console.error(`${err instanceof Error ? err.message : String(err)}\n${usage}`);
    return 1;
  }
  const outcome = await computeReviews(opts, since, until);
  const text = renderReviews(outcome, opts.format);
  if (!opts.out) {
    out.write(text);
    return 0;
  }
  try {
    await writeFile(opts.out, text, { flag: "wx" });
  } catch (err) {
    console.error(`could not write ${clean(opts.out, 200)}: ${err instanceof Error ? err.message : String(err)}\n${usage}`);
    return 1;
  }
  const summary = outcome.computed ? outcome.report.summary : `not computed (${outcome.reason})`;
  out.write(`wrote ${clean(opts.out, 200)}\n${summary}\n`);
  return 0;
}
