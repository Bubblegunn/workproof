import type { Report } from "./report.js";

/** shields.io endpoint document: https://shields.io/badges/endpoint-badge */
export interface Badge {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

/**
 * A badge for the first repository in the report. It is a claim, not evidence:
 * the JSON report next to it is what a reader verifies.
 */
export function badgeFor(report: Report): Badge {
  const repo = report.repositories[0];
  if (!repo) throw new Error("the report has no repositories");
  const surviving = repo.figures.find((f) => f.id === "survivingLines");
  const tenure = repo.figures.find((f) => f.id === "tenure");
  if (!surviving || !tenure) throw new Error("the report has no surviving-lines or tenure figure");
  return {
    schemaVersion: 1,
    label: "workproof",
    message: `${pct(surviving.value.share)} surviving lines · ${Number(tenure.value.days).toLocaleString("en-US")} days`,
    color: "1f3fbf",
  };
}
