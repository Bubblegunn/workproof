import { analyseRepo, NOREPLY_PLACEHOLDER } from "./analyse.js";
import type { RepoReport } from "./analyse.js";
import type { Report } from "./report.js";
import { checkReport, verifyReport } from "./verify.js";
import type { Integrity, VerifyResult } from "./verify.js";

export type VerdictStatus = "do-not-trust" | "reproduces" | "not-checked";

export interface VerdictOptions {
  /** The fingerprint key the sender gave, when there is one. */
  fingerprintKey?: string;
  /** The report's file name, for the heading. Never a path. */
  reportName?: string;
}

const HEADLINE: Record<VerdictStatus, string> = {
  "do-not-trust": "**Do not trust as is.**",
  reproduces: "**Figures reproduce from this repository.**",
  "not-checked": "**Could not be checked.**",
};

const RECOMMENDATION: Record<VerdictStatus, string> = {
  "do-not-trust": "Do not rely on these figures. Ask the sender for a fresh report made from the original repository, the fingerprint key, and references from people who worked with them.",
  reproduces: "The figures can be relied on as far as the two limits above allow. Keep the report and the repository state it was checked against.",
  "not-checked": "Clone the repository the report is about, run this command again in it, and ask the sender for the fingerprint key.",
};

const PASSING_CHECK_DOES_NOT_PROVE = [
  "- History can be rewritten before a report is made, so a report that reproduces from a rewritten history still reproduces.",
  "- The figures show survival and activity, not quality, review, design or mentoring.",
];

const HASH_NOTE = "A passing offline check shows only that the document was not edited after it was written. Someone who changes a figure can recompute the hash, so it does not show the figures are true.";
const NO_KEY_REASON = "The figures reproduce, but which repository this is was not confirmed: ask the sender for the fingerprint key.";
const NO_KEY_RECOMMENDATION = "Ask the sender for the fingerprint key, then run this command again in the repository the report is about, with that key.";
const NO_DIRECTORY = "Not compared: no directory given";

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const cell = (text: string) => text.replace(/\|/g, "\\|");
const capitalise = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
const commitsOf = (repo: RepoReport): number | undefined => (repo.figures.find((f) => f.id === "commitShare")?.value as { author: number } | undefined)?.author;

/** The author argument verifyReport uses, so the re-derivation counts the same commits. */
function authorFor(repo: RepoReport): string[] {
  const shown = repo.identity.emails.length > 0 && !repo.identity.emails.includes(NOREPLY_PLACEHOLDER);
  return shown ? repo.identity.emails : repo.identity.names;
}

function hashLines(integrity: Integrity): string[] {
  if (integrity.ok) return [`Offline check: hash ok ${integrity.hash.stated.slice(0, 12)}.`, HASH_NOTE];
  if (integrity.problems.some((p) => p.startsWith("hash mismatch"))) {
    return [`Offline check: hash mismatch, the report says ${integrity.hash.stated.slice(0, 12)} and its content hashes to ${integrity.hash.computed.slice(0, 12)}.`];
  }
  return ["Offline check: the document does not have the shape this version writes:", ...integrity.problems.map((p) => `- ${p}`)];
}

/**
 * Builds the fixed verdict template from tool output only: checkReport offline first, then
 * verifyReport against the repositories given, then the merged-address claim re-derived.
 */
