import { createHash, createHmac, randomBytes } from "node:crypto";
import { basename } from "node:path";
import { createRequire } from "node:module";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { listCommits, listTags, rootCommit, headSha, remoteUrl, assertRepository, assertNotShallow, gitVersion, checkAttr, listHeadFiles } from "./git.js";
import type { Commit } from "./git.js";
import type { Identity } from "./figures/types.js";
import { isBot, excludedSet } from "./exclusions.js";
// surviving-lines ships plain ESM JavaScript without type declarations.
// @ts-ignore
import { globToRegExp } from "surviving-lines/bin/surviving-lines.js";
import { resolveIdentity, foldIdentity, possibleSplits, mergeSplits, isMine, SPLIT_HINT } from "./figures/identity.js";
import { tenure, commitShare } from "./figures/commits.js";
import { cadence } from "./figures/cadence.js";
import { footprint, testsAndDocs } from "./figures/footprint.js";
import { survivingLines, blameFlags } from "./figures/surviving.js";
import { filesAuthored, majorContributor, commitSize, coAuthored, absenceFactor, aiAssisted, survivalByCohort } from "./figures/authorship.js";
import type { Figure } from "./figures/types.js";

export interface Params {
  author?: string[];
  since?: string;
  until?: string;
  sample?: number;
  depth: number;
  threshold: number;
  minCommits: number;
  paths: boolean;
  emails: boolean;
  /** Escape hatch for enormous histories: read only the newest n commits. */
  maxCommits?: number;
  /** Drop bot commits and generated, vendored, lock and snapshot files (default true). */
  exclusions?: boolean;
  /** Extra globs to drop, with surviving-lines semantics. */
  exclude?: string[];
  /** Salt for the blame file sample. */
  seed?: string;
  /** Pass -C to git blame so copied lines follow their origin. */
  copies?: boolean;
  /** A blame ignore-revs file other than .git-blame-ignore-revs at the root. */
  ignoreRevsFile?: string;
  /** Key for the repository fingerprint; generated per report when absent. */
  fingerprintKey?: string;
  /**
   * Verifier only, never written to a report: the keyed hashes of the addresses the report
   * counted (RepoReport identity.keys). With the fingerprint key they select exactly those
   * addresses, however the report's author was chosen.
   */
  identityKeys?: string[];
  /**
   * Set to false only by --no-merge-identities. Without it, an identity taken from git config
   * absorbs the addresses that look like the same person (see mergeSplits). An explicit author
   * is always exact, whatever this says.
   */
  mergeIdentities?: boolean;
}

export interface MergeNotice {
  repo: string;
  /** Full addresses, for the terminal only: the report never carries them without emails. */
  emails: string[];
  /** The fixed category strings of SPLIT_CATEGORY. */
  reasons: string[];
}

export interface AnalyseHooks {
  /** Called with short status lines while history is read and files are blamed. */
  progress?: (message: string) => void;
  /** Called once for a repository whose identity absorbed other addresses, before any figure. */
  merged?: (notice: MergeNotice) => void;
}

/** The items behind the excluded counts, for a reader who asks which ones. Commit ids are short (7 characters). */
export interface ExcludedItems {
  /** Merge commits by the author inside the window. */
  mergeCommits: { count: number; ids: string[] };
  /** Excluded paths the author touched in the window, with the lines they added and deleted; names only with --paths. */
  paths: { count: number; added: number; deleted: number; files: { path: string; added: number; deleted: number }[]; hidden: boolean };
  /** Non-merge commits by the author outside the window, nearest first (at most 10 listed); present only when --since or --until was given. */
  outsideWindow?: { count: number; commits: { id: string; date: string }[] };
}

