/**
 * Author dates that cannot be right, and where such a commit is placed instead.
 *
 * An author date is something the author's machine wrote: a wrong clock, a zero timestamp or a rebase can make it
 * impossible (before git existed, later than the commit's own committer date, later than today). The committer
 * date is when the commit reached this history. A commit with an impossible author date is placed by its committer
 * date when that one is possible, and listed apart; when both are impossible it is left out of dated figures and
 * listed. Nothing is dropped without a row.
 */
export const EARLIEST_PLAUSIBLE = Date.UTC(1990, 0, 1);
const SKEW_MS = 86400000;

export type DateIssue = "unparseable" | "before 1990" | "in the future" | "later than its committer date";

export interface Placement {
  /** The instant used to place the commit in a window, or null when neither date is usable. */
  at: Date | null;
  basis: "author" | "committer" | "none";
  issue?: DateIssue;
}

const valid = (d: Date): boolean => !Number.isNaN(d.getTime());
const possible = (d: Date, now: Date): boolean => valid(d) && d.getTime() >= EARLIEST_PLAUSIBLE && d.getTime() <= now.getTime() + SKEW_MS;

/** Why the author date cannot be right, or undefined when it can. */
export function authorDateIssue(author: Date, committer: Date, now: Date): DateIssue | undefined {
  if (!valid(author)) return "unparseable";
  if (author.getTime() < EARLIEST_PLAUSIBLE) return "before 1990";
  if (author.getTime() > now.getTime() + SKEW_MS) return "in the future";
  if (valid(committer) && author.getTime() > committer.getTime() + SKEW_MS) return "later than its committer date";
  return undefined;
}

export function placeCommit(author: Date, committer: Date, now: Date): Placement {
  const issue = authorDateIssue(author, committer, now);
  if (!issue) return { at: author, basis: "author" };
  if (possible(committer, now)) return { at: committer, basis: "committer", issue };
  return { at: null, basis: "none", issue };
}
