import type { Commit } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

/**
 * Figures about who owns what, each with its bias stated in limits. Bots and excluded
 * files have already left the commit lists these functions receive.
 */

const nonMerge = (commits: Commit[]) => commits.filter((c) => c.parents <= 1);
const oldestFirst = (commits: Commit[]) => [...commits].sort((a, b) => a.date.getTime() - b.date.getTime());

/** Avelino et al. 2016, "A novel approach for estimating truck factors": degree of authorship. */
export const degreeOfAuthorship = (fa: 0 | 1, dl: number, ac: number): number => 3.293 + 1.098 * fa + 0.164 * dl - 0.321 * Math.log(1 + ac);
export const DOA_MIN = 3.293;
export const DOA_NORMALISED_MIN = 0.75;

interface Contribution { first: boolean; later: number }

/**
 * Files alive at HEAD whose degree of authorship for the subject is at least 0.75 of the
 * file's maximum and at least 3.293 in absolute terms. Renames carry their history along.
 */
export function filesAuthored(commits: Commit[], id: Identity, headFiles: Set<string>) {
  // path -> author email -> contribution; bots and excluded paths are already gone.
  const files = new Map<string, Map<string, Contribution>>();
  for (const c of oldestFirst(nonMerge(commits))) {
    for (const f of c.files) {
      let authors = files.get(f.path);
      if (f.from && files.has(f.from) && !authors) {
        authors = new Map([...files.get(f.from)!].map(([email, v]) => [email, { ...v }]));
        files.set(f.path, authors);
      }
      if (!authors) {
        authors = new Map();
        files.set(f.path, authors);
      }
      const entry = authors.get(c.email) ?? { first: authors.size === 0 && [...authors.values()].every((v) => !v.first), later: 0 };
      if (authors.has(c.email)) entry.later++;
      authors.set(c.email, entry);
    }
  }
  let authored = 0;
  for (const path of headFiles) {
    const authors = files.get(path);
    if (!authors) continue;
    const total = [...authors.values()].reduce((s, v) => s + (v.first ? 1 : 0) + v.later, 0);
    const doaOf = (email: string) => {
      const v = authors.get(email);
      if (!v) return 0;
      const own = (v.first ? 1 : 0) + v.later;
      return degreeOfAuthorship(v.first ? 1 : 0, v.later, total - own);
    };
    const max = Math.max(...[...authors.keys()].map(doaOf));
    const mine = Math.max(...id.emails.map(doaOf));
    if (mine >= DOA_MIN && max > 0 && mine / max > DOA_NORMALISED_MIN) authored++;
  }
  const value = { authored, total: headFiles.size, share: headFiles.size ? authored / headFiles.size : 0 };
  const figure: Figure<typeof value> = {
    id: "filesAuthored",
    title: "Files authored",
    value,
    command: "git log --no-merges --numstat -M over the history read; DOA = 3.293 + 1.098*FA + 0.164*DL - 0.321*ln(1 + AC) per file and author (Avelino et al.); authored when DOA is at least 3.293 and above 75% of the file's maximum; over files alive at HEAD",
    limits: [
      "The coefficients were fitted on other systems; first authorship outweighs later rewrites, so a file rewritten from scratch by someone else can stay with its creator.",
      "A file that was renamed carries its history only when git detected the rename.",
    ],
  };
  return figure;
}

function dirAt(path: string, depth: number): string | null {
  const parts = path.split("/");
  if (parts.length <= 1) return null;
  return parts.slice(0, Math.min(depth, parts.length - 1)).join("/");
}

export const MAJOR_THRESHOLD = 0.05;

/** Bird et al. 2011, "Don't touch my code": directories where the subject's commit share is at least 5%. */
export function majorContributor(commits: Commit[], id: Identity, depth: number) {
  const dirs = new Map<string, { author: number; total: number }>();
  for (const c of nonMerge(commits)) {
    const seen = new Set<string>();
    for (const f of c.files) {
      const d = dirAt(f.path, depth);
      if (d) seen.add(d);
    }
    for (const d of seen) {
      const e = dirs.get(d) ?? { author: 0, total: 0 };
      e.total++;
      if (isMine(c, id)) e.author++;
      dirs.set(d, e);
    }
  }
  const major = [...dirs.values()].filter((e) => e.total && e.author / e.total >= MAJOR_THRESHOLD).length;
  const value = { major, dirs: dirs.size, threshold: MAJOR_THRESHOLD };
  const figure: Figure<typeof value> = {
    id: "majorContributor",
    title: "Major-contributor components",
    value,
    command: `git log --no-merges --numstat; directories at depth ${depth} where the author's share of commits touching them is at least ${MAJOR_THRESHOLD * 100}% (Bird et al.)`,
    limits: ["Commit exposure treats a typo and a subsystem alike; five percent of the commits to a directory is a low bar by design."],
  };
  return figure;
}