export interface RepoReport {
  name: string;
  head: string;
  fingerprint: string;
  /** True when the fingerprint is an HMAC under a key the report does not carry. */
  fingerprintKeyed?: boolean;
  identity: {
    emails: string[];
    names: string[];
    count: number;
    /**
     * One keyed hash per counted address (identityKey), so a verifier holding the fingerprint
     * key can select the same addresses while the report carries none. Reports written before
     * this field exist have no keys; verify then resolves by shown emails or names as before.
     */
    keys?: string[];
    /** Addresses here that look like the subject and were not counted as them. */
    possiblySplit?: { count?: number; hint?: string; names: string[]; emails?: string[]; reasons: string[] };
    /** Addresses merged into the identity by default, with the fixed categories that merged them. */
    merged?: { count: number; reasons: string[]; emails?: string[] };
  };
  /** What the figures were computed with, so a verifier can tell a drift from an edit. */
  environment: { git: string; blame: string[]; ignoreRevs: string | null; seed: string };
  /** What left the denominators before any figure was computed. */
  excluded: { botCommits: number; files: number; linesAddedShare: number; enabled: boolean; items?: ExcludedItems };
  /** Lines the author added and deleted in the window, non-merge commits, after the exclusions. */
  windowLines?: { added: number; deleted: number };
  figures: Figure<any>[];
}

/** A fresh 16-byte fingerprint key as hex. Printed once, stored nowhere. */
export const newFingerprintKey = (): string => randomBytes(16).toString("hex");

const NOREPLY = /@users\.noreply\.github\.com$/i;
/** What a GitHub noreply address is written as when emails are shown; it is not an address. */
export const NOREPLY_PLACEHOLDER = "(github noreply)";
/** GitHub noreply addresses carry the login in the local part, so they are never written out. */
export const publicEmail = (email: string): string => (NOREPLY.test(email) ? NOREPLY_PLACEHOLDER : email);

/**
 * HMAC-SHA256 under the fingerprint key of one address, folded as foldIdentity folds it, with
 * a domain-separation prefix so it can never equal a repository fingerprint. Without the key
 * the value cannot be tested against a guessed address.
 */
export const identityKey = (key: string, email: string): string =>
  createHmac("sha256", Buffer.from(key, "hex")).update(`workproof-identity\n${foldIdentity(email)}`).digest("hex");

/**
 * Identifies a repository without naming it. Keyed: HMAC-SHA256 under a per-report key of
 * the root commit and the normalised remote, so a reader cannot look a public repository
 * up from its fingerprint. Unkeyed (no key given): plain sha256, kept for callers that
 * want a stable public identifier.
 */
