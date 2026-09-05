#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { analyseRepo, buildReport, renderMarkdown, verifyReport, narrate, badgeFor } from "./index.js";
import type { Params, Report, RepoReport } from "./index.js";

const HELP = `usage: workproof [options] [--repo <dir>]...
       workproof verify <report.json> [--repo <dir>]...

Turn a git repository into a verifiable engineering report for one author, without showing code.

  --author <email|name>  identity to report on (repeatable; default: git config user.email)
  --repo <dir>           repository to analyse (repeatable; default: current directory)
  --since / --until      override the tenure window (dates git understands)
  --sample <n>           blame every n-th file (default: 1, or 7 for very large repositories)
  --max-commits <n>      read only the newest n commits (escape hatch for enormous histories)
  --depth <n>            directory depth for ownership (default: 2)
  --paths                include directory paths in the report (off by default)
  --emails               include author emails in the report (off by default)
  --narrate              append a model-written paragraph; needs WORKPROOF_API_URL, WORKPROOF_API_KEY, WORKPROOF_MODEL
  --badge                also write <out>.badge.json, a shields.io endpoint document
  --out <basename>       output basename (default: workproof-report)
  --json                 print the JSON to stdout instead of writing files
  -h, --help             this text`;

interface Cli { params: Params; repos: string[]; out: string; json: boolean; doNarrate: boolean; badge: boolean; verifyFile: string | undefined }

export function parse(argv: string[]): Cli {
  const params: Params = { depth: 2, threshold: 0.5, minCommits: 5, paths: false, emails: false };
  const repos: string[] = [];
  const authors: string[] = [];
  let out = "workproof-report";
  let json = false;
  let doNarrate = false;
  let badge = false;
  let verifyFile: string | undefined;
  if (argv[0] === "verify") {
    verifyFile = argv[1];
    if (!verifyFile) throw new Error("verify needs a report.json");
    argv = argv.slice(2);
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--author") authors.push(next());
    else if (a === "--repo") repos.push(resolve(next()));
    else if (a === "--since") params.since = next();
    else if (a === "--until") params.until = next();
    else if (a === "--sample") params.sample = Number(next());
    else if (a === "--max-commits") { params.maxCommits = Number(next()); if (!Number.isInteger(params.maxCommits) || params.maxCommits < 1) throw new Error("--max-commits must be an integer >= 1"); }
    else if (a === "--depth") params.depth = Number(next());
    else if (a === "--paths") params.paths = true;
    else if (a === "--emails") params.emails = true;
    else if (a === "--narrate") doNarrate = true;
    else if (a === "--badge") badge = true;
    else if (a === "--out") out = next();
    else if (a === "--json") json = true;
    else if (a === "-h" || a === "--help") {
      console.log(HELP);
      process.exit(0);
    } else throw new Error(`unknown option ${a} (see --help)`);
  }
  if (authors.length) params.author = authors;
  if (!repos.length) repos.push(process.cwd());
  return { params, repos, out, json, doNarrate, badge, verifyFile };
}

async function main() {
  const started = Date.now();
  const { params, repos, out, json, doNarrate, badge, verifyFile } = parse(process.argv.slice(2));
  const progress = (m: string) => process.stderr.write(`${m}\n`);
  if (verifyFile) {
    const report = JSON.parse(await readFile(verifyFile, "utf8")) as Report;
    const result = await verifyReport(report, repos);
    for (const h of result.headMoved) console.log(`HEAD moved: ${h}`);
    for (const r of result.rows) if (!r.match) console.log(`mismatch ${r.repo}/${r.figure}\n  report:     ${r.expected}\n  repository: ${r.actual}`);
    console.log(result.ok ? "all figures reproduce" : `${result.rows.filter((r) => !r.match).length} figures differ`);
    process.exit(result.ok ? 0 : 1);
  }
  const version = createRequire(import.meta.url)("../../package.json").version as string;
  const repositories: RepoReport[] = [];
  for (const dir of repos) repositories.push(await analyseRepo(dir, params, { progress }));
  const report = buildReport(repositories, params, { version, generatedAt: new Date().toISOString() });
  let narrative: string | undefined;
  if (doNarrate) {
    const url = process.env.WORKPROOF_API_URL;
    const key = process.env.WORKPROOF_API_KEY;
    const model = process.env.WORKPROOF_MODEL;
    if (!url || !key || !model) throw new Error("--narrate needs WORKPROOF_API_URL, WORKPROOF_API_KEY and WORKPROOF_MODEL");
    narrative = await narrate(report, { url, key, model });
  }
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  await writeFile(`${out}.json`, JSON.stringify(report, null, 2));
  await writeFile(`${out}.md`, renderMarkdown(report, narrative));
  if (badge) await writeFile(`${out}.badge.json`, JSON.stringify(badgeFor(report), null, 2));
  console.log(`wrote ${out}.md and ${out}.json${badge ? ` and ${out}.badge.json` : ""} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (entry === import.meta.url || entry.endsWith("/workproof")) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
