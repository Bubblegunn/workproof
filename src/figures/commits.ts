import type { Commit } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

const day = (d: Date) => d.toISOString().slice(0, 10);

export function tenure(commits: Commit[], id: Identity, override: { since?: string; until?: string }): Figure<{ first: string; last: string; days: number }> {
  const mine = commits.filter((c) => isMine(c, id)).map((c) => c.localDate).sort((a, b) => a.getTime() - b.getTime());
  const first = override.since ? new Date(override.since) : mine[0]!;
  const last = override.until ? new Date(override.until) : mine[mine.length - 1]!;
  const days = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
  return {
    id: "tenure",
    title: "Tenure window",
    value: { first: day(first), last: day(last), days },
    command: override.since || override.until ? "--since/--until as given" : "git log --format=%aI --author=<identity>; first and last commit dates",
    limits: [
      "Tenure is measured from commits, so work before the first commit or after the last is invisible.",
      "The first and last days are read in the offset each commit records, so they are the author's calendar days rather than UTC days.",
    ],
  };
}

export function commitShare(commits: Commit[], id: Identity): Figure<{ author: number; total: number; share: number }> {
  const nonMerge = commits.filter((c) => c.parents <= 1);
  const author = nonMerge.filter((c) => isMine(c, id)).length;
  const total = nonMerge.length;
  return {
    id: "commitShare",
    title: "Share of commits in tenure",
    value: { author, total, share: total ? author / total : 0 },
    command: "git log --no-merges --format=%aE --since=<first> --until=<last>; count by author over all",
    limits: [
      "Commits measure activity, not what survived. One commit can be a typo or a subsystem.",
      "Squash-merged branches count once regardless of size.",
    ],
  };
}