export function fingerprint(root: string, remote: string, key?: string): string {
  let r = remote.trim().toLowerCase().replace(/\.git$/, "");
  r = r.replace(/^[a-z+]+:\/\//, "").replace(/^git@([^:]+):/, "$1/");
  const text = `${root}\n${r}`;
  return key === undefined ? createHash("sha256").update(text).digest("hex") : createHmac("sha256", Buffer.from(key, "hex")).update(text).digest("hex");
}

const require = createRequire(import.meta.url);
const survivingVersion = (): string => {
  try {
    return require("surviving-lines/package.json").version as string;
  } catch {
    return "unknown";
  }
};

/** The identity made of every address whose keyed hash is listed, or undefined when none is. */
function identityByKeys(commits: Commit[], keys: string[], key: string): Identity | undefined {
  const wanted = new Set(keys);
  const emails = new Set<string>();
  const names = new Set<string>();
  for (const c of commits) {
    if (wanted.has(identityKey(key, c.email))) {
      emails.add(c.email);
      names.add(c.name);
    }
  }
  return emails.size ? { emails: [...emails].sort(), names: [...names].sort() } : undefined;
}

async function ignoreRevsFor(cwd: string, params: Params): Promise<string | null> {
  if (params.ignoreRevsFile) return params.ignoreRevsFile;
  try {
    await access(join(cwd, ".git-blame-ignore-revs"));
    return ".git-blame-ignore-revs";
  } catch {
    return null;
  }
}

/** Bot commits out, excluded paths out of every commit's file list; the untouched copy stays for the share. */
export async function applyExclusions(cwd: string, all: Commit[], params: Params) {
  const enabled = params.exclusions !== false;
  const extra = (params.exclude ?? []).map((g: string) => globToRegExp(g) as RegExp);
  const botCommits = enabled ? all.filter(isBot).length : 0;
  const human = enabled ? all.filter((c) => !isBot(c)) : all;
  const headFiles = await listHeadFiles(cwd);
  const paths = new Set<string>(headFiles);
  for (const c of human) for (const f of c.files) paths.add(f.path);
  const attrs = enabled ? await checkAttr(cwd, [...paths]) : new Map();
  const excluded = excludedSet(paths, attrs, extra);
  if (!enabled) for (const p of [...excluded]) if (!extra.some((re) => re.test(p))) excluded.delete(p);
  const commits = human.map((c) => ({ ...c, files: c.files.filter((f) => !excluded.has(f.path)) }));
  return { commits, raw: human, excluded, botCommits, enabled, headFiles: new Set(headFiles.filter((p) => !excluded.has(p))) };
}

export async function analyseRepo(cwd: string, params: Params, hooks: AnalyseHooks = {}): Promise<RepoReport> {
  const say = hooks.progress ?? (() => {});
  await assertRepository(cwd);
  await assertNotShallow(cwd);
  const key = params.fingerprintKey ?? newFingerprintKey();
  if (!params.fingerprintKey) say(`fingerprint key ${key} (keep it to compare reports; it is not stored)`);
  say(`${basename(cwd)}: reading history${params.maxCommits ? ` (newest ${params.maxCommits} commits)` : ""}...`);
  const everything = await listCommits(cwd, params.maxCommits ? { max: params.maxCommits } : {});
  say(`${basename(cwd)}: ${everything.length.toLocaleString("en-US")} commits read`);
  const ex = await applyExclusions(cwd, everything, params);
  const all = ex.commits;
  // A verifier holding the key selects the addresses the report counted by their keyed hashes,
  // exactly, whatever way the report's author was chosen. Without a match it resolves as before.
  const keyed = params.identityKeys?.length ? identityByKeys(all, params.identityKeys, key) : undefined;
  const configured = keyed ?? (await resolveIdentity(all, params.author, cwd));
  // Before any figure is computed. Without --author the identity is whatever git config says,
  // which is one address of a person who may have several, so the addresses that look like the
  // same person are merged in by default. An explicit --author is exact and merges nothing.
  const explicit = !!keyed || !!(params.author && params.author.length);
  const { identity: id, merged } = !explicit && params.mergeIdentities !== false ? mergeSplits(all, configured) : { identity: configured, merged: undefined };
  if (merged) hooks.merged?.({ repo: basename(cwd), emails: merged.emails, reasons: merged.reasons });
  // Whatever is still a possible split after the merge (none when merging is on, and every
  // address when --author or --no-merge-identities is given).
  const splits = possibleSplits(all, id);
  const t = tenure(all, id, { ...(params.since ? { since: params.since } : {}), ...(params.until ? { until: params.until } : {}) });
  const start = new Date(t.value.first + "T00:00:00Z");
  const end = new Date(t.value.last + "T23:59:59Z");
  const inTenure = all.filter((c) => c.localDate >= start && c.localDate <= end);
  let addedAll = 0;
  let addedExcluded = 0;
  for (const c of ex.raw) {
    if (c.localDate < start || c.localDate > end || c.parents > 1) continue;
    for (const f of c.files) {
      if (f.added === null) continue;
      addedAll += f.added;
      if (ex.excluded.has(f.path)) addedExcluded += f.added;
    }
  }
  // Lines and excluded items of the author's own commits, so a question about them has a source in the report.
  let linesAdded = 0;
  let linesDeleted = 0;
  const excludedFiles = new Map<string, { added: number; deleted: number }>();
  for (const c of ex.raw) {
    if (c.localDate < start || c.localDate > end || c.parents > 1 || !isMine(c, id)) continue;
    for (const f of c.files) {
      if (ex.excluded.has(f.path)) {
        const row = excludedFiles.get(f.path) ?? { added: 0, deleted: 0 };
        row.added += f.added ?? 0;
        row.deleted += f.deleted ?? 0;
        excludedFiles.set(f.path, row);
      } else {
        linesAdded += f.added ?? 0;
        linesDeleted += f.deleted ?? 0;
      }
    }
  }
  const merges = all.filter((c) => c.parents > 1 && isMine(c, id) && c.localDate >= start && c.localDate <= end);
  const windowGiven = !!(params.since || params.until);
  const outside = windowGiven ? all.filter((c) => c.parents <= 1 && isMine(c, id) && (c.localDate < start || c.localDate > end)) : [];
  const gap = (c: Commit) => (c.localDate < start ? start.getTime() - c.localDate.getTime() : c.localDate.getTime() - end.getTime());
  const nearest = [...outside].sort((a, b) => gap(a) - gap(b)).slice(0, 10).sort((a, b) => a.localDate.getTime() - b.localDate.getTime());
  const excludedPaths = [...excludedFiles.entries()].map(([path, v]) => ({ path, ...v })).sort((a, b) => b.added - a.added || a.path.localeCompare(b.path));
  const items: ExcludedItems = {
    mergeCommits: { count: merges.length, ids: merges.slice(0, 20).map((c) => c.sha.slice(0, 7)) },
    paths: {
      count: excludedPaths.length,
      added: excludedPaths.reduce((n, p) => n + p.added, 0),
      deleted: excludedPaths.reduce((n, p) => n + p.deleted, 0),
      files: params.paths ? excludedPaths.slice(0, 50) : [],
      hidden: !params.paths,
    },
    ...(windowGiven ? { outsideWindow: { count: outside.length, commits: nearest.map((c) => ({ id: c.sha.slice(0, 7), date: c.localDate.toISOString().slice(0, 10) })) } } : {}),
  };
  const tags = await listTags(cwd);
  const sample = params.sample ?? (all.reduce((n, c) => n + c.files.length, 0) > 50000 ? 7 : 1);
  const ignoreRevs = await ignoreRevsFor(cwd, params);
  const blame = blameFlags(params.copies ?? false, ignoreRevs);
  const fp = footprint(inTenure, id, { depth: params.depth, threshold: params.threshold, minCommits: params.minCommits });
  if (!params.paths) {
    fp.value = { ...fp.value, ownedDirectories: fp.value.ownedDirectories.map((d) => ({ ...d, path: "(hidden; run with --paths)" })) };
  }
  const figures: Figure<any>[] = [
    t,
    commitShare(inTenure, id),
    cadence(inTenure, tags, id, { first: t.value.first, last: t.value.last }),
    fp,
    testsAndDocs(inTenure, id),
    filesAuthored(all, id, ex.headFiles),
    majorContributor(inTenure, id, params.depth),
    commitSize(inTenure, id),
    coAuthored(inTenure, id),
    absenceFactor(inTenure, id),
    aiAssisted(inTenure, id),
  ];
  say(`${basename(cwd)}: blaming files (1 in ${sample} sample)...`);
  const surviving = await survivingLines(cwd, id, {
    sample,
    seed: params.seed ?? "",
    exclude: params.exclude ?? [],
    copies: params.copies ?? false,
    ignoreRevsFile: ignoreRevs,
    excluded: ex.excluded,
    version: survivingVersion(),
  });
  say(`${basename(cwd)}: blamed ${surviving.value.filesSampled} of ${surviving.value.filesTotal} files`);
  figures.push(surviving, survivalByCohort(surviving.value.byYear, sample));
  return {
    name: basename(cwd),
    head: await headSha(cwd),
    fingerprint: fingerprint(await rootCommit(cwd), await remoteUrl(cwd), key),
    fingerprintKeyed: true,
    identity: {
      emails: params.emails ? [...new Set(id.emails.map(publicEmail))] : [],
      names: id.names,
      count: id.emails.length,
      keys: [...new Set(id.emails.map((e) => identityKey(key, e)))].sort(),
      // The addresses are recorded only with --emails, as publicEmail forms, so the basis sentence can list them.
      ...(merged ? { merged: { count: merged.emails.length, reasons: merged.reasons, ...(params.emails ? { emails: merged.emails.map(publicEmail) } : {}) } } : {}),
      ...(splits.length
        ? {
            // Without --emails the record is a count, a fixed hint and fixed category strings: no
            // other identity's name, and nothing derived from its address (login, local part).
            possiblySplit: params.emails
              ? {
                  count: splits.length,
                  names: [...new Set(splits.map((sp) => sp.name))],
                  emails: [...new Set(splits.map((sp) => publicEmail(sp.email)))],
                  reasons: [...new Set(splits.map((sp) => sp.reason))],
                }
              : {
                  count: splits.length,
                  hint: SPLIT_HINT,
                  names: [],
                  reasons: [...new Set(splits.map((sp) => sp.category))],
                },
          }
        : {}),
    },
    environment: { git: await gitVersion(cwd), blame, ignoreRevs, seed: params.seed ?? "" },
    excluded: { botCommits: ex.botCommits, files: ex.excluded.size, linesAddedShare: addedAll ? addedExcluded / addedAll : 0, enabled: ex.enabled, items },
    windowLines: { added: linesAdded, deleted: linesDeleted },
    figures,
  };
}
