import { open, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { git, configuredEmail, configuredName, wallClock, instantOf, PINNED_CONFIG } from "./git.js";
import { foldIdentity, possibleSplits, SPLIT_CATEGORY } from "./figures/identity.js";
import { isBotIdentity } from "./figures/bot.js";

/**
 * `workproof figures`: the counts a document about one person's work needs, each on a labelled line
 * with the filter it stands for, and a read-back of a finished document. It is read-only and states
 * no verdict. Whatever it prints is a candidate for a reader to check, never a pass or a fail.
 */

export interface FiguresOptions {
  repo: string;
  authors: string[];
  since?: string;
  until?: string;
  doc?: string;
  json: boolean;
  /** `--brief`: the short prepared summary of the whole history (see runBrief). */
  brief?: boolean;
  /** `--budget-ms` with `--brief`: the time after which nothing is printed. */
  budgetMs?: number;
}

export interface FigureRow {
  label: string;
  /** A number, a short text, or `not computed (<reason>)`. A figure that could not be computed is never 0. */
  value: number | string;
  filter: string;
  computed: boolean;
  /** Indented lines under the figure: the commits or files behind it, printed as data. */
  detail?: string[];
}

export interface DocHit { line: number; integer: number; noun: string; excerpt: string; labels: string[] }
export interface DocReadback {
  file: string;
  hits: DocHit[];
  shows: { label: string; count: number; lines: number[]; examples?: string[] }[];
  note?: string;
}
export interface FiguresResult { repo: string; window: string; rows: FigureRow[]; candidates: string[]; doc?: DocReadback }

const RS = "\x1e";
const US = "\x1f";
const GS = "\x1d";
const MAX_LINES = 60;
const GAP_DAYS = 30;
const MAX_DOC_BYTES = 1024 * 1024;
const MAX_DOC_LINE = 2000;
const LARGE_FILE_LINES = 40;
const MAX_FILES_READ = 200;
const MAX_BLOB_BYTES = 512 * 1024;

interface LogCommit {
  sha: string;
  email: string;
  name: string;
  author: Date;
  authorLocal: Date;
  committer: Date;
  committerLocal: Date;
  committerEmail: string;
  parents: number;
  coAuthors: string[];
  coAuthorNames: string[];
  body: string;
}

/** Strips control characters and caps the length: subjects, names and paths are data and must not break the layout. */
const data = (s: string, max = 80): string => {
  const flat = s.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 3)}...` : flat;
};

/** The first meaningful line of a git failure, for a "not computed" reason. */
function reasonOf(err: unknown): string {
  const e = err as { stderr?: unknown; message?: unknown };
  const text = [typeof e.stderr === "string" ? e.stderr : "", typeof e.message === "string" ? e.message : String(err)].join("\n");
  const line = text.split("\n").map((l) => l.trim()).find((l) => /^(fatal|error):/i.test(l)) ?? text.split("\n").find((l) => l.trim()) ?? "git failed";
  return data(line.replace(/^(fatal|error):\s*/i, ""), 120);
}

const notComputed = (label: string, filter: string, reason: string): FigureRow => ({ label, value: `not computed (${reason})`, filter, computed: false });

export interface Bound { at?: Date; /** A date-only bound: compared with the author's local calendar date. */ day?: string }

const RELATIVE = /^(?:now|today|yesterday|\d{1,4}\s+(?:second|minute|hour|day|week|month|year)s?\s+ago)$/i;

/** Date-only values are calendar days in the author's own offset; a full ISO time is an instant; "N days ago" is read by git. Anything else is an error, never a zero. */
export async function windowBound(value: string | undefined, kind: "since" | "until", cwd: string): Promise<Bound | undefined> {
  if (!value) return undefined;
  const bad = () => new Error(`git could not read the date "${data(value, 40)}"`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) throw bad();
    return { day: value };
  }
  // A time without Z or an offset would be read in the runner's own timezone, so it is refused.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    const direct = new Date(value);
    if (Number.isNaN(direct.getTime())) throw bad();
    return { at: direct };
  }
  if (!RELATIVE.test(value.trim())) throw bad();
  const out = (await git(["rev-parse", `--${kind}=${value}`], cwd)).trim();
  const m = out.match(/^--(?:max|min)-age=(\d+)$/);
  if (!m) throw bad();
  return { at: new Date(Number(m[1]) * 1000) };
}

/** `unreadable` counts records git listed that could not be parsed; they are reported, never silently dropped. */
async function readLog(cwd: string): Promise<{ commits: LogCommit[]; unreadable: number }> {
  const format = `--format=%H%x1f%aE%x1f%aN%x1f%aI%x1f%cE%x1f%cI%x1f%P%x1f%(trailers:key=Co-authored-by,valueonly,separator=%x1d)%x1f%B`;
  // -z ends each commit with NUL, which git never allows inside a message, so a message holding RS or US cannot forge a record.
  const out = await git(["log", "-z", "--no-color", "HEAD", format], cwd);
  const commits: LogCommit[] = [];
  let unreadable = 0;
  for (const block of out.split("\0")) {
    if (!block.trim()) continue;
    const [sha, email, name, aIso, cEmail, cIso, parents, trailers, ...bodyParts] = block.split(US);
    if (!sha || !aIso || !cIso || !/^[0-9a-f]{40,64}$/.test(sha.trim()) || trailers === undefined) {
      unreadable++;
      continue;
    }
    const co = (trailers ?? "").split(GS).map((t) => t.trim()).filter(Boolean);
    commits.push({
      sha: sha.trim(),
      email: (email ?? "").toLowerCase(),
      name: name ?? "",
      author: instantOf(aIso),
      authorLocal: wallClock(aIso),
      committer: instantOf(cIso),
      committerLocal: wallClock(cIso),
      committerEmail: (cEmail ?? "").toLowerCase(),
      parents: (parents ?? "").trim().split(" ").filter(Boolean).length,
      coAuthors: co.map((v) => (v.match(/<([^>]+)>/)?.[1] ?? "").toLowerCase()).filter(Boolean),
      coAuthorNames: co.map((v) => v.replace(/\s*<[^>]*>\s*$/, "").trim()).filter(Boolean),
      body: bodyParts.join(US).slice(0, 4000),
    });
  }
  return { commits, unreadable };
}

interface Numstat { sha: string; files: { path: string; added: number | null; deleted: number | null }[] }

/** numstat of exactly the named commits (no walk), optionally ignoring whitespace or keeping only added files. One git call per mode. */
async function numstatOf(shas: string[], cwd: string, mode: { ignoreWhitespace?: boolean; addedOnly?: boolean }): Promise<Map<string, Numstat>> {
  const out = new Map<string, Numstat>();
  if (!shas.length) return out;
  const args = ["-c", "core.quotepath=false", "log", "--no-walk=unsorted", "--stdin", "--numstat", "--format=%x1e%H", "--no-color"];
  if (mode.ignoreWhitespace) args.push("-w");
  if (mode.addedOnly) args.push("--diff-filter=A");
  const raw = await git(args, cwd, `${shas.join("\n")}\n`);
  // A record starts with RS and a full object name on its own line; an RS inside a file name is not followed by that.
  for (const block of raw.split(/\x1e(?=[0-9a-f]{40,64}\n)/)) {
    if (!block.trim()) continue;
    const [sha, ...rest] = block.replace(/^\x1e/, "").split("\n");
    const files: Numstat["files"] = [];
    for (const line of rest) {
      const parts = line.split("\t");
      if (parts.length < 3) continue;
      files.push({ path: parts.slice(2).join("\t"), added: parts[0] === "-" ? null : Number(parts[0]), deleted: parts[1] === "-" ? null : Number(parts[1]) });
    }
    out.set(sha!.trim(), { sha: sha!.trim(), files });
  }
  return out;
}

const HEADER_PATTERNS: [string, RegExp][] = [
  ["licence", /\blicen[cs]e[ds]?\b|SPDX-License-Identifier|all rights reserved/i],
  ["copyright", /\bcopyright\b|\(c\)\s{0,3}(?:19|20)\d{2}|©/i],
  ["source URL", /\b(?:source|from|taken from|adapted from|originally|via|see)\b.{0,40}https?:\/\/\S{1,200}|https?:\/\/(?:gist\.)?github\.com\/\S{1,200}|https?:\/\/(?:raw\.githubusercontent|gitlab|stackoverflow|unpkg|cdnjs)\S{0,200}/i],
];

/** Which header kinds the first 12 lines of a text carry. Each line is cut to 300 characters first, so no pattern runs long. */
export function headerKinds(text: string): string[] {
  const head = text.split("\n").slice(0, 12).map((l) => l.slice(0, 300));
  return HEADER_PATTERNS.filter(([, re]) => head.some((l) => re.test(l))).map(([kind]) => kind);
}

/**
 * Contents of up to a few hundred blobs through `git cat-file --batch-check` (sizes) and `--batch` (contents, in chunks of at most
 * 16 MB). null for a blob that is missing, over MAX_BLOB_BYTES or unreadable. Same result as one `cat-file -s` and one `cat-file blob`
 * per file, with a handful of git processes instead of hundreds.
 */
async function readHeads(specs: string[], cwd: string): Promise<(string | null)[]> {
  const out: (string | null)[] = specs.map(() => null);
  if (!specs.length) return out;
  const run = (args: string[], input: string): Promise<Buffer> =>
    new Promise((resolveRun, reject) => {
      const child = execFile("git", [...PINNED_CONFIG, ...args], { cwd, encoding: "buffer", maxBuffer: 64 * 1024 * 1024 }, (err, stdout) => (err ? reject(err) : resolveRun(stdout as Buffer)));
      child.stdin?.end(input);
    });
  let sizes: string[];
  try {
    sizes = (await run(["cat-file", "--batch-check=%(objectsize)"], specs.join("\n") + "\n")).toString("utf8").split("\n");
  } catch {
    return out;
  }
  const todo: number[] = [];
  specs.forEach((_, i) => {
    const n = Number(sizes[i]);
    if (Number.isFinite(n) && sizes[i] !== undefined && /^\d+$/.test(sizes[i]!) && n <= MAX_BLOB_BYTES) todo.push(i);
  });
  for (let at = 0; at < todo.length; ) {
    let total = 0;
    const chunk: number[] = [];
    while (at < todo.length && (chunk.length === 0 || total + Number(sizes[todo[at]!]) <= 16 * 1024 * 1024)) {
      total += Number(sizes[todo[at]!]);
      chunk.push(todo[at++]!);
    }
    let buf: Buffer;
    try {
      buf = await run(["cat-file", "--batch"], chunk.map((i) => specs[i]).join("\n") + "\n");
    } catch {
      continue;
    }
    let pos = 0;
    for (const i of chunk) {
      const eol = buf.indexOf(0x0a, pos);
      if (eol < 0) break;
      const header = buf.toString("utf8", pos, eol).split(" ");
      const size = Number(header[2]);
      if (header[1] !== "blob" || !Number.isFinite(size)) { pos = eol + 1; continue; }
      out[i] = buf.toString("utf8", eol + 1, eol + 1 + size);
      pos = eol + 1 + size + 1;
    }
  }
  return out;
}

const sha7 = (sha: string) => sha.slice(0, 7);
const day = (d: Date) => (Number.isNaN(d.getTime()) ? "invalid date" : d.toISOString().slice(0, 10));

export async function computeFigures(opts: FiguresOptions, now: Date = new Date()): Promise<FiguresResult> {
  const cwd = resolve(opts.repo);
  const rows: FigureRow[] = [];
  const candidates: string[] = [];
  let since: Bound | undefined;
  let until: Bound | undefined;
  let windowError = "";
  try {
    since = await windowBound(opts.since, "since", cwd);
    until = await windowBound(opts.until, "until", cwd);
  } catch (err) {
    windowError = reasonOf(err);
  }
  const dateOnly = [since, until].some((b) => b?.day);
  const sinceText = opts.since ? data(opts.since, 40) : "start of history";
  const untilText = opts.until ? data(opts.until, 40) : "now";
  const windowText = `author date ${sinceText} to ${untilText}${dateOnly ? " (date-only bounds are the local calendar date in the commit's own offset)" : ""}`;
  const filter = `${windowText}, reachable from HEAD`;
  const result = (): FiguresResult => ({ repo: data(cwd, 200), window: windowText, rows, candidates });

  let log: LogCommit[];
  let unreadable = 0;
  let head = "";
  try {
    if (!(await stat(cwd).then((st) => st.isDirectory(), () => false))) throw new Error("fatal: the --repo path is not a directory");
    ({ commits: log, unreadable } = await readLog(cwd));
    head = sha7((await git(["rev-parse", "HEAD"], cwd)).trim());
  } catch (err) {
    const reason = windowError || reasonOf(err);
    for (const label of ["authored non-merge commits", "first authored commit date", "last authored commit date", "active months", "gaps over 30 days", "authored non-merge commits, with identity candidates", "all authors, non-merge commits", "merge commits by the identities", "authored before the window, committed inside it", "revert commits", "whitespace-only commits", "lines added and deleted", "large added files with a header", "dates out of order", "committer date in the future"]) rows.push(notComputed(label, filter, reason));
    return result();
  }
  if (windowError) {
    rows.push(notComputed("window", filter, windowError));
    return result();
  }
  const within = (d: Date, local: Date, lo: Bound | undefined, hi: Bound | undefined) =>
    !Number.isNaN(d.getTime()) && (!lo || (lo.day ? day(local) >= lo.day : d >= lo.at!)) && (!hi || (hi.day ? day(local) <= hi.day : d <= hi.at!));
  const inWindow = (c: LogCommit) => within(c.author, c.authorLocal, since, until);
  const inCommitWindow = (c: LogCommit) => within(c.committer, c.committerLocal, since, until);
  const beforeStart = (c: LogCommit) => !!since && (since.day ? day(c.authorLocal) < since.day : c.author < since.at!);

  // Identity: exactly what was named (an address matches addresses, a name matches names). Candidates are printed, never merged.
  let wanted = opts.authors;
  // Only the configured address is the identity; a same-name address shows up as a candidate, never as a silent merge.
  if (!wanted.length) wanted = [await configuredEmail(cwd)].filter(Boolean);
  const folded = wanted.map(foldIdentity).filter(Boolean);
  const mineEmails = new Set<string>();
  const mineNames = new Set<string>();
  for (const c of log) {
    const hit = folded.some((w) => (w.includes("@") ? w === foldIdentity(c.email) : w === foldIdentity(c.name)));
    if (hit) {
      mineEmails.add(c.email);
      mineNames.add(c.name);
    }
  }
  const identity = { emails: [...mineEmails].sort(), names: [...mineNames].sort() };
  const isMine = (c: LogCommit) => mineEmails.has(c.email);
  const nonMerge = log.filter((c) => c.parents <= 1);
  const windowed = nonMerge.filter(inWindow);
  const who = identity.emails.length ? `identities ${identity.emails.map((e) => data(e, 80)).join(", ")}` : "";
  const noIdentity = wanted.length
    ? "no commit has that author name or address"
    : "no author given and git config has no user.email; pass --author";
  const idRow = (label: string, f: string, value: () => number | string, detail?: () => string[]): void => {
    if (!identity.emails.length) rows.push(notComputed(label, f, noIdentity));
    else rows.push({ label, value: value(), filter: f, computed: true, ...(detail ? { detail: detail() } : {}) });
  };

  const mine = windowed.filter(isMine);
  idRow("authored non-merge commits", `${who}; ${filter}`, () => mine.length);

  // Dates of the same commits. The local calendar date is day(authorLocal): the author date read in the commit's own offset.
  const byTime = [...mine].sort((a, b) => a.author.getTime() - b.author.getTime());
  const localDays = [...new Set(mine.map((c) => day(c.authorLocal)))].sort();
  const dayMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
  const gaps = localDays
    .slice(1)
    .map((to, i) => ({ from: localDays[i]!, to, days: (dayMs(to) - dayMs(localDays[i]!)) / 86400000 }))
    .filter((g) => g.days > GAP_DAYS);
  const dateFilter = `${who}; local calendar date (the commit's own offset) of the author date, in the window; ${filter}`;
  idRow("first authored commit date", `${dateFilter}; the earliest of those commits`, () => (mine.length ? day(byTime[0]!.authorLocal) : "none in the window"));
  idRow("last authored commit date", `${dateFilter}; the latest of those commits`, () => (mine.length ? day(byTime[byTime.length - 1]!.authorLocal) : "none in the window"));
  idRow("active months", `${who}; distinct local YYYY-MM of the author date of those commits, in the window; ${filter}`, () => new Set(mine.map((c) => day(c.authorLocal).slice(0, 7))).size);
  idRow("gaps over 30 days", `${who}; gaps longer than ${GAP_DAYS} days between consecutive authored commit dates, days counted by calendar date, in the window; ${filter}`, () => gaps.length, () => [...gaps.slice(0, 3).map((g) => `from ${g.from} to ${g.to} (${g.days} days)`), ...(gaps.length > 3 ? [`(+${gaps.length - 3} more)`] : [])]);

  // Identity candidates: same rules as the report's split warning, plus trailers and committer. Printed, never merged.
  const splits = identity.emails.length ? possibleSplits(nonMerge.map((c) => ({ name: c.name, email: c.email })), identity) : [];
  const splitEmails = new Set(splits.map((s) => s.email));
  const byCandidate = windowed.filter((c) => splitEmails.has(c.email));
  for (const s of splits.slice(0, 8)) {
    const n = byCandidate.filter((c) => c.email === s.email).length;
    candidates.push(`identity candidate | ${data(s.name, 40)} <${data(s.email, 80)}> | ${data(s.reason, 100)}; ${n} authored non-merge commits in the window; not merged`);
  }
  if (splits.length > 8) candidates.push(`identity candidate | ${splits.length - 8} more | not listed here; not merged`);
  const named = identity.emails.length ? nonMerge.filter((c) => !isMine(c) && c.coAuthors.some((e) => mineEmails.has(e))) : [];
  if (named.length) candidates.push(`identity candidate | commits by others with a Co-authored-by trailer naming an identity | ${named.filter(inWindow).length} in the window; not merged`);
  const committed = identity.emails.length ? nonMerge.filter((c) => !isMine(c) && mineEmails.has(c.committerEmail)) : [];
  if (committed.length) candidates.push(`identity candidate | commits authored by others and committed by an identity address | ${committed.filter(inWindow).length} in the window; not merged`);
  idRow("authored non-merge commits, with identity candidates", `${who} plus ${splits.length} candidate addresses (not merged); ${filter}`, () => mine.length + byCandidate.length);

  const everyone = windowed.filter((c) => !isBotIdentity(c.email));
  rows.push({ label: "all authors, non-merge commits", value: windowed.length, filter: `every author; ${filter}`, computed: true });
  rows.push({ label: "distinct authors", value: new Set(windowed.map((c) => c.email)).size, filter: `author addresses among those commits; bots included (${windowed.length - everyone.length} bot commits); ${filter}`, computed: true });
  idRow("authored non-merge commits, by committer date", `${who}; committer date ${sinceText} to ${untilText} (the window above uses author date)`, () => nonMerge.filter((c) => isMine(c) && inCommitWindow(c)).length);

  const merges = log.filter((c) => c.parents > 1 && isMine(c) && inWindow(c));
  idRow("merge commits by the identities", `${who}; ${filter}`, () => merges.length, () => merges.slice(0, 5).map((c) => `${sha7(c.sha)} merge ${day(c.author)} "${data(c.body.split("\n")[0] ?? "", 60)}"`));

  const replayed = nonMerge.filter((c) => isMine(c) && beforeStart(c) && inCommitWindow(c));
  idRow("authored before the window, committed inside it", `${who}; author date before ${opts.since ? data(opts.since, 40) : "the window start"}, committer date inside the window (rebase or replay)`, () => (since ? replayed.length : "no window start given"), () => replayed.slice(0, 5).map((c) => `${sha7(c.sha)} author ${day(c.author)} committer ${day(c.committer)}`));

  const known = new Set(log.map((c) => c.sha));
  const reverts = windowed.filter(isMine).map((c) => ({ c, targets: [...c.body.matchAll(/This reverts commit ([0-9a-f]{40})/g)].map((m) => m[1]!) })).filter((r) => r.targets.length);
  const reverted = new Set(reverts.flatMap((r) => r.targets.filter((t) => known.has(t))));
  idRow("revert commits", `${who}; ${filter}; detected by "This reverts commit <sha>"`, () => reverts.length, () => reverts.slice(0, 5).map((r) => `${sha7(r.c.sha)} reverts ${r.targets.map(sha7).join(", ")}`));
  idRow("commits reverted by those reverts", `${who}; targets present in this history`, () => reverted.size);

  // Numstat figures: raw, with whitespace ignored, and the added files that are large.
  const shas = mine.map((c) => c.sha);
  if (!identity.emails.length) {
    for (const label of ["whitespace-only commits", "lines added, raw", "lines deleted, raw", "lines added, whitespace ignored", "lines deleted, whitespace ignored", "large added files", "large added files with a licence, copyright or source-URL header"]) rows.push(notComputed(label, filter, noIdentity));
  } else {
    try {
      const raw = await numstatOf(shas, cwd, {});
      const wsFree = await numstatOf(shas, cwd, { ignoreWhitespace: true });
      const sum = (m: Map<string, Numstat>, k: "added" | "deleted") => [...m.values()].reduce((t, s) => t + s.files.reduce((u, f) => u + (f[k] ?? 0), 0), 0);
      const wsOnly = shas.filter((s) => {
        // git leaves a file out of `-w --numstat` when nothing but whitespace changed in it, so a file missing there counts as zero.
        const changed = raw.get(s)?.files ?? [];
        const ignoring = new Map((wsFree.get(s)?.files ?? []).map((f) => [f.path, f] as const));
        const zero = (f: { path: string }) => { const w = ignoring.get(f.path); return !w || (w.added === 0 && w.deleted === 0); };
        // A pure rename or mode change has no changed line in either mode, so it is not whitespace-only.
        return changed.length > 0 && changed.every(zero) && changed.some((f) => (f.added ?? 0) + (f.deleted ?? 0) > 0);
      });
      rows.push({ label: "whitespace-only commits", value: wsOnly.length, filter: `${who}; ${filter}; every file change is zero under git show -w --numstat; a commit that changes a binary file is never counted, because -w cannot show that a binary change is only whitespace`, computed: true, detail: wsOnly.slice(0, 5).map((s) => `${sha7(s)} "${data(log.find((c) => c.sha === s)!.body.split("\n")[0] ?? "", 60)}"`) });
      const lineFilter = `${who}; non-merge commits; ${filter}; binary files not counted`;
      rows.push({ label: "lines added, raw", value: sum(raw, "added"), filter: lineFilter, computed: true });
      rows.push({ label: "lines deleted, raw", value: sum(raw, "deleted"), filter: lineFilter, computed: true });
      rows.push({ label: "lines added, whitespace ignored", value: sum(wsFree, "added"), filter: `${lineFilter}; git -w`, computed: true });
      rows.push({ label: "lines deleted, whitespace ignored", value: sum(wsFree, "deleted"), filter: `${lineFilter}; git -w`, computed: true });
      const added = await numstatOf(shas, cwd, { addedOnly: true });
      const large = [...added.values()].flatMap((s) => s.files.filter((f) => (f.added ?? 0) >= LARGE_FILE_LINES && !f.path.startsWith('"')).map((f) => ({ sha: s.sha, ...f })));
      const withHeader: { sha: string; path: string; added: number | null; kinds: string[] }[] = [];
      let inspected = 0;
      // One batch call for the sizes and a few for the contents (at most 16 MB per call) instead of two git processes per file.
      const wanted = large.slice(0, MAX_FILES_READ);
      const heads = await readHeads(wanted.map((f) => `${f.sha}:${f.path}`), cwd);
      wanted.forEach((f, i) => {
        const text = heads[i];
        if (text === null || text === undefined) return;
        inspected++;
        const kinds = headerKinds(text);
        if (kinds.length) withHeader.push({ ...f, kinds });
      });
      rows.push({ label: "large added files", value: large.length, filter: `${who}; ${LARGE_FILE_LINES} or more lines added in one commit; ${filter}${large.length > MAX_FILES_READ ? `; only the first ${MAX_FILES_READ} read` : ""}`, computed: true });
      rows.push({ label: "large added files with a licence, copyright or source-URL header", value: withHeader.length, filter: `first 12 lines of each large added file; ${inspected} of ${large.length} large files inspected (blobs over ${MAX_BLOB_BYTES} bytes, unreadable blobs and files past the first ${MAX_FILES_READ} are not); possible third-party file, a reader decides`, computed: true, detail: withHeader.slice(0, 5).map((f) => `${sha7(f.sha)} "${data(f.path, 70)}" ${f.added} lines added; header: ${f.kinds.join(", ")}`) });
    } catch (err) {
      const reason = reasonOf(err);
      for (const label of ["whitespace-only commits", "lines added, raw", "lines deleted, raw", "lines added, whitespace ignored", "lines deleted, whitespace ignored", "large added files", "large added files with a licence, copyright or source-URL header"]) rows.push(notComputed(label, filter, reason));
    }
  }

  const future = log.filter((c) => isMine(c) && c.author > now);
  const early = log.filter((c) => isMine(c) && c.committer < c.author);
  const futureCommit = log.filter((c) => isMine(c) && c.committer > now);
  idRow("author date in the future", `${who}; any date, compared with ${now.toISOString().slice(0, 10)}`, () => future.length, () => future.slice(0, 3).map((c) => `${sha7(c.sha)} author ${day(c.author)}`));
  idRow("committer date in the future", `${who}; any date, compared with ${now.toISOString().slice(0, 10)}`, () => futureCommit.length, () => futureCommit.slice(0, 3).map((c) => `${sha7(c.sha)} author ${day(c.author)} committer ${day(c.committer)}`));
  idRow("committer date earlier than author date", `${who}; any date`, () => early.length, () => early.slice(0, 3).map((c) => `${sha7(c.sha)} author ${day(c.author)} committer ${day(c.committer)}`));
  const badDates = log.filter((c) => isMine(c) && (Number.isNaN(c.author.getTime()) || Number.isNaN(c.committer.getTime())));
  idRow("commits with an unparseable date", `${who}; any date; left out of every dated figure above`, () => badDates.length, () => badDates.slice(0, 3).map((c) => `${sha7(c.sha)}`));
  // Not tied to an identity: records nobody could place in a window. Shown only when there are some, so no commit disappears unseen.
  const undated = log.filter((c) => Number.isNaN(c.author.getTime()) || Number.isNaN(c.committer.getTime()));
  const lost = unreadable + undated.length;
  if (lost > 0) rows.push({ label: "records that could not be read", value: lost, filter: `every author; ${unreadable} log records git listed but this tool could not parse, ${undated.length} commits with a date it could not parse (left out of every windowed count)`, computed: true, detail: undated.slice(0, 3).map((c) => sha7(c.sha)) });
  let shallow = "";
  try {
    shallow = (await git(["rev-parse", "--is-shallow-repository"], cwd)).trim() === "true" ? "; shallow clone, older history is missing" : "";
  } catch {
    // an old git without the flag: nothing to say
  }
  rows.unshift({ label: "repository", value: head ? `HEAD ${head}` : "HEAD", filter: `${log.length} commits reachable from HEAD${shallow}; author and committer addresses are as .mailmap shows them`, computed: true });
  return result();
}

