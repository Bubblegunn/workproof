/**
 * The report in plain language, for the person who will read it and does not
 * write software: a recruiter, a hiring manager, a caseworker.
 *
 * Built from the figures with no model call, so it is deterministic and adds
 * nothing that is not already in the numbers above it. It states no opinion
 * about quality, keeps the two shares apart, and ends with how to check it.
 * The paragraph is derived from the hashed figures, not part of the hash.
 */
import type { RepoReport } from "./analyse.js";

const pct = (x: number) => `${Math.round(x * 100)}%`;
const n = (x: number) => x.toLocaleString("en-US");

const value = <T = Record<string, number>>(repo: RepoReport, id: string): T | undefined =>
  repo.figures.find((f) => f.id === id)?.value as T | undefined;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-01-05" to "5 January 2026". Dates only; the report carries no times. */
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function plainSummary(repo: RepoReport): string {
  const who = repo.identity.names[0] ?? "This author";
  const tenure = value<{ first: string; last: string; days: number }>(repo, "tenure");
  const commits = value<{ author: number; total: number; share: number }>(repo, "commitShare");
  const surviving = value<{ lines: number; linesAttributed: number; share: number; sample: number }>(repo, "survivingLines");
  const cadence = value<{ activeWeeks: number; weeksInTenure: number }>(repo, "cadence");
  const files = value<{ authored: number; total: number; share: number }>(repo, "filesAuthored");
  const absence = value<{ authorRank: number; authors: number }>(repo, "absenceFactor");

  const sentences: string[] = [];

  if (tenure) {
    sentences.push(`${who} worked in ${repo.name} from ${longDate(tenure.first)} to ${longDate(tenure.last)}, a span of ${n(tenure.days)} days.`);
  }

  if (commits && surviving) {
    sentences.push(
      `They made ${n(commits.author)} of the ${n(commits.total)} changes recorded in that period (${pct(commits.share)}), and ${n(surviving.lines)} of the ${n(surviving.linesAttributed)} lines of code still in the project today are theirs (${pct(surviving.share)}).`,
    );
    sentences.push(
      commits.share >= surviving.share
        ? `The second number is the one that lasts: it counts the work that survived everything written since.`
        : `The second number is the one that lasts, and here it is the higher of the two: their work survived everything written since better than the count of changes suggests.`,
    );
  }

  if (files) {
    sentences.push(`${n(files.authored)} of the ${n(files.total)} files in the project were started by them (${pct(files.share)}).`);
  }

  if (cadence) {
    sentences.push(`They were active in ${n(cadence.activeWeeks)} of the ${n(cadence.weeksInTenure)} weeks in that period.`);
  }

  if (absence && absence.authors > 1) {
    sentences.push(`${n(absence.authors)} people wrote code in this project; by share of surviving lines they rank ${n(absence.authorRank)}.`);
  }

  if (repo.excluded.enabled) {
    sentences.push(
      `Before any of this was counted, ${n(repo.excluded.botCommits)} automated ${repo.excluded.botCommits === 1 ? "change" : "changes"} and ${n(repo.excluded.files)} machine-written or copied ${repo.excluded.files === 1 ? "file" : "files"} were removed, so none of them inflate the figures.`,
    );
  }

  sentences.push(
    surviving && surviving.sample > 1
      ? `The line figures come from a fixed sample of one file in ${n(surviving.sample)}, chosen by a rule that anyone re-running this gets the same way.`
      : `Every figure above names the exact command that produced it.`,
  );
  sentences.push(`Anyone with a copy of this project can recompute all of it with \`npx workproof verify\`, and the report will not match if a number was edited.`);

  return sentences.join(" ");
}
