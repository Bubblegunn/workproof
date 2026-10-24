import { execFile } from "node:child_process";
import { posix } from "node:path";
import { PINNED_CONFIG } from "./git.js";
import { foldIdentity } from "./figures/identity.js";

/**
 * `workproof owner`: checks a claim that one person wrote or owns a file or directory, from its
 * history at HEAD. It is read-only and states no verdict; each row says what it was computed from.
 * A row that git could not compute says so and is never printed as zero.
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
const BLAME_CAP_MS = 120_000;
const BACKDATE_DAYS = 30;
const LIST = 5;
const LOCK_FILES = new Set(["package-lock.json", "yarn.lock", "Cargo.lock", "go.sum", "poetry.lock", "Gemfile.lock", "pnpm-lock.yaml"]);
const GENERATED_HEADER = /generated|do not edit/i;
const FORMAT = "%x1e%H%x1f%aN%x1f%aE%x1f%aI%x1f%cI%x1f%s";
/** One line per commit, no record separator: the creation query is not split on it. */
const CREATION_FORMAT = "%H%x1f%aN%x1f%aE%x1f%aI%x1f%cI%x1f%s";
const DAY_MS = 86_400_000;

/** Strips control characters: names, subjects and paths are data, not layout. */
export const clean = (s: string): string => s.replace(/[\u0000-\u001f\u007f-\u009f]/g, "");

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

