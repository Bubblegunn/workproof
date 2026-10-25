import { execFile } from "node:child_process";
import { posix } from "node:path";
import { PINNED_CONFIG } from "./git.js";
import { foldIdentity } from "./figures/identity.js";
import { readLog } from "./figures.js";
import { groupPeople } from "./figures/people.js";
import { formattingOnlyCommits } from "./figures/format.js";

/**
 * `workproof owner`: checks a claim that one person wrote or owns a file or directory, from its
 * history at HEAD. It is read-only and states no verdict; each row says what it was computed from.
 * A row that git could not compute says so and is never printed as zero. Names and subjects are
 * data: they are sanitised by `show`, and no email address is ever printed.
 */

export interface OwnerOptions {
  path: string;
  repo: string;
  claim?: string;
  json: boolean;
}

export interface OwnerRow {
  label: string;
  /** A number or short text, or `not computed (<reason>)`. */
  value: string;
  basis: string;
}

export interface OwnerReport {
  path: string;
  kind: "file" | "directory";
  repo: string;
  files: number;
  notes: string[];
  rows: OwnerRow[];
  claim?: string;
  sentence?: string;
}

export const OWNER_USAGE = "usage: workproof owner --path <file-or-dir> [--repo <dir>] [--claim <name-or-email>] [--json]";
export const OWNER_SENTENCE = "Surviving lines show who wrote the lines that remain; they do not show time spent, design ownership or quality; a self-declared name or address is not proof of identity.";

const MAX_FILES = 200;
const GIT_TIMEOUT_MS = 20_000;
/** Each blame pass (whitespace-ignoring, then plain) has its own clock. */
const BLAME_CAP_MS = 120_000;
const BACKDATE_DAYS = 30;
const DAY_MS = 86_400_000;
const LIST = 5;
const NAME_CAP = 80;
const SUBJECT_CAP = 120;
const PATH_CAP = 200;
const LOCK_FILES = new Set(["package-lock.json", "yarn.lock", "Cargo.lock", "go.sum", "poetry.lock", "Gemfile.lock", "pnpm-lock.yaml"]);
/** A generated-file marker counts only in a comment line, and only as a standalone phrase. */
const COMMENT_LINE = /^\s*(\/\/|#|\/\*|\*|--|<!--)/;
const GENERATED_MARKER = /(?:^|[^A-Za-z0-9])(@generated|do\s+not\s+edit|auto-?generated)(?![A-Za-z0-9])/i;
/** Record separator, then unit-separated header fields; the header ends at NUL (git -z). */
const FORMAT = "%x1e%H%x1f%aN%x1f%aE%x1f%aI%x1f%cI%x1f%s";

/** Control, format and line-separator characters, built from escapes so they survive compilation. */
const INVISIBLE = new RegExp("[\\p{Cc}\\p{Cf}\\u2028\\u2029]", "gu");

/**
 * Makes a git-supplied string safe to print: no control or format characters, no line separators,
 * no email address (a token with an @ becomes "(address)"), no table separator, and a length cap.
 */
export function show(s: string, cap = NAME_CAP): string {
  let t = s.replace(INVISIBLE, "");
  t = t.replace(/[^\s<>]+@[^\s<>]+/g, "(address)");
  t = t.replace(/\|/g, "/");
  return t.length > cap ? `${t.slice(0, cap - 3)}...` : t;
}

export function parseOwnerArgs(args: string[]): OwnerOptions {
  let path: string | undefined;
  let repo = ".";
  let claim: string | undefined;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--json") {
      json = true;
      continue;
    }
    if (a !== "--path" && a !== "--repo" && a !== "--claim") throw new Error(`unknown option ${a}`);
    const v = args[++i];
    if (v === undefined || v === "" || v.startsWith("--")) throw new Error(`${a} needs a value`);
    if (a === "--path") path = v;
    else if (a === "--repo") repo = v;
    else claim = v;
  }
  if (path === undefined) throw new Error("--path is required");
  if (path.startsWith("/")) throw new Error("--path must be relative to --repo");
  if (claim !== undefined && !foldIdentity(claim)) throw new Error("--claim is empty");
  return { path, repo, ...(claim !== undefined ? { claim } : {}), json };
}