const NOUN = "(?:merge commits?|commits?|lines?|files?|merges?|reverts?|reverted|authors?|sessions?|days?)";
const NUM = "(\\d{1,3}(?:,\\d{3})+|\\d+)";
// Bounded: at most two words between the number and the noun, each word at most 20 letters, and lines are cut to MAX_DOC_LINE first.
// "N of M" and "N to M" / "N-M" keep both numbers. A filler word "of", "percent" or "per" means the number is not a count of the noun.
const COUNT_RE = new RegExp(`(?<![\\w.\\-/:,])${NUM}(?:\\s+of\\s+${NUM}|\\s*(?:to|[-\\u2013])\\s*${NUM})?\\s+((?:[A-Za-z-]{1,20}\\s+){0,2}?)(${NOUN})\\b`, "gi");
// A purely numeric table cell: digits with optional thousands commas.
const BARE_NUMBER_RE = /^(?:\d{1,3}(?:,\d{3})+|\d+)$/;
// The header cell of a table column names a counting noun when the noun appears as a whole word.
const HEADER_NOUN_RE = new RegExp(`(?<![A-Za-z])(${NOUN})(?![A-Za-z])`, "gi");
// A Markdown table separator row: cells made of dashes with optional colons, such as |---|:-:| or | - | -- |.
const isTableSeparator = (s: string): boolean => s.includes("|") && /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/.test(s);
const CELL_SPLIT = /(?<!\\)\|/;
const NOT_A_COUNT = /\b(?:of|percent|per|pct|out)\b/i;
const EMAIL_RE = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){1,4}/g;
const SHELL_RE = /^\s{0,8}(?:[$>]\s{0,2})?(?:npx|npm|pnpm|yarn|node|git|workproof|cd|curl|brew|pip3?|python3?|bash|sh|gh)\s+\S|`(?:npx|npm|git|workproof|node)\s[^`]{1,200}`/;
const BRANCH_RE = /\b(?:(?:origin|upstream|feature|fix|bugfix|hotfix|release|chore|refactor|develop)\/[A-Za-z0-9._-]{1,60}|refs\/(?:heads|remotes)\/[A-Za-z0-9._\/-]{1,80})|\bbranch\s{1,3}[`'"]([A-Za-z0-9._\/-]{1,60})[`'"]/g;

