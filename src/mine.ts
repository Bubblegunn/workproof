import type { RepoReport } from "./analyse.js";
import { mergeBasisSentence, NO_MERGE_SENTENCE } from "./basis.js";
import { isolate } from "./text.js";

export interface MineOptions {
  /** Show the merged addresses in the basis sentence. Off by default, as in the report. */
  emails?: boolean;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const n = (x: number) => x.toLocaleString("en-US");

/** The lines of one repository's block. `level` is the heading level of its title. */
function blockFor(repo: RepoReport, level: number, opts: MineOptions): string[] {
  const figure = (id: string) => {
    const f = repo.figures.find((x) => x.id === id);
    if (!f) throw new Error(`the figure ${id} is missing from ${repo.name}`);
    return f.value;
  };
  const tenure = figure("tenure") as { first: string; last: string };
  const share = figure("commitShare") as { author: number; total: number };
  const lines = figure("survivingLines") as { lines: number; linesAttributed: number; share: number };
  const h = (k: number) => "#".repeat(level + k);
  const merged = repo.identity.merged;
  const split = repo.identity.possiblySplit;
  const out: string[] = [
    `${h(0)} My work in ${isolate(repo.name)}`,
    ``,
    `- Commits: ${n(share.author)} non-merge commits are mine, out of ${n(share.total)} non-merge commits by everyone between my first and my last commit (${tenure.first} to ${tenure.last}).`,
    `- Surviving lines: ${n(lines.lines)} of the ${n(lines.linesAttributed)} lines at HEAD are mine (${pct(lines.share)}), counted with git blame -w -M.`,
    ``,
    `${h(1)} Which addresses are counted`,
    ``,
  ];
  out.push(`Addresses counted in total: ${n(repo.identity.count ?? 1)} (the configured one, any address whose commits carry the same name, and those merged by rule).`, ``);
  if (merged && merged.count > 0) {
    const addresses = opts.emails && merged.emails?.length ? { addresses: merged.emails } : {};
    out.push(mergeBasisSentence(merged, addresses));
  } else {
    out.push(NO_MERGE_SENTENCE);
  }
  if (split) {
    const count = split.count ?? split.names.length;
    out.push(`${n(count)} other ${count === 1 ? "address" : "addresses"} may be the same person and ${count === 1 ? "was" : "were"} not counted; pass ${count === 1 ? "it" : "them"} with --author.`);
  }
  out.push(
    ``,
    `${h(1)} What this does not show`,
    ``,
    `Commits measure activity and surviving lines measure what lasted; neither measures quality, review or design. Run \`npx workproof\` and \`npx workproof verify\` for a report a reader can check.`,
    ``,
  );
  return out;
}

/**
 * The `workproof mine` summary: a fixed Markdown template per repository, built from the same
 * figures as the report and with no model. One repository gives one block; several give one block
 * each under a top heading.
 */
export function buildMine(repos: RepoReport[], opts: MineOptions = {}): string {
  if (repos.length === 1) return blockFor(repos[0]!, 1, opts).join("\n");
  const out: string[] = [`# My work`, ``];
  for (const repo of repos) out.push(...blockFor(repo, 2, opts));
  return out.join("\n");
}