/** Runs git with the pinned configuration, unquoted paths and a per-call timeout. Rejects with a short reason. */
function run(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", [...PINNED_CONFIG, "-c", "core.quotepath=false", ...args], { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 256, timeout: GIT_TIMEOUT_MS }, (err, stdout, stderr) => {
      if (!err) return resolve(stdout);
      if ((err as { killed?: boolean }).killed) return reject(new Error(`timed out after ${GIT_TIMEOUT_MS / 1000} s`));
      const text = String(stderr || err.message).trim().split("\n")[0] ?? "git failed";
      reject(new Error(show(text, 200)));
    });
  });
}

type Got<T> = { ok: true; value: T } | { ok: false; reason: string };

async function attempt<T>(fn: () => Promise<T>): Promise<Got<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

const notComputed = (reason: string) => `not computed (${reason})`;
const day = (iso: string) => iso.slice(0, 10);
const sha7 = (sha: string) => sha.slice(0, 7);
const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

interface Change {
  path: string;
  from?: string;
  added: number | null;
  deleted: number | null;
}

interface Rec {
  sha: string;
  name: string;
  email: string;
  authorDate: string;
  committerDate: string;
  subject: string;
  changes: Change[];
}

/**
 * Parses `git log -z` output with a record separator and per-file numstat. Each record is a header
 * ending at NUL, then NUL-separated numstat entries. A rename is an entry with an empty path, then
 * the old and the new path as two more NUL-separated fields, so no brace syntax is parsed.
 * The subject is the rest of the header after the fifth unit separator, so a subject may contain one.
 */
export function parseLog(out: string): Rec[] {
  const recs: Rec[] = [];
  for (const block of out.split("\x1e")) {
    if (!block.trim()) continue;
    const nul = block.indexOf("\0");
    const header = (nul < 0 ? block : block.slice(0, nul)).replace(/\n+$/, "");
    const [sha, name, email, authorDate, committerDate, ...subject] = header.split("\x1f");
    if (!sha || committerDate === undefined) continue;
    const rest = nul < 0 ? [] : block.slice(nul + 1).replace(/^\n/, "").split("\0");
    const changes: Change[] = [];
    for (let i = 0; i < rest.length; i++) {
      const tok = rest[i]!;
      const m = tok.match(/^(-|\d+)\t(-|\d+)\t([\s\S]*)$/);
      if (!m) continue;
      const added = m[1] === "-" ? null : Number(m[1]);
      const deleted = m[2] === "-" ? null : Number(m[2]);
      if (m[3] === "") {
        const from = rest[++i] ?? "";
        const path = rest[++i] ?? "";
        changes.push({ path, from, added, deleted });
      } else changes.push({ path: m[3]!, added, deleted });
    }
    recs.push({ sha, name: name ?? "", email: (email ?? "").toLowerCase(), authorDate: authorDate ?? "", committerDate, subject: subject.join("\x1f"), changes });
  }
  return recs;
}

/** Non-merge commits reachable from HEAD with per-file numstat. `ws` adds -w, which ignores whitespace. */
async function loadHistory(top: string, ws: boolean): Promise<Rec[]> {
  return parseLog(await run(["log", "-z", "--no-merges", "-M", "--numstat", ...(ws ? ["-w"] : []), `--format=${FORMAT}`, "HEAD"], top));
}

interface HeadEntry {
  path: string;
  mode: string;
  type: string;
}

/** Every entry at HEAD, with mode and type (`ls-tree -l` gives the type, so submodules and symlinks are known before any read). */
async function headEntries(top: string): Promise<HeadEntry[]> {
  const out = await run(["ls-tree", "-r", "-z", "-l", "--full-tree", "HEAD"], top);
  const entries: HeadEntry[] = [];
  for (const rec of out.split("\0")) {
    const m = rec.match(/^(\d{6}) (\w+) ([0-9a-f]+) +(\S+)\t([\s\S]*)$/);
    if (m) entries.push({ mode: m[1]!, type: m[2]!, path: m[5]! });
  }
  return entries;
}

