import { createHash } from "node:crypto";
import { basename } from "node:path";
import { createRequire } from "node:module";
import { listCommits, listTags, rootCommit, headSha, remoteUrl, assertRepository } from "./git.js";
import { resolveIdentity } from "./figures/identity.js";
import { tenure, commitShare } from "./figures/commits.js";
import { cadence } from "./figures/cadence.js";
import { footprint, testsAndDocs } from "./figures/footprint.js";
import { survivingLines } from "./figures/surviving.js";
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
}

export interface AnalyseHooks {
  /** Called with short status lines while history is read and files are blamed. */
  progress?: (message: string) => void;
}

export interface RepoReport {
  name: string;
  head: string;
  fingerprint: string;
  identity: { emails: string[]; names: string[]; count: number };
  figures: Figure<any>[];
}

/** sha256 of the root commit and the normalised remote: identifies a repository without naming it. */
export function fingerprint(root: string, remote: string): string {
  let r = remote.trim().toLowerCase().replace(/\.git$/, "");
  r = r.replace(/^[a-z+]+:\/\//, "").replace(/^git@([^:]+):/, "$1/");
  return createHash("sha256").update(`${root}\n${r}`).digest("hex");
}

const require = createRequire(import.meta.url);
const survivingVersion = (): string => {
  try {
    return require("surviving-lines/package.json").version as string;
  } catch {
    return "unknown";
  }
};

export async function analyseRepo(cwd: string, params: Params, hooks: AnalyseHooks = {}): Promise<RepoReport> {
  const say = hooks.progress ?? (() => {});
  await assertRepository(cwd);
  say(`${basename(cwd)}: reading history${params.maxCommits ? ` (newest ${params.maxCommits} commits)` : ""}...`);
  const all = await listCommits(cwd, params.maxCommits ? { max: params.maxCommits } : {});
  say(`${basename(cwd)}: ${all.length.toLocaleString("en-US")} commits read`);
  const id = await resolveIdentity(all, params.author, cwd);
  const t = tenure(all, id, { ...(params.since ? { since: params.since } : {}), ...(params.until ? { until: params.until } : {}) });
  const start = new Date(t.value.first + "T00:00:00Z");
  const end = new Date(t.value.last + "T23:59:59Z");
  const inTenure = all.filter((c) => c.date >= start && c.date <= end);
  const tags = await listTags(cwd);
  const sample = params.sample ?? (all.reduce((n, c) => n + c.files.length, 0) > 50000 ? 7 : 1);
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
  ];
  say(`${basename(cwd)}: blaming files (1 in ${sample} sample)...`);
  const surviving = await survivingLines(cwd, id, { sample, version: survivingVersion() });
  say(`${basename(cwd)}: blamed ${surviving.value.filesSampled} of ${surviving.value.filesTotal} files`);
  figures.push(surviving);
  return {
    name: basename(cwd),
    head: await headSha(cwd),
    fingerprint: fingerprint(await rootCommit(cwd), await remoteUrl(cwd)),
    identity: { emails: params.emails ? id.emails : [], names: id.names, count: id.emails.length },
    figures,
  };
}