export async function buildVerdict(report: Report, repoDirs: string[], opts: VerdictOptions = {}): Promise<{ markdown: string; status: VerdictStatus }> {
  const name = opts.reportName ?? "report.json";
  const integrity = checkReport(report);
  // A repository is compared only with its own directory: a report that names more repositories than
  // directories is never reproduced from one clone, so the extra repositories are listed as not compared.
  const dirs = repoDirs.length ? repoDirs : [process.cwd()];

  let status: VerdictStatus;
  let reason: string;
  let altered: string[];
  let claimLines: string[] = [];
  let claims: { repo: RepoReport; i: number }[] = [];
  let fingerprintNotCompared = false;

  if (!integrity.ok) {
    status = "do-not-trust";
    const edited = integrity.problems.some((p) => p.startsWith("hash mismatch"));
    reason = edited
      ? "The report was edited or damaged after it was written, so its figures were not recomputed."
      : "The document does not have the shape this version writes, so its figures were not recomputed.";
    altered = ["Not compared: the offline check failed, so the figures were not recomputed."];
    claimLines = ["Not compared: the offline check failed, so the claim was not re-derived."];
  } else {
    claims = report.repositories.map((repo, i) => ({ repo, i })).filter(({ repo }) => repo.identity.merged !== undefined);
    const dirFor = (i: number) => dirs[i]!;
    const uncovered = report.repositories.map((repo, i) => ({ repo, i })).filter(({ i }) => i >= dirs.length);
    if (uncovered.length) {
      status = "not-checked";
      reason = "The report names more repositories than directories were given, so the figures were not recomputed.";
      altered = uncovered.map(({ repo }) => `- ${repo.name}: ${NO_DIRECTORY}.`);
      claimLines = claims.map(({ repo, i }) => (i >= dirs.length ? `${NO_DIRECTORY} for ${repo.name}, so the claim was not re-derived.` : "Not compared: the figures were not recomputed, because a repository in the report has no directory."));
    } else {
      let result: VerifyResult | undefined;
      try {
        result = await verifyReport(report, dirs, opts.fingerprintKey !== undefined ? { fingerprintKey: opts.fingerprintKey } : {});
      } catch {
        // The error text names a local path, so the verdict says only that no repository was usable.
        result = undefined;
      }
      if (!result) {
        status = "not-checked";
        reason = "No repository could be opened from the paths given, so the figures were not recomputed.";
        altered = ["Not compared: no repository could be opened."];
        claimLines = ["Not compared: no repository could be opened."];
      } else {
        const differ = result.rows.filter((r) => !r.match);
        const fpBad = result.fingerprints.filter((f) => f.compared && !f.match).map((f) => f.repo);
        fingerprintNotCompared = result.fingerprints.some((f) => !f.compared);
        const badList = fpBad.join(", ");
        const notRecomputed = `${plural(fpBad.length, "that repository was", "those repositories were")} not recomputed`;
        if (fpBad.length || differ.length) {
          status = "do-not-trust";
          if (fpBad.length && differ.length) {
            reason = `${capitalise(`the fingerprint of ${badList} differs, so it is not the repository the report describes`)}; ${differ.length} ${plural(differ.length, "figure differs", "figures differ")} from the repository.`;
          } else if (fpBad.length) {
            reason = `${capitalise(`the fingerprint of ${badList} differs, so it is not the repository the report describes and its figures were not recomputed`)}.`;
          } else {
            reason = `${differ.length} ${plural(differ.length, "figure differs", "figures differ")} from the repository, so the report does not reproduce.`;
          }
        } else if (fingerprintNotCompared) {
          status = "not-checked";
          reason = NO_KEY_REASON;
        } else if (result.headMoved.length) {
          status = "not-checked";
          reason = "Every figure matched, but HEAD moved since the report was made, so the match does not cover the commit the report names.";
        } else {
          status = "reproduces";
          reason = "Every figure in the report was recomputed from this repository and came out the same.";
        }
        if (differ.length) {
          const multi = report.repositories.length > 1;
          altered = [
            "| Figure | The report says | The repository says |",
            "|---|---|---|",
            ...differ.map((r) => `| ${cell(multi ? `${r.repo}/${r.figure}` : r.figure)} | ${cell(r.expected)} | ${cell(r.actual)} |`),
          ];
          if (fpBad.length) altered.push(`Not compared: the fingerprint of ${badList} differs, so ${notRecomputed}.`);
        } else if (fpBad.length) {
          altered = [`Not compared: the fingerprint of ${badList} differs, so ${notRecomputed}.`];
        } else {
          altered = ["None: every figure reproduces."];
        }
        for (const { repo, i } of claims) {
          if (fpBad.includes(repo.name)) {
            claimLines.push(`Not compared: the fingerprint of ${repo.name} differs, so the claim was not re-derived.`);
            continue;
          }
          const claim = repo.identity.merged!;
          const actual = await analyseRepo(dirFor(i), { ...report.params, author: authorFor(repo) });
          const k = actual.identity.count;
          const n = claim.count;
          const c = repo.identity.count;
          const consistent = k === n + 1 && c === k;
          const claimed = `The report claims ${n} other ${plural(n, "address", "addresses")} ${plural(n, "was", "were")} merged (reasons: ${claim.reasons.join(", ")}).`;
          const under = `The repository has ${k} ${plural(k, "address", "addresses")} under the names the report gives (re-derived).`;
          claimLines.push(
            consistent
              ? `${claimed} ${under} Consistent.`
              : `${claimed} ${under} Not consistent: the report counts ${c} ${plural(c, "address", "addresses")} (its own plus the merged ones) and the repository has ${k}.`,
          );
          claimLines.push(`Commits under those names, re-derived: ${commitsOf(actual)}; the report says ${commitsOf(repo)}.`);
        }
      }
    }
  }

  const recommendation = status === "not-checked" && fingerprintNotCompared ? NO_KEY_RECOMMENDATION : RECOMMENDATION[status];
  const lines = [
    `# Verdict on ${name}`,
    "",
    "## Verdict",
    HEADLINE[status],
    reason,
    "",
    "## Altered figures",
    ...altered,
    "",
    "## Hash status",
    ...hashLines(integrity),
    "",
    ...(claims.length ? ["## Merged-address claim", ...claimLines, ""] : []),
    "## What a passing check would not prove",
    ...PASSING_CHECK_DOES_NOT_PROVE,
    "",
    "## Recommendation",
    recommendation,
  ];
  return { markdown: `${lines.join("\n")}\n`, status };
}