/** True when one of the first five lines is a comment that carries a generated marker as a phrase. */
export function hasGeneratedMarker(text: string): boolean {
  return text.split("\n", 5).some((l) => COMMENT_LINE.test(l) && GENERATED_MARKER.test(l));
}

interface BlameLine {
  name: string;
  mail: string;
  sha: string;
}

/** Blames one file at HEAD. Blame applies .mailmap itself, so names are the resolved ones. */
async function blameLines(top: string, file: string, ws: boolean, ignore: string[] = []): Promise<BlameLine[]> {
  const args = ["blame", ...(ws ? ["-w", "-C"] : []), ...ignore.flatMap((r) => ["--ignore-rev", r]), "--line-porcelain", "HEAD", "--", file];
  const out = await run(args, top);
  const lines: BlameLine[] = [];
  let cur: { name?: string; mail?: string; sha?: string } | undefined;
  for (const line of out.split("\n")) {
    if (/^[0-9a-f]{40,64} \d+ \d+/.test(line)) cur = { sha: line.slice(0, line.indexOf(" ")) };
    else if (!cur) continue;
    else if (line.startsWith("author ")) cur.name = line.slice(7);
    else if (line.startsWith("author-mail ")) cur.mail = line.slice(12).replace(/^<|>$/g, "");
    else if (line.startsWith("\t")) {
      lines.push({ name: cur.name ?? "", mail: cur.mail ?? "", sha: cur.sha ?? "" });
      cur = undefined;
    }
  }
  return lines;
}

interface Tally {
  total: number;
  files: number;
  authors: { name: string; lines: number }[];
  claimLines: number;
}

function tally(perFile: BlameLine[][], claim: string | undefined): Tally {
  const byKey = new Map<string, { name: string; lines: number }>();
  let total = 0;
  let claimLines = 0;
  const c = claim === undefined ? undefined : foldIdentity(claim);
  for (const lines of perFile) {
    for (const l of lines) {
      total++;
      const key = foldIdentity(l.name);
      const entry = byKey.get(key) ?? { name: show(l.name), lines: 0 };
      entry.lines++;
      byKey.set(key, entry);
      if (c !== undefined && (key === c || foldIdentity(l.mail) === c)) claimLines++;
    }
  }
  const authors = [...byKey.values()].sort((a, b) => b.lines - a.lines || a.name.localeCompare(b.name));
  return { total, files: perFile.length, authors, claimLines };
}

function blameRows(label: string, basis: string, t: Got<Tally>): OwnerRow[] {
  if (!t.ok) return [{ label, value: notComputed(t.reason), basis }];
  const { value: tl } = t;
  const rows: OwnerRow[] = [{ label, value: `${plural(tl.total, "line")} in ${plural(tl.files, "file")}`, basis }];
  for (const a of tl.authors.slice(0, LIST)) {
    const pct = tl.total ? ((a.lines / tl.total) * 100).toFixed(1) : "0.0";
    rows.push({ label: `  ${a.name}`, value: `${plural(a.lines, "line")} (${pct}%)`, basis: "" });
  }
  return rows;
}

/**
 * The commits that touch the path, newest first, each with the changes that touch it. A file is
 * followed backwards through its renames, so the commits made under an earlier name count; a
 * directory is matched by prefix.
 */
function touchingCommits(recs: Rec[], kind: "file" | "directory", target: string): { rec: Rec; changes: Change[] }[] {
  const under = (p: string) => target === "" || p === target || p.startsWith(`${target}/`);
  const names = new Set<string>([target]);
  const out: { rec: Rec; changes: Change[] }[] = [];
  for (const rec of recs) {
    const changes: Change[] = [];
    for (const c of rec.changes) {
      if (kind === "directory") {
        if (under(c.path) || (c.from !== undefined && under(c.from))) changes.push(c);
      } else if (names.has(c.path)) {
        changes.push(c);
        if (c.from !== undefined) names.add(c.from);
      } else if (c.from !== undefined && names.has(c.from)) changes.push(c);
    }
    if (changes.length) out.push({ rec, changes });
  }
  return out;
}

const share = (n: number, total: number): string => (total ? `${((n / total) * 100).toFixed(1)}%` : "0.0%");