/** Reads a finished document (read only, at most 1 MB, a regular file) and lists what to check. Never prints a verdict. */
export async function readBack(file: string, rows: FigureRow[]): Promise<DocReadback> {
  const path = resolve(file);
  const empty = (note: string): DocReadback => ({ file: data(file, 200), hits: [], shows: [], note });
  let text: string;
  try {
    const st = await stat(path);
    if (!st.isFile()) return empty("not computed (the path is not a regular file)");
    if (st.size > MAX_DOC_BYTES) return empty(`not computed (the file is ${st.size} bytes; the limit is ${MAX_DOC_BYTES})`);
    const handle = await open(path, "r");
    try {
      const buf = Buffer.alloc(MAX_DOC_BYTES + 1);
      const { bytesRead } = await handle.read(buf, 0, buf.length, 0);
      if (bytesRead > MAX_DOC_BYTES) return empty(`not computed (the file is over ${MAX_DOC_BYTES} bytes)`);
      text = buf.subarray(0, bytesRead).toString("utf8");
    } finally {
      await handle.close();
    }
  } catch (err) {
    return empty(`not computed (${data((err as { code?: string }).code ?? "cannot read the file", 60)})`);
  }
  const numeric = rows.filter((r) => r.computed && typeof r.value === "number");
  // Each noun can only match its own rows; sessions and days match no computed row.
  const ownRow = (noun: string, label: string): boolean => {
    const n = noun.replace(/s$/, "").replace(/^reverted$/, "reverted");
    if (/^merge( commit)?$/.test(n)) return label.startsWith("merge commits");
    if (n === "commit") return /commits/.test(label) && !/^(?:merge commits|revert commits|whitespace-only|commits reverted)/.test(label);
    if (n === "revert") return label === "revert commits";
    if (n === "reverted") return label === "commits reverted by those reverts";
    if (n === "author") return label === "distinct authors";
    if (n === "line") return label.startsWith("lines ");
    if (n === "file") return label.startsWith("large added files");
    return false;
  };
  const labelsFor = (n: number, noun: string) => numeric.filter((r) => r.value === n && ownRow(noun, r.label)).map((r) => r.label);
  const hits: DocHit[] = [];
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/);
  const shows = { email: [] as number[], shell: [] as number[], fence: [] as number[], branch: [] as number[] };
  const emails = new Set<string>();
  const branches = new Set<string>();
  let cut = 0;
  let inFence = false;
  // A Markdown table: a header row followed by a `|---|` separator. A column whose header names a counting noun
  // reads its purely numeric body cells as that noun. Columns are tracked by index, not by cell text.
  let tableNouns: Map<number, string> | null = null;
  const pushHit = (line: string, lineNo: number, integer: number, noun: string, at: number) => {
    const key = `${lineNo - 1}:${integer}:${noun}`;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ line: lineNo, integer, noun, excerpt: data(line.slice(at, at + 100), 100), labels: labelsFor(integer, noun) });
  };
  lines.forEach((full, i) => {
    if (full.length > MAX_DOC_LINE) cut++;
    const line = full.slice(0, MAX_DOC_LINE);
    const fenceMark = /^\s{0,3}(?:```|~~~)/.test(line);
    const inCode = inFence || fenceMark;
    if (fenceMark) inFence = !inFence;
    const isRow = !inCode && line.trimStart().startsWith("|");
    const isSeparator = isRow && isTableSeparator(line);
    const nextLine = lines[i + 1]?.slice(0, MAX_DOC_LINE) ?? "";
    if (!isRow) tableNouns = null;
    else if (isSeparator) {
      // the separator row carries no figures
    } else if (isTableSeparator(nextLine)) {
      tableNouns = new Map();
      line.split(CELL_SPLIT).forEach((cell, k) => {
        // A header that names two different counting nouns is ambiguous, so the column is not read.
        const nouns = new Set([...cell.matchAll(HEADER_NOUN_RE)].map((m) => m[1]!.toLowerCase()));
        if (nouns.size === 1) tableNouns!.set(k, [...nouns][0]!);
      });
    } else if (tableNouns !== null) {
      line.split(CELL_SPLIT).forEach((cell, k) => {
        const noun = tableNouns!.get(k);
        if (!noun) return;
        const value = cell.trim();
        if (!BARE_NUMBER_RE.test(value)) return;
        const digits = value.replace(/,/g, "");
        // A bare run of 7 or more digits is an id or a SHA, not a count.
        if (/^\d{7,}$/.test(digits)) return;
        pushHit(line, i + 1, Number(digits), noun, 0);
      });
    }
    for (const m of line.matchAll(COUNT_RE)) {
      if (NOT_A_COUNT.test(m[4] ?? "")) continue;
      for (const g of [m[1], m[2], m[3]]) {
        if (g === undefined) continue;
        // A bare run of 7 or more digits is an id or a SHA, not a count.
        if (/^\d{7,}$/.test(g)) continue;
        const at = Math.max(0, (m.index ?? 0) - 30);
        pushHit(line, i + 1, Number(g.replace(/,/g, "")), m[5]!.toLowerCase(), at);
      }
    }
    const found = line.match(EMAIL_RE);
    if (found) {
      shows.email.push(i + 1);
      found.forEach((e) => emails.add(e.toLowerCase()));
    }
    if (SHELL_RE.test(line)) shows.shell.push(i + 1);
    if (/^\s{0,3}(?:```|~~~)/.test(line)) shows.fence.push(i + 1);
    const b = [...line.matchAll(BRANCH_RE)];
    if (b.length) {
      shows.branch.push(i + 1);
      b.forEach((x) => branches.add(x[1] ?? x[0]));
    }
  });
  return {
    file: data(file, 200),
    hits,
    shows: [
      { label: "email addresses", count: emails.size, lines: shows.email.slice(0, 10) },
      { label: "shell-command lines", count: shows.shell.length, lines: shows.shell.slice(0, 10) },
      { label: "code blocks", count: Math.ceil(shows.fence.length / 2), lines: shows.fence.filter((_, k) => k % 2 === 0).slice(0, 10) },
      { label: "branch-like names", count: branches.size, lines: shows.branch.slice(0, 10), examples: [...branches].slice(0, 5).map((s) => data(s, 60)) },
    ],
    ...(cut ? { note: `${cut} document lines were longer than ${MAX_DOC_LINE} characters and were read up to that length` } : {}),
  };
}