/** Runs git with the pinned configuration and a per-call timeout. Rejects with a short reason. */
function run(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", [...PINNED_CONFIG, ...args], { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 256, timeout: GIT_TIMEOUT_MS }, (err, stdout, stderr) => {
      if (!err) return resolve(stdout);
      if ((err as { killed?: boolean }).killed) return reject(new Error(`timed out after ${GIT_TIMEOUT_MS / 1000} s`));
      const text = clean(String(stderr || err.message)).trim().split("\n")[0] ?? "git failed";
      reject(new Error(text.slice(0, 200)));
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

/** Non-merge commits reachable from HEAD with per-file numstat. `ws` adds -w, which ignores whitespace. */
async function loadHistory(top: string, ws: boolean): Promise<Rec[]> {
  const args = ["log", "--no-merges", "-M", "--numstat", ...(ws ? ["-w"] : []), `--format=${FORMAT}`, "HEAD"];
  const out = await run(args, top);
  const recs: Rec[] = [];
  for (const block of out.split("\x1e")) {
    if (!block.trim()) continue;
    const nl = block.indexOf("\n");
    const header = nl < 0 ? block : block.slice(0, nl);
    const rest = nl < 0 ? "" : block.slice(nl + 1);
    const [sha, name, email, authorDate, committerDate, subject] = header.split("\x1f");
    if (!sha || committerDate === undefined) continue;
    const changes: Change[] = [];
    for (const line of rest.split("\n")) {
      if (!line.trim()) continue;
      const [a, d, ...pathParts] = line.split("\t");
      let path = pathParts.join("\t");
      let from: string | undefined;
      const brace = path.match(/^(.*)\{(.*) => (.*)\}(.*)$/);
      if (brace) {
        from = `${brace[1]}${brace[2]}${brace[4]}`;
        path = `${brace[1]}${brace[3]}${brace[4]}`;
      } else if (path.includes(" => ")) {
        [from, path] = path.split(" => ") as [string, string];
      }
      changes.push({ path, ...(from ? { from } : {}), added: a === "-" ? null : Number(a), deleted: d === "-" ? null : Number(d) });
    }
    recs.push({ sha, name: name ?? "", email: (email ?? "").toLowerCase(), authorDate: authorDate ?? "", committerDate, subject: subject ?? "", changes });
  }
  return recs;
}

interface BlameLine {
  name: string;
  mail: string;
}

/** Blames one file at HEAD. Blame applies .mailmap itself, so names are the resolved ones. */
async function blameLines(top: string, file: string, ws: boolean): Promise<BlameLine[]> {
  const args = ["blame", ...(ws ? ["-w", "-M", "-C"] : []), "--line-porcelain", "HEAD", "--", file];
  const out = await run(args, top);
  const lines: BlameLine[] = [];
  let cur: { name?: string; mail?: string } | undefined;
  for (const line of out.split("\n")) {
    if (/^[0-9a-f]{40,64} \d+ \d+/.test(line)) cur = {};
    else if (!cur) continue;
    else if (line.startsWith("author ")) cur.name = line.slice(7);
    else if (line.startsWith("author-mail ")) cur.mail = line.slice(12).replace(/^<|>$/g, "");
    else if (line.startsWith("\t")) {
      lines.push({ name: cur.name ?? "", mail: cur.mail ?? "" });
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
      const entry = byKey.get(key) ?? { name: clean(l.name), lines: 0 };
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

const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

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
  const started = Date.now();
  const repo = opts.repo;
  const loc = (await run(["rev-parse", "--show-toplevel", "--show-prefix"], repo)).split("\n");
  const top = loc[0] ?? "";
  const prefix = (loc[1] ?? "").replace(/\/+$/, "");
  if (!top) throw new Error(`${repo} is not a git repository`);

  const rel = posix.normalize(opts.path).replace(/\/+$/, "");
  if (rel === ".." || rel.startsWith("../")) throw new Error(`--path must stay inside the repository`);
  const target = rel === "." ? prefix : posix.join(prefix, rel);

  const headFiles = (await run(["ls-tree", "-r", "-z", "--full-tree", "--name-only", "HEAD"], top)).split("\0").filter(Boolean);
  const under = (p: string) => target === "" || p === target || p.startsWith(`${target}/`);
  const matched = headFiles.filter(under);
  if (!matched.length) throw new Error(`no file at HEAD matches ${clean(opts.path)} (looked under ${clean(top)})`);
  const kind: "file" | "directory" = matched.length === 1 && matched[0] === target ? "file" : "directory";
  const notes: string[] = [];
  let files = matched;
  if (files.length > MAX_FILES) {
    notes.push(`only the first ${MAX_FILES} files were read (${files.length} files at HEAD under the path)`);
    files = files.slice(0, MAX_FILES);
  }
  notes.push(`limits: ${MAX_FILES} files, ${GIT_TIMEOUT_MS / 1000} s per git call, ${BLAME_CAP_MS / 1000} s for all blame calls together`);

  // Classify each file: left out for a generated header, a lock file or a minified bundle; or read.
  const readFiles: string[] = [];
  const excluded: { path: string; reason: string; lines: number }[] = [];
  let classifyError: string | undefined;
  for (const f of files) {
    const base = posix.basename(f);
    let reason: string | undefined = LOCK_FILES.has(base) ? "lock file" : base.endsWith(".min.js") ? "minified" : undefined;
    let lines = 0;
    if (classifyError === undefined) {
      const blob = await attempt(() => run(["cat-file", "blob", `HEAD:${f}`], top));
      if (!blob.ok) classifyError = blob.reason;
      else {
        const text = blob.value;
        lines = text === "" ? 0 : text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
        if (!reason && text.split("\n", 5).some((l) => GENERATED_HEADER.test(l))) reason = "generated header";
      }
    }
    if (reason !== undefined && classifyError === undefined) excluded.push({ path: f, reason, lines });
    else readFiles.push(f);
  }
  const reasonCount = (r: string) => excluded.filter((e) => e.reason === r).length;
  const excludedLines = excluded.reduce((n, e) => n + e.lines, 0);
  for (const e of excluded.slice(0, LIST)) notes.push(`left out: ${clean(e.path)} (${e.reason}, ${e.lines} lines)`);
  if (excluded.length > LIST) notes.push(`left out: ${excluded.length - LIST} more files`);

  // Blame, one file at a time, under the overall cap.
  const blameBoth = async (ws: boolean): Promise<Got<Tally>> => {
    if (classifyError !== undefined) return { ok: false, reason: classifyError };
    return attempt(async () => {
      const perFile: BlameLine[][] = [];
      for (let i = 0; i < readFiles.length; i++) {
        if (Date.now() - started > BLAME_CAP_MS) throw new Error(`the ${BLAME_CAP_MS / 1000} s cap for all blame calls was reached after ${i} of ${readFiles.length} files`);
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
  const creation = await attempt(() =>
    run(kind === "file" ? ["log", "--follow", "--diff-filter=A", `--format=${CREATION_FORMAT}`, "HEAD", "--", target] : ["log", "--diff-filter=A", `--format=${CREATION_FORMAT}`, "HEAD", "--", target === "" ? "." : target], top),
  );

  const rows: OwnerRow[] = [];
  const claim = opts.claim;
  const cFold = claim === undefined ? undefined : foldIdentity(claim);
  const matchRec = (r: { name: string; email: string }) => cFold !== undefined && (foldIdentity(r.name) === cFold || foldIdentity(r.email) === cFold);

  // (1) and (2): blame, side by side.
  const basis1 = "git blame -w -M -C --line-porcelain at HEAD, per file; .mailmap applied by blame";
  const basis2 = "git blame --line-porcelain at HEAD, per file (no -w, -M or -C); .mailmap applied by blame";
  const excludedBasis = "lock file name; *.min.js name; \"generated\", \"DO NOT EDIT\" or \"auto-generated\" in the first 5 lines";
  const excludedRow: OwnerRow = { label: "left out of the two blame rows", value: `${plural(excluded.length, "file")}, ${excludedLines} lines: lock file ${reasonCount("lock file")}, minified ${reasonCount("minified")}, generated header ${reasonCount("generated header")}`, basis: excludedBasis };
  rows.push(...blameRows("surviving lines by author, whitespace and moves ignored", basis1, blameWs), ...blameRows("surviving lines by author, plain blame", basis2, blamePlain), excludedRow);

  // (3) creation.
  const createdRow: OwnerRow = { label: "file created by", value: "", basis: kind === "file" ? "git log --follow --diff-filter=A (renames followed); the earliest such commit" : "git log --diff-filter=A under the path; the earliest such commit" };
  let creator: { name: string; email: string } | undefined;
  if (!creation.ok) createdRow.value = notComputed(creation.reason);
  else {
    const lines = creation.value.split("\n").filter((l) => l.split("\x1f").length === 6 && l.length > 40);
    const last = lines[lines.length - 1];
    if (!last) createdRow.value = "not computed (no commit added a file here)";
    else {
      const [sha, name, email, ad, cd, subject] = last.split("\x1f") as [string, string, string, string, string, string];
      creator = { name, email: email.toLowerCase() };
      createdRow.value = `${clean(name)} <${clean(email)}>, author date ${day(ad)}, committer date ${day(cd)}, ${sha7(sha)} "${clean(subject)}"`;
    }
  }
  rows.push(createdRow);

  // (4)-(7): commits on the path. A file is followed back through its renames; a directory by prefix.
  const failRows = (label: string, basis: string, reason: string) => rows.push({ label, value: notComputed(reason), basis });
  if (!plain.ok) {
    failRows("commits touching the path", "git log --no-merges -M --numstat", plain.reason);
    failRows("whitespace-only or rename-only commits", "git log --numstat -w -M", plain.reason);
    failRows("backdated commits", "author date against committer date", plain.reason);
    failRows("authors sharing a name", "git log author name and address (mailmap applied)", plain.reason);
  } else {
    const touched = touchingCommits(plain.value, kind, target);
    const recs = touched.map((t) => t.rec);
    // (4)
    const byAuthor = new Map<string, { name: string; n: number; first: string; last: string }>();
    for (const r of recs) {
      const key = foldIdentity(r.name);
      const e = byAuthor.get(key) ?? { name: clean(r.name), n: 0, first: r.authorDate, last: r.authorDate };
      e.n++;
      if (Date.parse(r.authorDate) < Date.parse(e.first)) e.first = r.authorDate;
      if (Date.parse(r.authorDate) > Date.parse(e.last)) e.last = r.authorDate;
      byAuthor.set(key, e);
    }
    const top5 = [...byAuthor.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)).slice(0, LIST);
    rows.push({ label: "commits touching the path", value: `${recs.length} non-merge commits by ${plural(byAuthor.size, "author")}`, basis: "git log --no-merges -M --numstat; a file is followed through its renames" });
    for (const a of top5) rows.push({ label: `  ${a.name}`, value: `${a.n} commits, first ${day(a.first)}, last ${day(a.last)}`, basis: "author date" });

    // (5) a commit counts when every change to the path, under -w, has 0 added and 0 deleted lines.
    if (!wsHist.ok) failRows("whitespace-only or rename-only commits", "git log --numstat -w -M", wsHist.reason);
    else {
      const wsBy = new Map<string, Rec>();
      for (const r of wsHist.value) wsBy.set(r.sha, r);
      const wsOnly = touched.filter((t) => {
        const w = wsBy.get(t.rec.sha);
        if (!w) return true;
        const paths = new Set(t.changes.flatMap((c) => [c.path, ...(c.from !== undefined ? [c.from] : [])]));
        return w.changes.filter((c) => paths.has(c.path) || (c.from !== undefined && paths.has(c.from))).every((c) => c.added === 0 && c.deleted === 0);
      }).map((t) => t.rec);
      rows.push({ label: "whitespace-only or rename-only commits", value: `${wsOnly.length} of ${recs.length} commits`, basis: "git log --numstat -w -M: every change to the path has 0 added and 0 deleted lines. A re-indent that renames the file in the same commit is not found by this rule" });
      for (const r of wsOnly.slice(0, LIST)) rows.push({ label: `  ${sha7(r.sha)}`, value: `${clean(r.name)} ${day(r.authorDate)} ${clean(r.subject)}`, basis: "" });
    }

    // (6)
    const backdated = recs.filter((r) => Date.parse(r.committerDate) - Date.parse(r.authorDate) > BACKDATE_DAYS * DAY_MS);
    rows.push({ label: "backdated commits", value: `${backdated.length} (committer date more than ${BACKDATE_DAYS} days after author date)`, basis: "%cI against %aI" });
    for (const r of backdated.slice(0, LIST)) rows.push({ label: `  ${sha7(r.sha)}`, value: `${clean(r.name)}, author ${day(r.authorDate)}, committer ${day(r.committerDate)}`, basis: "" });

    // (7)
    const nameToAddr = new Map<string, { name: string; addrs: Map<string, string> }>();
    const addrToName = new Map<string, { addr: string; names: Map<string, string> }>();
    for (const r of recs) {
      const nk = foldIdentity(r.name);
      const ek = foldIdentity(r.email);
      const n = nameToAddr.get(nk) ?? { name: clean(r.name), addrs: new Map<string, string>() };
      n.addrs.set(ek, clean(r.email));
      nameToAddr.set(nk, n);
      const a = addrToName.get(ek) ?? { addr: clean(r.email), names: new Map<string, string>() };
      a.names.set(nk, clean(r.name));
      addrToName.set(ek, a);
    }
    const multiName = [...nameToAddr.values()].filter((n) => n.addrs.size > 1);
    const multiAddr = [...addrToName.values()].filter((a) => a.names.size > 1);
    rows.push({ label: "authors sharing a name", value: multiName.length ? `${plural(multiName.length, "name")} with more than one address` : "none", basis: "%aN with %aE (mailmap applied), folded with foldIdentity" });
    for (const n of multiName.slice(0, LIST)) rows.push({ label: `  ${n.name}`, value: [...n.addrs.values()].join(", "), basis: "" });
    rows.push({ label: "addresses sharing a name", value: multiAddr.length ? `${plural(multiAddr.length, "address", "addresses")} with more than one name` : "none", basis: "%aE with %aN (mailmap applied)" });
    for (const a of multiAddr.slice(0, LIST)) rows.push({ label: `  ${a.addr}`, value: [...a.names.values()].join(", "), basis: "" });
  }

  // (8) claim: each part is computed on its own, so one failed git call does not hide the others.
  if (claim !== undefined) {
    const surv = blameWs.ok ? share(blameWs.value.claimLines, blameWs.value.total) : notComputed(blameWs.reason);
    const plainShare = blamePlain.ok ? share(blamePlain.value.claimLines, blamePlain.value.total) : notComputed(blamePlain.reason);
    const commits = plain.ok ? plural(touchingCommits(plain.value, kind, target).filter((t) => matchRec(t.rec)).length, "commit") : notComputed(plain.reason);
    const created = !creation.ok ? notComputed(creation.reason) : creator !== undefined && matchRec(creator) ? "yes" : "no";
    rows.push({
      label: `claim: ${clean(claim)}`,
      value: `surviving lines ${surv} (whitespace and moves ignored), plain blame ${plainShare}; ${commits} on the path; ${kind === "file" ? "created the file" : "first file added here"}: ${created}`,
      basis: "matched by folded name or address",
    });
  }

  return {
    path: clean(opts.path),
    kind,
    repo: clean(top),
    files: readFiles.length + excluded.length,
    notes,
    rows,
    ...(claim !== undefined ? { claim: clean(claim), sentence: OWNER_SENTENCE } : {}),
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
    console.error(`workproof owner: ${clean(err instanceof Error ? err.message : String(err))}`);
    return 1;
  }
  out.write(opts.json ? `${JSON.stringify(report, null, 2)}\n` : renderOwner(report));
  return 0;
}