export async function computeOwner(opts: OwnerOptions): Promise<OwnerReport> {
  const repo = opts.repo;
  const loc = (await run(["rev-parse", "--show-toplevel", "--show-prefix"], repo)).split("\n");
  const top = loc[0] ?? "";
  const prefix = (loc[1] ?? "").replace(/\/+$/, "");
  if (!top) throw new Error(`${repo} is not a git repository`);

  const rel = posix.normalize(opts.path).replace(/\/+$/, "");
  if (rel === ".." || rel.startsWith("../")) throw new Error(`--path must stay inside the repository`);
  const target = rel === "." ? prefix : posix.join(prefix, rel);
  const under = (p: string) => target === "" || p === target || p.startsWith(`${target}/`);

  const entries = (await headEntries(top)).filter((e) => under(e.path));
  if (!entries.length) throw new Error(`no file at HEAD matches ${show(opts.path, PATH_CAP)} (looked under ${show(top, PATH_CAP)})`);
  const kind: "file" | "directory" = entries.length === 1 && entries[0]!.path === target ? "file" : "directory";
  const submodules = entries.filter((e) => e.mode === "160000").map((e) => e.path);
  const symlinks = entries.filter((e) => e.mode === "120000").map((e) => e.path);
  const blobs = entries.filter((e) => e.type === "blob" && e.mode !== "120000").map((e) => e.path);

  const notes: string[] = [];
  let toRead = blobs;
  if (blobs.length > MAX_FILES) {
    notes.push(`only the first ${MAX_FILES} files were read (${blobs.length} files at HEAD under the path)`);
    toRead = blobs.slice(0, MAX_FILES);
  }
  notes.push(`limits: ${MAX_FILES} files, ${GIT_TIMEOUT_MS / 1000} s per git call, ${BLAME_CAP_MS / 1000} s for each blame pass`);

  // Classify each blob: left out for a lock file, a minified bundle, a NUL byte or a generated marker; or read.
  const readFiles: string[] = [];
  const excluded: { path: string; reason: string; lines: number }[] = [];
  let classifyError: string | undefined;
  for (const f of toRead) {
    const base = posix.basename(f);
    let reason: string | undefined = LOCK_FILES.has(base) ? "lock file" : base.endsWith(".min.js") ? "minified" : undefined;
    let lines = 0;
    if (classifyError === undefined) {
      const blob = await attempt(() => run(["cat-file", "blob", `HEAD:${f}`], top));
      if (!blob.ok) classifyError = blob.reason;
      else {
        const text = blob.value;
        if (reason === undefined && text.includes("\0")) reason = "binary";
        lines = text === "" ? 0 : text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
        if (reason === undefined && hasGeneratedMarker(text)) reason = "generated header";
      }
    }
    if (reason !== undefined) excluded.push({ path: f, reason, lines });
    else readFiles.push(f);
  }
  const reasonCount = (r: string) => excluded.filter((e) => e.reason === r).length;
  const excludedLines = excluded.reduce((n, e) => n + e.lines, 0);
  const leftOutNames = [...excluded.map((e) => `${show(e.path, PATH_CAP)} (${e.reason}, ${e.lines} lines)`), ...submodules.map((p) => `${show(p, PATH_CAP)} (submodule)`), ...symlinks.map((p) => `${show(p, PATH_CAP)} (symlink)`)];
  for (const n of leftOutNames.slice(0, LIST)) notes.push(`left out: ${n}`);
  if (leftOutNames.length > LIST) notes.push(`left out: ${leftOutNames.length - LIST} more`);

  // Blame, one file at a time. Each pass has its own cap.
  const blameBoth = async (ws: boolean): Promise<Got<Tally>> => {
    if (classifyError !== undefined) return { ok: false, reason: classifyError };
    return attempt(async () => {
      const t0 = Date.now();
      const perFile: BlameLine[][] = [];
      for (let i = 0; i < readFiles.length; i++) {
        if (Date.now() - t0 > BLAME_CAP_MS) throw new Error(`the ${BLAME_CAP_MS / 1000} s cap for one blame pass was reached after ${i} of ${readFiles.length} files`);
        perFile.push(await blameLines(top, readFiles[i]!, ws));
      }
      return tally(perFile, opts.claim);
    });
  };
  const blameWs = await blameBoth(true);
  const blamePlain = await blameBoth(false);

  // History: one plain numstat pass, one with whitespace ignored, and the creation commit.
  const plain = await attempt(() => loadHistory(top, false));
  const wsHist = await attempt(() => loadHistory(top, true));
  const pathspec = target === "" ? [] : ["--", `:(literal)${target}`];
  const creation = await attempt(async () => parseLog(await run(["log", "-z", ...(kind === "file" ? ["--follow"] : []), "--diff-filter=A", `--format=${FORMAT}`, "HEAD", ...pathspec], top)));
  const creator = creation.ok && creation.value.length ? creation.value[creation.value.length - 1] : undefined;
  const touched = plain.ok ? touchingCommits(plain.value, kind, target) : undefined;

  const rows: OwnerRow[] = [];
  const claim = opts.claim;
  const cFold = claim === undefined ? undefined : foldIdentity(claim);
  const matchRec = (r: { name: string; email: string }) => cFold !== undefined && (foldIdentity(r.name) === cFold || foldIdentity(r.email) === cFold);

  // (1) and (2): blame, side by side.
  const basis1 = "git blame -w -C --line-porcelain at HEAD, per file; .mailmap applied by blame";
  const basis2 = "git blame --line-porcelain at HEAD, per file (no -w or -C); .mailmap applied by blame";
  const excludedBasis = "lock file name; *.min.js name; a NUL byte; '@generated', 'DO NOT EDIT' or 'auto-generated' in a comment in the first 5 lines; submodule and symlink entries are not files";
  const excludedRow: OwnerRow = {
    label: "left out of the two blame rows",
    value: `${plural(excluded.length + submodules.length + symlinks.length, "file")}, ${excludedLines} lines: lock file ${reasonCount("lock file")}, minified ${reasonCount("minified")}, binary ${reasonCount("binary")}, generated header ${reasonCount("generated header")}, submodule ${submodules.length}, symlink ${symlinks.length}`,
    basis: excludedBasis,
  };
  rows.push(...blameRows("surviving lines by author, whitespace and moves ignored", basis1, blameWs), ...blameRows("surviving lines by author, plain blame", basis2, blamePlain), excludedRow);

  // (3) creation.
  const createdRow: OwnerRow = { label: "file created by", value: "", basis: kind === "file" ? "git log --follow --diff-filter=A (renames followed); the earliest such commit" : "git log --diff-filter=A under the path; the earliest such commit" };
  if (!creation.ok) createdRow.value = notComputed(creation.reason);
  else if (!creator) createdRow.value = "not computed (no commit added a file here)";
  else createdRow.value = `${show(creator.name)}, author date ${day(creator.authorDate)}, committer date ${day(creator.committerDate)}, ${sha7(creator.sha)} "${show(creator.subject, SUBJECT_CAP)}"`;
  rows.push(createdRow);

  // (4)-(7): commits on the path.
  const failRows = (label: string, basis: string, reason: string) => rows.push({ label, value: notComputed(reason), basis });
  if (!plain.ok || !touched) {
    const reason = plain.ok ? "no history" : plain.reason;
    failRows("commits touching the path", "git log --no-merges -M --numstat", reason);
    failRows("whitespace-only or rename-only commits", "git log -z --numstat -w -M", reason);
    failRows("committer date more than 30 days after author date (rebase, cherry-pick or backdating; the history cannot tell which)", "%cI against %aI", reason);
    failRows("authors sharing a name", "git log author name and address (mailmap applied)", reason);
  } else {
    const recs = touched.map((t) => t.rec);
    // (4)
    const byAuthor = new Map<string, { name: string; n: number; first: string; last: string }>();
    for (const r of recs) {
      const key = foldIdentity(r.name);
      const e = byAuthor.get(key) ?? { name: show(r.name), n: 0, first: r.authorDate, last: r.authorDate };
      e.n++;
      if (Date.parse(r.authorDate) < Date.parse(e.first)) e.first = r.authorDate;
      if (Date.parse(r.authorDate) > Date.parse(e.last)) e.last = r.authorDate;
      byAuthor.set(key, e);
    }
    const top5 = [...byAuthor.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).slice(0, LIST);
    rows.push({ label: "commits touching the path", value: `${plural(recs.length, "non-merge commit")} by ${plural(byAuthor.size, "author")}`, basis: "git log --no-merges -M --numstat; a file is followed through its renames" });
    for (const a of top5) rows.push({ label: `  ${a.name}`, value: `${a.n} commits, first ${day(a.first)}, last ${day(a.last)}`, basis: "author date" });

    // (5) a commit counts when every change to the path, under -w, has 0 added and 0 deleted lines.
    if (!wsHist.ok) failRows("whitespace-only or rename-only commits", "git log -z --numstat -w -M", wsHist.reason);
    else {
      const wsBy = new Map<string, Rec>();
      for (const r of wsHist.value) wsBy.set(r.sha, r);
      const wsOnly = touched.filter((t) => {
        const w = wsBy.get(t.rec.sha);
        if (!w) return true;
        const paths = new Set(t.changes.flatMap((c) => [c.path, ...(c.from !== undefined ? [c.from] : [])]));
        return w.changes.filter((c) => paths.has(c.path) || (c.from !== undefined && paths.has(c.from))).every((c) => c.added === 0 && c.deleted === 0);
      }).map((t) => t.rec);
      rows.push({ label: "whitespace-only or rename-only commits", value: `${wsOnly.length} of ${recs.length} commits`, basis: "git log -z --numstat -w -M: every change to the path has 0 added and 0 deleted lines. A re-indent that renames the file in the same commit is not found by this rule" });
      for (const r of wsOnly.slice(0, LIST)) rows.push({ label: `  ${sha7(r.sha)}`, value: `${show(r.name)} ${day(r.authorDate)} ${show(r.subject, SUBJECT_CAP)}`, basis: "" });
    }

    // (6)
    const backdated = recs.filter((r) => Date.parse(r.committerDate) - Date.parse(r.authorDate) > BACKDATE_DAYS * DAY_MS);
    rows.push({ label: "committer date more than 30 days after author date (rebase, cherry-pick or backdating; the history cannot tell which)", value: `${backdated.length}`, basis: "%cI against %aI" });
    for (const r of backdated.slice(0, LIST)) rows.push({ label: `  ${sha7(r.sha)}`, value: `${show(r.name)}, author ${day(r.authorDate)}, committer ${day(r.committerDate)}`, basis: "" });

    // (7) names only: an address is counted, never printed.
    const nameToAddr = new Map<string, { name: string; addrs: Set<string> }>();
    const addrToName = new Map<string, Map<string, string>>();
    for (const r of recs) {
      const nk = foldIdentity(r.name);
      const ek = foldIdentity(r.email);
      const n = nameToAddr.get(nk) ?? { name: show(r.name), addrs: new Set<string>() };
      n.addrs.add(ek);
      nameToAddr.set(nk, n);
      const names = addrToName.get(ek) ?? new Map<string, string>();
      names.set(nk, show(r.name));
      addrToName.set(ek, names);
    }
    const multiName = [...nameToAddr.values()].filter((n) => n.addrs.size > 1);
    const multiAddr = [...addrToName.values()].filter((names) => names.size > 1);
    rows.push({ label: "authors sharing a name", value: multiName.length ? `${plural(multiName.length, "name")} with more than one address` : "none", basis: "%aN with %aE (mailmap applied), folded with foldIdentity" });
    for (const n of multiName.slice(0, LIST)) rows.push({ label: `  ${n.name}`, value: plural(n.addrs.size, "address", "addresses"), basis: "" });
    rows.push({ label: "addresses sharing a name", value: multiAddr.length ? `${plural(multiAddr.length, "address", "addresses")} with more than one name` : "none", basis: "%aE with %aN (mailmap applied); addresses are counted, not printed" });
    for (const [i, names] of multiAddr.slice(0, LIST).entries()) rows.push({ label: `  address ${i + 1}`, value: [...names.values()].join(", "), basis: "" });
  }

  // (7b) People: addresses joined by evidence, formatting-only commits skipped, co-author credit. Computed on its own.
  const peopleView = await attempt(async () => {
    const { commits: log } = await readLog(top);
    const grouped = groupPeople(log.map((c) => ({ sha: c.sha, email: c.email, name: c.name, body: c.body, parents: c.parents, committerEmail: c.committerEmail })));
    const personOf = new Map<string, number>();
    grouped.people.forEach((p, i) => p.emails.forEach((e) => personOf.set(e, i)));
    const botMail = new Set(grouped.bots.flatMap((b) => b.emails));
    const formatting = await formattingOnlyCommits(top);
    const ignore = formatting.map((f) => f.sha);
    const perFile: BlameLine[][] = [];
    for (const f of readFiles) perFile.push(await blameLines(top, f, true, ignore));
    const coOf = new Map(log.map((c) => [c.sha, c] as const));
    return { grouped, personOf, botMail, formatting, perFile, coOf };
  });
  if (!peopleView.ok) {
    rows.push({ label: "surviving lines by person, formatting-only commits skipped", value: notComputed(peopleView.reason), basis: "git blame -w -C --ignore-rev; people grouped by evidence" });
  } else {
    const { grouped, personOf, botMail, formatting, perFile, coOf } = peopleView.value;
    rows.push({
      label: "formatting-only commits (skipped in the next rows)",
      value: formatting.length ? `${formatting.length}` : "none",
      basis: "commits whose added lines equal their removed lines after whitespace, quote characters and trailing commas are ignored (git blame -w ignores whitespace only); passed to git blame --ignore-rev",
    });
    for (const f of formatting.slice(0, LIST)) rows.push({ label: `  ${sha7(f.sha)}`, value: `${f.lines} lines in ${plural(f.files, "file")} "${show(f.subject, SUBJECT_CAP)}"`, basis: "" });
    const lines = perFile.flat();
    const bot = lines.filter((l) => botMail.has(l.mail.toLowerCase())).length;
    const human = lines.filter((l) => !botMail.has(l.mail.toLowerCase()));
    const byPerson = new Map<number, number>();
    const unknown = new Map<string, number>();
    for (const l of human) {
      const i = personOf.get(l.mail.toLowerCase());
      if (i === undefined) unknown.set(show(l.name), (unknown.get(show(l.name)) ?? 0) + 1);
      else byPerson.set(i, (byPerson.get(i) ?? 0) + 1);
    }
    const ranked = [...byPerson].map(([i, n]) => ({ name: show(grouped.people[i]!.name), n, joined: grouped.people[i]!.emails.length })).concat([...unknown].map(([name, n]) => ({ name, n, joined: 1 }))).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
    const humanTotal = human.length;
    rows.push({
      label: "surviving lines by person, formatting-only commits skipped, addresses joined by evidence",
      value: `${plural(humanTotal, "line")} not by a bot (${bot} bot ${bot === 1 ? "line" : "lines"} left out)`,
      basis: "git blame -w -C --ignore-rev at HEAD; bots by name or noreply bot address; people joined as in workproof people (proven and probable joins)",
    });
    for (const r of ranked.slice(0, LIST)) rows.push({ label: `  ${r.name}`, value: `${plural(r.n, "line")} (${share(r.n, humanTotal)})${r.joined > 1 ? `, ${r.joined} addresses joined` : ""}`, basis: "" });
    if (claim !== undefined) {
      const key = foldIdentity(claim);
      const idx = grouped.people.findIndex((p) => p.emails.some((e) => foldIdentity(e) === key) || p.names.some((n) => foldIdentity(n) === key));
      if (idx < 0) rows.push({ label: `claim person: ${show(claim)}`, value: "no person in this history has that name or address", basis: "people grouping by evidence" });
      else {
        const p = grouped.people[idx]!;
        const mine = new Set(p.emails);
        const names = new Set(p.names.map(foldIdentity));
        const direct = human.filter((l) => mine.has(l.mail.toLowerCase())).length;
        const shared = human.filter((l) => {
          if (mine.has(l.mail.toLowerCase())) return false;
          const c = coOf.get(l.sha);
          return !!c && (c.coAuthors.some((e) => mine.has(e)) || c.coAuthorNames.some((n) => names.has(foldIdentity(n))));
        });
        const sharedCommits = new Set(shared.map((l) => l.sha));
        rows.push({
          label: `claim person: ${show(p.name)}`,
          value: `direct surviving lines ${direct} (${share(direct, humanTotal)} of ${humanTotal} not by a bot); lines in commits under another name that credit ${show(p.name)} as Co-authored-by ${shared.length} in ${plural(sharedCommits.size, "commit")}, upper bound with that credit ${direct + shared.length} (${share(direct + shared.length, humanTotal)})`,
          basis: `${p.emails.length} ${p.emails.length === 1 ? "address" : "addresses"} joined${p.emails.length > 1 ? " (" + [...new Set(grouped.merges.filter((m) => mine.has(m.a) && mine.has(m.b)).map((m) => `${m.rule}, ${m.strength}`))].join("; ") + ")" : ""}; formatting-only commits skipped; the address is never printed`,
        });
      }
    }
  }

  // (8) claim: each part is computed on its own, so one failed git call does not hide the others.
  if (claim !== undefined) {
    const claimLabel = `claim: ${show(claim)}`;
    const matchedCommits = touched ? touched.filter((t) => matchRec(t.rec)).length : undefined;
    const known = blameWs.ok && blamePlain.ok && touched !== undefined && creation.ok;
    if (known && blameWs.value.claimLines === 0 && blamePlain.value.claimLines === 0 && matchedCommits === 0 && !(creator && matchRec(creator))) {
      rows.push({ label: claimLabel, value: "claim matched no name or address on this path", basis: "matched by folded name or address" });
    } else {
      const surv = blameWs.ok ? share(blameWs.value.claimLines, blameWs.value.total) : notComputed(blameWs.reason);
      const plainShare = blamePlain.ok ? share(blamePlain.value.claimLines, blamePlain.value.total) : notComputed(blamePlain.reason);
      const commits = matchedCommits === undefined ? notComputed(plain.ok ? "no history" : plain.reason) : plural(matchedCommits, "commit");
      const created = !creation.ok ? notComputed(creation.reason) : creator && matchRec(creator) ? "yes" : "no";
      rows.push({
        label: claimLabel,
        value: `surviving lines ${surv} (whitespace and moves ignored), plain blame ${plainShare}; ${commits} on the path; ${kind === "file" ? "created the file" : "first file added here"}: ${created}`,
        basis: "matched by folded name or address; the address is never printed",
      });
    }
  }

  return {
    path: show(opts.path, PATH_CAP),
    kind,
    repo: show(top, PATH_CAP),
    files: readFiles.length + excluded.length + submodules.length + symlinks.length,
    notes,
    rows,
    ...(claim !== undefined ? { claim: show(claim), sentence: OWNER_SENTENCE } : {}),
  };
}

