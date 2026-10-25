import { git } from "../git.js";

/**
 * Formatting-only commits: a commit whose added lines are its removed lines again after whitespace, quote characters and trailing
 * commas or semicolons are taken away (re-indent, tabs to spaces, single to double quotes, a trailing-comma sweep). `git blame -w`
 * ignores whitespace but not a quote change, so a mass reformat takes over every line it touches and the surviving-lines figure
 * credits the person who ran the formatter. These commits are detected, listed, and passed to `git blame --ignore-rev`.
 *
 * Candidates are commits of comparable added and deleted size (within 15 percent) with at least MIN_LINES of each; at most CAP
 * of the largest are read. A commit is formatting-only when at least 95 percent of its added lines (and of its removed lines)
 * match a line on the other side after normalisation. Two different edits that happen to normalise to the same line are the
 * limit of this test, and every detected commit is listed with its subject so a reader can check.
 */
export interface FormattingCommit {
  sha: string;
  subject: string;
  lines: number;
  files: number;
}

const MIN_LINES = 10;
const CAP = 40;

export const normaliseLine = (l: string): string => l.replace(/\s+/g, "").replace(/['"`]/g, "").replace(/[,;]+$/, "");

/** True when the added lines are the removed lines again after normalisation (both sides at least 95 percent matched). */
export function isFormattingOnly(removed: string[], added: string[]): boolean {
  const rm = removed.map(normaliseLine).filter(Boolean);
  const ad = added.map(normaliseLine).filter(Boolean);
  if (rm.length < MIN_LINES || ad.length < MIN_LINES) return false;
  const count = (xs: string[]) => {
    const m = new Map<string, number>();
    for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
  };
  const rc = count(rm);
  const ac = count(ad);
  let matched = 0;
  for (const [k, n] of ac) matched += Math.min(n, rc.get(k) ?? 0);
  return matched >= 0.95 * ad.length && matched >= 0.95 * rm.length;
}

export async function formattingOnlyCommits(top: string): Promise<FormattingCommit[]> {
  const out = await git(["log", "--no-merges", "--numstat", "--format=%x1e%H%x1f%s", "HEAD"], top);
  const candidates: FormattingCommit[] = [];
  for (const block of out.split("\x1e")) {
    if (!block.trim()) continue;
    const [head, ...rest] = block.split("\n");
    const [sha, subject] = (head ?? "").split("\x1f");
    if (!sha || !/^[0-9a-f]{40,64}$/.test(sha)) continue;
    let a = 0;
    let d = 0;
    let files = 0;
    for (const l of rest) {
      const m = /^(\d+)\t(\d+)\t/.exec(l);
      if (!m) continue;
      a += Number(m[1]);
      d += Number(m[2]);
      files++;
    }
    if (a >= MIN_LINES && d >= MIN_LINES && Math.abs(a - d) <= 0.15 * Math.max(a, d)) candidates.push({ sha, subject: subject ?? "", lines: a, files });
  }
  candidates.sort((x, y) => y.lines - x.lines);
  const found: FormattingCommit[] = [];
  for (const c of candidates.slice(0, CAP)) {
    let diff: string;
    try {
      diff = await git(["show", "-U0", "--no-color", "--no-renames", "--format=", c.sha], top);
    } catch {
      continue;
    }
    const removed: string[] = [];
    const added: string[] = [];
    for (const l of diff.split("\n")) {
      if (l.startsWith("--- ") || l.startsWith("+++ ")) continue;
      if (l.startsWith("-")) removed.push(l.slice(1));
      else if (l.startsWith("+")) added.push(l.slice(1));
    }
    if (isFormattingOnly(removed, added)) found.push(c);
  }
  return found;
}