const rank = (sorted: number[], p: number) => (sorted.length ? sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)]! : 0);

export const HUGE_COMMIT = 10000;

/** Added plus deleted lines per non-merge commit by the subject, after exclusions. */
export function commitSize(commits: Commit[], id: Identity) {
  const sizes = nonMerge(commits)
    .filter((c) => isMine(c, id))
    .map((c) => c.files.reduce((s, f) => s + (f.added ?? 0) + (f.deleted ?? 0), 0))
    .sort((a, b) => a - b);
  const value = { median: rank(sizes, 0.5), p90: rank(sizes, 0.9), huge: sizes.filter((s) => s > HUGE_COMMIT).length };
  const figure: Figure<typeof value> = {
    id: "commitSize",
    title: "Commit size",
    value,
    command: `git log --no-merges --numstat --author=<identity>; added plus deleted lines per commit over included files; median and 90th percentile by nearest rank; huge counts commits over ${HUGE_COMMIT.toLocaleString("en-US")} lines`,
    limits: ["Size is not value. Imports, vendoring that slipped past the exclusions and reformat commits dominate the 90th percentile."],
  };
  return figure;
}

/** Commits by someone else that name the subject in a Co-authored-by trailer. */
export function coAuthored(commits: Commit[], id: Identity) {
  const trailerCommits = nonMerge(commits).filter((c) => !isMine(c, id) && c.coAuthors.some((e) => id.emails.includes(e))).length;
  const value = { trailerCommits };
  const figure: Figure<typeof value> = {
    id: "coAuthored",
    title: "Co-authored commits",
    value,
    command: "git log --no-merges --format=%(trailers:key=Co-authored-by); commits by another author whose trailer names one of the subject's emails",
    limits: ["Trailers are written by whoever merges and can be absent or wrong; pairing without a trailer is invisible."],
  };
  return figure;
}

/** CHAOSS Contributor Absence Factor: the smallest set of authors covering half the commits. */
export function absenceFactor(commits: Commit[], id: Identity) {
  const counts = new Map<string, number>();
  for (const c of nonMerge(commits)) {
    const key = isMine(c, id) ? "\0subject" : c.email;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const total = sorted.reduce((s, [, n]) => s + n, 0);
  let covered = 0;
  let authorsToHalf = 0;
  for (const [, n] of sorted) {
    if (covered >= total / 2) break;
    covered += n;
    authorsToHalf++;
  }
  const value = { authorsToHalf, authorRank: sorted.findIndex(([k]) => k === "\0subject") + 1, authors: sorted.length };
  const figure: Figure<typeof value> = {
    id: "absenceFactor",
    title: "Absence factor",
    value,
    command: "git log --no-merges --format=%aE; authors sorted by commit count; the smallest set covering 50% of commits (CHAOSS Contributor Absence Factor); the subject's rank by commit count",
    limits: ["An author with several unmerged email addresses counts as several people; drive-by commits count as authors."],
  };
  return figure;
}

export const AI_TOOLS = /claude|cursor|copilot|codex|gemini|chatgpt|aider|devin|windsurf/i;

/** Subject commits whose trailers or author name declare an AI tool. */
export function aiAssisted(commits: Commit[], id: Identity) {
  const mine = nonMerge(commits).filter((c) => isMine(c, id));
  const assisted = mine.filter((c) => c.coAuthorNames.some((n) => AI_TOOLS.test(n)) || c.assistedBy.some((a) => AI_TOOLS.test(a)) || /\(aider\)$/i.test(c.name)).length;
  const value = { commits: assisted, share: mine.length ? assisted / mine.length : 0 };
  const figure: Figure<typeof value> = {
    id: "aiAssisted",
    title: "AI-assisted commits",
    value,
    command: "git log --no-merges --format=%aN%(trailers:key=Co-authored-by)%(trailers:key=Assisted-by) --author=<identity>; commits naming Claude, Cursor, Copilot, Codex, Gemini, ChatGPT, Aider, Devin or Windsurf in a trailer, or an author name ending in (aider)",
    limits: [
      "The absence of a trailer is not evidence of unassisted work.",
      "Blame credits the human for every line, so surviving lines say nothing about who typed them; authorship no longer implies comprehension.",
      "These commits are never excluded from any other figure.",
    ],
  };
  return figure;
}

/** The subject's surviving lines by the year of the commit that last touched them, from the same blame pass. */
export function survivalByCohort(byYear: { year: number; lines: number }[], sample: number) {
  const figure: Figure<{ year: number; lines: number }[]> = {
    id: "survivalByCohort",
    title: "Survival by cohort",
    value: byYear,
    command: `the same git blame --line-porcelain pass as the surviving-lines figure (1-in-${sample} sample); the subject's lines bucketed by author-time year`,
    limits: ["Newer cohorts have had less time to die; comments and licence headers survive indefinitely."],
  };
  return figure;
}
