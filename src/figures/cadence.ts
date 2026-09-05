import type { Commit, Tag } from "../git.js";
import type { Figure, Identity } from "./types.js";
import { isMine } from "./identity.js";

/** ISO 8601 week key, e.g. 2026-W02. */
export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weeksBetween(first: string, last: string): string[] {
  const out: string[] = [];
  const d = new Date(first + "T00:00:00Z");
  const end = new Date(last + "T00:00:00Z");
  while (d <= end) {
    const w = isoWeek(d);
    if (out[out.length - 1] !== w) out.push(w);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function cadence(commits: Commit[], tags: Tag[], id: Identity, window: { first: string; last: string }) {
  const mine = commits.filter((c) => isMine(c, id) && c.parents <= 1);
  const perWeek = new Map<string, number>();
  for (const c of mine) perWeek.set(isoWeek(c.date), (perWeek.get(isoWeek(c.date)) ?? 0) + 1);
  const weeks = weeksBetween(window.first, window.last);
  let streak = 0;
  let longest = 0;
  for (const w of weeks) {
    if (perWeek.has(w)) {
      streak++;
      longest = Math.max(longest, streak);
    } else streak = 0;
  }
  const activeWeeks = perWeek.size;
  const start = new Date(window.first + "T00:00:00Z");
  const end = new Date(window.last + "T23:59:59Z");
  const inTenure = tags.filter((t) => t.date >= start && t.date <= end);
  const value = {
    activeWeeks,
    weeksInTenure: weeks.length,
    commitsPerActiveWeek: activeWeeks ? Math.round((mine.length / activeWeeks) * 10) / 10 : 0,
    longestStreakWeeks: longest,
    tagsInTenure: inTenure.length,
    authorTags: inTenure.filter((t) => id.emails.includes(t.email)).length,
  };
  const figure: Figure<typeof value> = {
    id: "cadence",
    title: "Cadence",
    value,
    command: "git log --no-merges --format=%aI --author=<identity>; ISO weeks; git for-each-ref refs/tags with creatordate",
    limits: ["A week with one commit and a week with forty both count as active.", "Tags are releases only if the project tags releases."],
  };
  return figure;
}