export function renderOwner(r: OwnerReport): string {
  const out: string[] = [];
  out.push(`owner: ${r.path} (${r.kind}), ${plural(r.files, "file")} at HEAD in ${r.repo}`);
  for (const n of r.notes) out.push(`  ${n}`);
  for (const row of r.rows) out.push(`${row.label} | ${row.value}${row.basis ? ` | ${row.basis}` : ""}`);
  if (r.sentence) out.push(r.sentence);
  return `${out.join("\n")}\n`;
}

/** `workproof owner`: returns the exit code, 0 whenever it ran and 1 for a usage error or a refused path. */
export async function runOwner(args: string[], out: { write(s: string): unknown } = process.stdout): Promise<number> {
  let opts: OwnerOptions;
  try {
    opts = parseOwnerArgs(args);
  } catch (err) {
    console.error(`${err instanceof Error ? err.message : String(err)}\n${OWNER_USAGE}`);
    return 1;
  }
  let report: OwnerReport;
  try {
    report = await computeOwner(opts);
  } catch (err) {
    console.error(`workproof owner: ${show(err instanceof Error ? err.message : String(err), 300)}`);
    return 1;
  }
  out.write(opts.json ? `${JSON.stringify(report, null, 2)}\n` : renderOwner(report));
  return 0;
}
