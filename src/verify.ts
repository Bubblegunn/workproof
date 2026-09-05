import { analyseRepo } from "./analyse.js";
import { headSha } from "./git.js";
import type { Report } from "./report.js";

const show = (v: unknown) => JSON.stringify(v);

export interface VerifyRow { repo: string; figure: string; match: boolean; expected: string; actual: string }

/** Recompute every figure in the given repositories and compare with the report. */
export async function verifyReport(report: Report, repoDirs: string[]): Promise<{ ok: boolean; rows: VerifyRow[]; headMoved: string[] }> {
  const rows: VerifyRow[] = [];
  const headMoved: string[] = [];
  for (const [i, expected] of report.repositories.entries()) {
    const dir = repoDirs[i] ?? repoDirs[0] ?? process.cwd();
    const head = await headSha(dir);
    if (head !== expected.head) headMoved.push(`${expected.name}: report at ${expected.head.slice(0, 12)}, repository at ${head.slice(0, 12)}`);
    // Emails are hidden from the report by default, so resolve the identity from what it does carry.
    const author = expected.identity.emails.length ? expected.identity.emails : expected.identity.names;
    const actual = await analyseRepo(dir, { ...report.params, author });
    for (const f of expected.figures) {
      const a = actual.figures.find((x) => x.id === f.id);
      const e = show(f.value);
      const g = show(a?.value);
      rows.push({ repo: expected.name, figure: f.id, match: e === g, expected: e, actual: g });
    }
  }
  return { ok: rows.every((r) => r.match) && headMoved.length === 0, rows, headMoved };
}
