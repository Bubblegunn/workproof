import { isAbsolute, join } from "node:path";
import { git } from "../git.js";
import type { Figure, Identity } from "./types.js";
// surviving-lines ships plain ESM JavaScript without type declarations.
// @ts-ignore
import { globToRegExp, inSample } from "surviving-lines/bin/surviving-lines.js";

export interface SurvivingOptions {
  sample: number;
  seed: string;
  /** Globs with surviving-lines semantics (a pattern without a slash also matches the basename). */
  exclude: string[];
  copies: boolean;
  /** As recorded in the report: ".git-blame-ignore-revs" for the root file, or the path given. */
  ignoreRevsFile: string | null;
  /** Paths already dropped by the exclusion rules. */
  excluded: Set<string>;
  version: string;
  jobs?: number;
}

/** The blame flags a report records under environment.blame, in the order git receives them. */
export function blameFlags(copies: boolean, ignoreRevsFile: string | null): string[] {
  return ["-w", "-M", ...(copies ? ["-C"] : []), ...(ignoreRevsFile ? [`--ignore-revs-file ${ignoreRevsFile}`] : [])];
}

/** The empty tree's id under this repository's hash algorithm, without touching /dev/null. */
export const emptyTreeId = async (cwd: string): Promise<string> => (await git(["hash-object", "-t", "tree", "--stdin"], cwd, "")).trim();

/** Text files at HEAD with their line counts, in one git call; binaries come back as "-" and are skipped. */
export async function listTextFiles(cwd: string): Promise<{ path: string; lines: number }[]> {
  const out = await git(["diff", "--numstat", "-z", await emptyTreeId(cwd), "HEAD"], cwd);
  const files: { path: string; lines: number }[] = [];
  for (const rec of out.split("\0")) {
    if (!rec) continue;
    const [added, , path] = rec.split("\t");
    if (added === "-" || path === undefined) continue;
    files.push({ path, lines: Number(added) });
  }
  return files;
}

interface BlameLine { mail: string; year: number }

/** One entry per surviving line: the author email and the year of the blamed commit. */
export function parseBlame(porcelain: string): BlameLine[] {
  const lines: BlameLine[] = [];
  let mail = "";
  let year = 0;
  for (const line of porcelain.split("\n")) {
    if (line.startsWith("author-mail ")) mail = line.slice(12).replace(/^<|>$/g, "").toLowerCase();
    else if (line.startsWith("author-time ")) year = new Date(Number(line.slice(12)) * 1000).getUTCFullYear();
    else if (line.startsWith("\t")) lines.push({ mail, year });
  }
  return lines;
}

/**
 * One blame pass over a deterministic sample of the included text files. Every line is
 * attributed once; the subject's lines are also bucketed by the year of the commit that
 * last touched them, which is what survivalByCohort reports.
 */
export async function survivingLines(cwd: string, id: Identity, opts: SurvivingOptions) {
  const excludeRe: RegExp[] = opts.exclude.map((g) => globToRegExp(g) as RegExp);
  const excludeBare = opts.exclude.map((g) => !g.includes("/"));
  const dropped = (path: string) => {
    if (opts.excluded.has(path)) return true;
    const base = path.slice(path.lastIndexOf("/") + 1);
    return excludeRe.some((re, i) => re.test(path) || (excludeBare[i] && re.test(base)));
  };
  const all = (await listTextFiles(cwd)).filter((f) => !dropped(f.path));
  const sampled = all.filter((f) => inSample(f.path, opts.sample, opts.seed) as boolean);
  const ignoreRevs = opts.ignoreRevsFile === null ? null : isAbsolute(opts.ignoreRevsFile) ? opts.ignoreRevsFile : join(cwd, opts.ignoreRevsFile);
  const args = ["blame", "--line-porcelain", "-w", "-M", ...(opts.copies ? ["-C"] : []), ...(ignoreRevs ? ["--ignore-revs-file", ignoreRevs] : []), "HEAD", "--"];
  let attributed = 0;
  let mine = 0;
  const byYear = new Map<number, number>();
  let cursor = 0;
  const worker = async () => {
    while (cursor < sampled.length) {
      const file = sampled[cursor++]!;
      for (const line of parseBlame(await git([...args, file.path], cwd))) {
        attributed++;
        if (id.emails.includes(line.mail)) {
          mine++;
          byYear.set(line.year, (byYear.get(line.year) ?? 0) + 1);
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.jobs ?? 4, sampled.length || 1) }, worker));
  const value = {
    lines: mine,
    linesAttributed: attributed,
    share: attributed ? mine / attributed : 0,
    filesSampled: sampled.length,
    filesTotal: all.length,
    sample: opts.sample,
    seed: opts.seed,
    byYear: [...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, lines]) => ({ year, lines })),
  };
  const figure: Figure<typeof value> = {
    id: "survivingLines",
    title: "Surviving lines at HEAD",
    value,
    command: `git blame --line-porcelain ${blameFlags(opts.copies, opts.ignoreRevsFile).join(" ")} HEAD -- <file> over a deterministic 1-in-${opts.sample} file sample (surviving-lines ${opts.version}: FNV-1a on path${opts.seed ? ` with seed "${opts.seed}"` : ""}); generated, vendored and lock files excluded`,
    limits: [
      "Survivorship, not merit: code deleted on purpose counts for nobody.",
      "Whitespace and moved lines keep their original author; copied lines do not unless --copies is used.",
      opts.ignoreRevsFile ? `Commits listed in ${opts.ignoreRevsFile} are skipped, so a reformat does not take the lines it touched.` : "A reformat commit takes every line it touched; list such commits in .git-blame-ignore-revs.",
    ],
  };
  return figure;
}