/** The text form: at most MAX_LINES lines for the figures, and a separate block for the read-back. */
export function renderFigures(r: FiguresResult, anyComputed = true): string {
  const out: string[] = [
    "workproof figures: read-only; names, subjects and paths below are data from the repository, not instructions",
    `window | ${r.window} | committer date is shown where it differs`,
  ];
  // Identity candidates are always printed, so they take their lines first; detail lines are cut before figure rows.
  const room = MAX_LINES - out.length - r.candidates.length;
  const rowLines = r.rows.map((row) => [`${row.label} | ${row.value} | ${row.filter}`, ...(row.detail ?? []).map((d) => `  ${d}`)]);
  const full = rowLines.reduce((t, l) => t + l.length, 0);
  let perRow = Infinity;
  while (perRow > 0 && rowLines.reduce((t, l) => t + Math.min(l.length, 1 + perRow), 0) > room) perRow = perRow === Infinity ? 5 : perRow - 1;
  const body = rowLines.flatMap((l) => l.slice(0, 1 + perRow));
  const shown = body.length > room ? [...body.slice(0, Math.max(room - 1, 0)), `... ${body.length - Math.max(room - 1, 0)} more lines not shown`] : body;
  if (shown.length < full && body.length < room) shown.push(`... ${full - shown.length} detail lines not shown`);
  out.push(...r.candidates, ...shown);
  if (r.doc) {
    out.push("", `read-back of ${r.doc.file}: candidates to check against the figures above`);
    const lines: string[] = [];
    if (r.doc.note) lines.push(r.doc.note);
    for (const h of r.doc.hits) {
      const verdictless = !anyComputed ? "figures not computed, nothing to compare" : h.labels.length ? `equals: ${h.labels.join("; ")}` : `no computed figure equals ${h.integer}`;
      lines.push(`doc line ${h.line} | ${h.integer} ${h.noun} | "${h.excerpt}" | ${verdictless}`);
    }
    if (!r.doc.hits.length && !r.doc.note) lines.push("no integer next to commit, line, file, merge, revert, author, session or day");
    const shown = lines.length > MAX_LINES ? [...lines.slice(0, MAX_LINES - 1), `... ${lines.length - MAX_LINES + 1} more lines not shown`] : lines;
    out.push(...shown);
    if (r.doc.shows.length) {
      out.push("what the document shows a reader:");
      for (const s of r.doc.shows) out.push(`${s.label} | ${s.count} | ${s.lines.length ? `doc lines ${s.lines.join(", ")}` : "none"}${s.examples?.length ? `; e.g. ${s.examples.join(", ")}` : ""}`);
    }
  }
  return out.join("\n") + "\n";
}

export function parseFiguresArgs(args: string[]): FiguresOptions {
  const opts: FiguresOptions = { repo: process.cwd(), authors: [], json: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    const value = (): string => {
      const v = args[++i];
      if (v === undefined || v === "") throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--repo") opts.repo = resolve(value());
    else if (a === "--author") opts.authors.push(value());
    else if (a === "--since") opts.since = value();
    else if (a === "--until") opts.until = value();
    else if (a === "--doc") opts.doc = value();
    else if (a === "--json") opts.json = true;
    else if (a === "--brief") opts.brief = true;
    else if (a === "--budget-ms") {
      const v = value();
      if (!/^\d{1,9}$/.test(v)) throw new Error("--budget-ms needs a whole number of milliseconds");
      opts.budgetMs = Number(v);
    }
    else throw new Error(`unknown option ${a}`);
  }
  return opts;
}

/** `workproof figures`: returns the exit code, 0 whenever it ran and 1 for a usage error. */
export async function runFigures(args: string[], out: { write(s: string): unknown } = process.stdout): Promise<number> {
  const usage = "usage: workproof figures [--repo <dir>] [--author <email|name>]... [--since <date>] [--until <date>] [--doc <file>] [--json]\n       workproof figures --brief [--repo <dir>] [--budget-ms <n>]";
  let opts: FiguresOptions;
  try {
    opts = parseFiguresArgs(args);
  } catch (err) {
    console.error(`${err instanceof Error ? err.message : String(err)}\n${usage}`);
    return 1;
  }
  if (opts.brief) {
    if (opts.json || opts.doc || opts.authors.length || opts.since || opts.until) {
      console.error(`--brief takes only --repo and --budget-ms\n${usage}`);
      return 1;
    }
    return runBrief(opts.repo, opts.budgetMs ?? 3000, out);
  }
  if (opts.budgetMs !== undefined) {
    console.error(`--budget-ms needs --brief\n${usage}`);
    return 1;
  }
  const result = await computeFigures(opts);
  if (opts.doc) result.doc = await readBack(opts.doc, result.rows);
  out.write(opts.json ? `${JSON.stringify(result, null, 2)}\n` : renderFigures(result, result.rows.some((r) => r.computed && typeof r.value === "number")));
  return 0;
}

// ---- `workproof figures --brief`: a short prepared summary of the whole history, for the prompt hint. ----

export const BRIEF_MAX_COMMITS = 20000;
const BRIEF_TOP_AUTHORS = 5;
const WEBMAIL_DOMAIN = /^(?:gmail|googlemail|outlook|hotmail|live|msn|yahoo|icloud|me|mac|proton|protonmail|pm|gmx|qq|163|126|yandex)\.[a-z]{2,}(?:\.[a-z]{2})?$/;

export type AddressKind = "organisational" | "personal webmail" | "noreply" | "bot" | "unknown";

/** The kind of an address, never the address itself. Bots first, then noreply, then webmail; a domain with no dot, or a local-only one, is unknown. */
export function addressKind(email: string): AddressKind {
  const e = email.trim().toLowerCase();
  if (isBotIdentity(e)) return "bot";
  const at = e.lastIndexOf("@");
  if (at < 1 || at === e.length - 1) return "unknown";
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (domain === "users.noreply.github.com" || /^(?:noreply|no-reply|donotreply)(?:[+.-]|$)/.test(local) || /(?:^|\.)noreply\./.test(domain)) return "noreply";
  if (WEBMAIL_DOMAIN.test(domain)) return "personal webmail";
  if (!domain.includes(".") || /\.(?:local|localdomain|internal|lan)$/.test(domain)) return "unknown";
  return "organisational";
}

/** The no-address guarantee: every line the brief prints passes through here, so anything that looks like an address becomes a placeholder. */
export const withoutAddresses = (s: string): string => s.replace(/\S*@\S*/g, "[address removed]");

/** A display name as printed: control characters out, 40 characters at most. The address guarantee is applied once, to the whole output. */
const briefName = (s: string): string => data(s, 40);

const mostCommon = (counts: Map<string, number> | undefined): string | undefined => {
  if (!counts?.size) return undefined;
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))[0]![0];
};

/** The brief lines, or undefined when nothing should be printed: not a git work tree, no HEAD, more than BRIEF_MAX_COMMITS commits, no identity at all. */
export async function briefLines(repo: string): Promise<string[] | undefined> {
  const cwd = resolve(repo);
  if (!(await git(["rev-parse", "--is-inside-work-tree"], cwd).then((s) => s.trim() === "true", () => false))) return undefined;
  const counted = await git(["rev-list", "--count", `--max-count=${BRIEF_MAX_COMMITS + 1}`, "HEAD"], cwd).then((s) => Number(s.trim()), () => Number.NaN);
  if (!Number.isInteger(counted) || counted < 1 || counted > BRIEF_MAX_COMMITS) return undefined;
  const { commits: log } = await readLog(cwd);
  const nonMerge = log.filter((c) => c.parents <= 1);

  // Names per address over every commit; the top authors are ranked by non-merge commits per address.
  const namesOf = new Map<string, Map<string, number>>();
  for (const c of log) {
    const counts = namesOf.get(c.email) ?? new Map<string, number>();
    counts.set(c.name, (counts.get(c.name) ?? 0) + 1);
    namesOf.set(c.email, counts);
  }
  const commitsOf = new Map<string, number>();
  for (const c of nonMerge) commitsOf.set(c.email, (commitsOf.get(c.email) ?? 0) + 1);
  const ranked = [...commitsOf].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const configured = await configuredEmail(cwd);
  let identity = configured;
  let source = "configured";
  if (!identity) {
    if (!ranked.length) return undefined;
    identity = ranked[0]![0];
    source = "top author";
  }
  const configuredNameText = configured ? await configuredName(cwd) : "";
  const displayName = briefName(configuredNameText || mostCommon(namesOf.get(identity)) || "(no name)");

  const figures = await computeFigures({ repo: cwd, authors: [identity], json: false });
  const row = (label: string): string => String(figures.rows.find((r) => r.label === label)?.value ?? "not computed (no such figure)");

  // Identity candidates by kind. The same rules as the report's split warning; only the counts leave this function.
  const splits = possibleSplits(nonMerge.map((c) => ({ name: c.name, email: c.email })), { emails: [identity], names: [...(namesOf.get(identity)?.keys() ?? [])] });
  const sameName = splits.filter((s) => s.category === SPLIT_CATEGORY.sameName).length;
  const sameLocal = splits.length - sameName;
  const viaTrailer = nonMerge.filter((c) => c.email !== identity && c.coAuthors.includes(identity)).length;

  let shallow = false;
  try {
    shallow = (await git(["rev-parse", "--is-shallow-repository"], cwd)).trim() === "true";
  } catch {
    // an old git without the flag: the clone is reported as not shallow
  }
  let mailmap = false;
  try {
    const top = (await git(["rev-parse", "--show-toplevel"], cwd)).trim();
    mailmap = existsSync(join(top, ".mailmap"));
  } catch {
    // no top-level directory: no mailmap to report
  }

  const lines = [
    `Brief for ${displayName} (${source}), all history, author date, local dates:`,
    `repository commits: ${counted}`,
    `shallow clone: ${shallow ? "yes" : "no"}`,
    `.mailmap: ${mailmap ? "present" : "absent"}`,
    `authored non-merge commits: ${row("authored non-merge commits")}`,
    `first authored commit date: ${row("first authored commit date")}`,
    `last authored commit date: ${row("last authored commit date")}`,
    `active months: ${row("active months")}`,
    `gaps over 30 days: ${row("gaps over 30 days")}`,
    `merge commits by the identity: ${row("merge commits by the identities")}`,
    `revert commits: ${row("revert commits")}`,
    `whitespace-only commits: ${row("whitespace-only commits")}`,
    `large added files with a licence, copyright or source header: ${row("large added files with a licence, copyright or source-URL header")}`,
    `identity candidates: ${sameName} other address(es) with the same name`,
    `identity candidates: ${sameLocal} with the same local part`,
    `identity candidates: ${viaTrailer} via Co-authored-by trailers`,
  ];
  ranked.slice(0, BRIEF_TOP_AUTHORS).forEach(([email, n], i) => {
    lines.push(`top author ${i + 1}: ${briefName(mostCommon(namesOf.get(email)) ?? "(no name)")}: ${n} ${n === 1 ? "commit" : "commits"}, ${addressKind(email)}`);
  });
  return lines;
}

/** `workproof figures --brief`: prints the brief, or nothing when it cannot finish within budgetMs. Always returns 0. Read-only. */
export async function runBrief(repo: string, budgetMs: number, out: { write(s: string): unknown }): Promise<number> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<undefined>((resolveLate) => {
    timer = setTimeout(() => resolveLate(undefined), budgetMs);
  });
  const lines = await Promise.race([briefLines(repo).catch(() => undefined), late]).finally(() => clearTimeout(timer));
  if (lines) out.write(`${lines.map(withoutAddresses).join("\n")}\n`);
  return 0;
}
