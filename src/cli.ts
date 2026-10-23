#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { analyseRepo, buildReport, renderMarkdown, verifyReport, checkReport, narrate, badgeFor, newFingerprintKey, writeStatement, signLocal, countersignStatement, signCountersignature, readCountersignature, COUNTERSIGN_PROVES, COUNTERSIGN_DOES_NOT_PROVE } from "./index.js";
import type { Params, Report, RepoReport, CountersignatureReading, MergeNotice } from "./index.js";
import { buildVerdict, parseReportText } from "./verdict.js";
import { buildBullets, DEFAULT_MAX_WORDS } from "./bullets.js";
import { stopCheck } from "./stopcheck.js";
import { buildMine } from "./mine.js";
import { runFigures } from "./figures.js";

const HELP = `usage: workproof [options] [--repo <dir>]...
       workproof check <report.json> [--countersign <file.dsse.json>]... [--allowed-signers <file>]
       workproof countersign <report.json> --key <ssh-key> [--repo <dir>] [--fingerprint-key <hex>] [--as <label>]
       workproof verify <report.json> [--repo <dir>]... [--fingerprint-key <hex>]
       workproof verdict <report.json> [--repo <dir>]... [--author <name|email>]... [--fingerprint-key <hex>] [--out <file>]
                 a verdict on a report someone else sent, checked against the repository it names
                 (default: the current directory); a fixed template built from the tool's own output
                 A report in another format is compared by the figures it names (commits, added and deleted lines,
                 first and last commit) with the same figures counted from the repository; --author names the person.
                 The exit code is 0 whenever a verdict was produced, whatever it says.
       workproof bullets --jd <file> (--report <report.json> | --facts <file.md>) [--resume] [--max-words N] [--out <file>]
                 a tailoring draft from a job description and your facts (a portfolio bank or past resume
                 in Markdown, or a verified report; --resume writes the finished resume and trims it to --max-words, default 450, counted as wc -w): ranked bullets copied verbatim, the skills the facts support,
                 the gaps, and the coverage of each requirement; a fixed template, with no model
       workproof mine [--repo <dir>]... [--author <email|name>]... [--no-merge-identities] [--emails] [--out <file>]
                 a Markdown summary of your work in each repository, from the report's figures: commits and surviving
                 lines, the addresses counted (with the rule that merged each), and what it does not show; a fixed template, no model
       workproof figures [--repo <dir>] [--author <email|name>]... [--since <date>] [--until <date>] [--doc <file>] [--json]
                 labelled counts for a document about one person's work, one line each as "label | value | filter":
                 authored commits in the window (author date; committer date shown), identity candidates (printed, never
                 merged), merges, rebased commits, reverts, whitespace-only commits, lines raw and with whitespace ignored,
                 large added files with a licence or source header, odd dates; "not computed (<reason>)" when git fails.
                 --doc <file> reads a finished document and lists, for each number next to commit, line, file and similar
                 words, the figures that equal it (a relative <file> is resolved against the current directory, not --repo), plus the emails, shell commands, code blocks and branch names it shows.
                 It states no verdict and exits 0 whenever it ran; read-only
       workproof attest <report.json> [--local <ssh-key>]
       workproof sessions [--days N | --since YYYY-MM-DD] [--repo <substr>]
       workproof sessions --dir <folder> [--since YYYY-MM-DD] [--until YYYY-MM-DD]
                 usage totals of a folder of session files the user supplied: sessions, unique assistant responses,
                 tokens by type and per model, tool calls; secrets and addresses are redacted
                 --since and --until keep the sessions whose first timestamp falls on a local calendar date in the
                 range (both inclusive) and add one row per session (at most 100): an 8-character id, first and last
                 time, responses, tool calls and the last segment of the working directory

Turn a git repository into a verifiable engineering report for one author, without showing code.

  --author <email|name>  identity to report on (repeatable; default: git config user.email)
  --no-merge-identities  count only the configured address and addresses with the same name (default: merge addresses that look like yours, and say which)
  --repo <dir>           repository to analyse (repeatable; default: current directory)
  --since / --until      override the tenure window (dates git understands)
  --sample <n>           blame every n-th file (default: 1, or 7 for very large repositories)
  --max-commits <n>      read only the newest n commits (escape hatch for enormous histories)
  --depth <n>            directory depth for ownership (default: 2)
  --no-exclusions        count bot commits and generated, vendored, lock and snapshot files
  --exclude <glob>       also drop files matching the glob (repeatable)
  --seed <text>          salt for the blame file sample
  --copies               pass -C to git blame so copied lines follow their origin
  --ignore-revs-file <f> blame ignore-revs file (default: .git-blame-ignore-revs at the root)
  --fingerprint-key <hex> reuse a fingerprint key so two reports of one repository match
  --paths                include directory paths in the report (off by default)
  --emails               include author emails in the report (off by default)
  --narrate              append a model-written paragraph; needs WORKPROOF_API_URL, WORKPROOF_API_KEY, WORKPROOF_MODEL
  --badge                also write <out>.badge.json, a shields.io endpoint document
  --quiet                no progress lines and no star hint (errors, warnings, the fingerprint key and the final wrote line stay)
  --out <basename>       output basename (default: workproof-report)
  --format <mode>        output markdown, json, or both (default: both)
  --json                 print the JSON to stdout instead of writing files (legacy alias)
  -h, --help             this text
  --version              print the version

check validates the document and recomputes its hash offline; verify does that, then
compares the fingerprint and HEAD and recomputes every figure in the repository; attest
writes an in-toto statement whose subject is the report hash, and with --local signs it
with ssh-keygen -Y sign (namespace workproof) into a DSSE envelope. countersign is run by a second
person in their own clone of the same repository: it recomputes every figure, refuses unless they
all match, and signs a statement about the report with --key (namespace workproof-countersign);
check --countersign reads that file and says who signed and what that does and does not prove.

The windowed lines added and deleted in a report (after exclusions) equal the sum of git log --no-merges --numstat over the same author, window and files; --paths also lists the excluded files.

sessions reads the Claude Code session logs on this machine and prints JSON with counts only.
It prints no file paths, no user name and no prompt text.`;

type OutputFormat = "both" | "markdown" | "json";

/** Environment variables that mean an AI agent or coding tool is running this command. */
export const AGENT_ENV_VARS = ["CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CLAUDE_PLUGIN_ROOT", "CODEX_SANDBOX", "CODEX_CI", "CURSOR_AGENT", "GEMINI_CLI", "AIDER_MODEL", "OPENCODE"] as const;

export const STAR_HINT_LINE = "If workproof helped, a star on GitHub helps other people find it: https://github.com/Bubblegunn/workproof (turn this off with --quiet or WORKPROOF_NO_STAR_HINT=1)";

const isSet = (v: string | undefined): boolean => v !== undefined && v !== "";

/** Decides whether the one-time star hint is printed after a run. Pure: the caller supplies the facts. */
export function starHintDecision(o: { stdoutIsTTY: boolean; stderrIsTTY: boolean; env: NodeJS.ProcessEnv; quiet: boolean; markerExists: boolean; command: "report" | "other" }): { show: boolean; reason: string } {
  if (o.command !== "report") return { show: false, reason: "not a run that writes a report" };
  if (!o.stdoutIsTTY) return { show: false, reason: "stdout is not a terminal" };
  if (!o.stderrIsTTY) return { show: false, reason: "stderr is not a terminal" };
  if (o.quiet) return { show: false, reason: "--quiet" };
  if (o.env.WORKPROOF_NO_STAR_HINT === "1") return { show: false, reason: "WORKPROOF_NO_STAR_HINT=1" };
  const ci = (o.env.CI ?? "").trim().toLowerCase();
  if (ci !== "" && ci !== "0" && ci !== "false") return { show: false, reason: "CI is set" };
  if (isSet(o.env.GITHUB_ACTIONS)) return { show: false, reason: "GITHUB_ACTIONS is set" };
  const agent = AGENT_ENV_VARS.find((name) => isSet(o.env[name]));
  if (agent) return { show: false, reason: `an agent is running (${agent} is set)` };
  if (o.markerExists) return { show: false, reason: "already shown on this machine" };
  return { show: true, reason: "shown" };
}

/** Classifies the arguments: only a plain run that writes a report may show the hint. Pure. */
export function starHintCommandFor(argv: string[]): "report" | "other" {
  if (["check", "verify", "verdict", "attest", "countersign", "sessions", "bullets", "mine", "figures"].includes(argv[0] ?? "")) return "other";
  if (argv.some((a) => a === "--help" || a === "-h" || a === "--version" || a === "--json")) return "other";
  const f = argv.indexOf("--format");
  if (f >= 0 && argv[f + 1] === "json") return "other";
  return "report";
}

export interface StarHintIo {
  stdoutIsTTY: boolean;
  stderrIsTTY: boolean;
  env: NodeJS.ProcessEnv;
  quiet: boolean;
  command: "report" | "other";
  stderr: { write(s: string): unknown };
  markerExists: () => boolean;
  writeMarker: () => void;
}

/** Prints the one-time star hint to stderr and records the marker. Returns whether it was printed. */
export function printStarHintIfDue(io: StarHintIo): boolean {
  const hint = starHintDecision({ stdoutIsTTY: io.stdoutIsTTY, stderrIsTTY: io.stderrIsTTY, env: io.env, quiet: io.quiet, markerExists: io.markerExists(), command: io.command });
  if (!hint.show) return false;
  io.stderr.write(`${STAR_HINT_LINE}\n`);
  io.writeMarker();
  return true;
}

/** The marker file that records the hint was shown on this machine. */
export function starHintMarkerPath(env: NodeJS.ProcessEnv): string {
  const base = isSet(env.XDG_CONFIG_HOME) ? env.XDG_CONFIG_HOME! : join(homedir(), ".config");
  return join(base, "workproof", "star-hint-shown");
}

export function starHintMarkerExists(env: NodeJS.ProcessEnv): boolean {
  try {
    return existsSync(starHintMarkerPath(env));
  } catch {
    return false;
  }
}

/** Records that the hint was shown. A failure only means the hint may be shown again; it never fails the run. */
export function writeStarHintMarker(env: NodeJS.ProcessEnv): void {
  try {
    const path = starHintMarkerPath(env);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "shown\n");
  } catch {
    // The run has already succeeded; a missing marker is the only consequence.
  }
}

interface Cli { params: Params; repos: string[]; out: string; format: OutputFormat; json: boolean; doNarrate: boolean; badge: boolean; quiet: boolean; verifyFile: string | undefined; verdictFile: string | undefined; verdictOut: string | undefined; checkFile: string | undefined; attestFile: string | undefined; localKey: string | undefined; countersignFile: string | undefined; signKey: string | undefined; signLabel: string | undefined; countersigns: string[]; allowedSigners: string | undefined }

export function parse(argv: string[]): Cli {
  const params: Params = { depth: 2, threshold: 0.5, minCommits: 5, paths: false, emails: false, exclusions: true, exclude: [], seed: "", copies: false };
  const repos: string[] = [];
  const authors: string[] = [];
  let out = "workproof-report";
  let format: OutputFormat = "both";
  let json = false;
  let doNarrate = false;
  let badge = false;
  let quiet = false;
  let verifyFile: string | undefined;
  let verdictFile: string | undefined;
  let verdictOut: string | undefined;
  let checkFile: string | undefined;
  let attestFile: string | undefined;
  let localKey: string | undefined;
  let countersignFile: string | undefined;
  let signKey: string | undefined;
  let signLabel: string | undefined;
  const countersigns: string[] = [];
  let allowedSigners: string | undefined;
  if (argv[0] === "attest") {
    attestFile = argv[1];
    if (!attestFile) throw new Error("attest needs a report.json");
    argv = argv.slice(2);
    if (argv[0] === "--local") {
      localKey = argv[1];
      if (!localKey) throw new Error("--local needs an ssh private key path");
      argv = argv.slice(2);
    }
    if (argv.length) throw new Error(`unknown option ${argv[0]} (attest takes only --local <ssh-key>)`);
  }
  if (argv[0] === "check") {
    checkFile = argv[1];
    if (!checkFile) throw new Error("check needs a report.json");
    const rest = argv.slice(2);
    for (let i = 0; i < rest.length; i++) {
      const a = rest[i]!;
      const value = () => {
        const v = rest[++i];
        if (v === undefined) throw new Error(`${a} needs a value`);
        return v;
      };
      if (a === "--countersign") countersigns.push(value());
      else if (a === "--allowed-signers") allowedSigners = value();
      else throw new Error("check takes only the report, --countersign and --allowed-signers; it never reads a repository");
    }
    argv = [];
  }
  if (argv[0] === "countersign") {
    countersignFile = argv[1];
    if (!countersignFile) throw new Error("countersign needs a report.json");
    argv = argv.slice(2);
  }
  if (argv[0] === "verify") {
    verifyFile = argv[1];
    if (!verifyFile) throw new Error("verify needs a report.json");
    argv = argv.slice(2);
  }
  if (argv[0] === "verdict") {
    verdictFile = argv[1];
    if (!verdictFile) throw new Error("verdict needs a report.json");
    const rest = argv.slice(2);
    for (let i = 0; i < rest.length; i++) {
      const a = rest[i]!;
      const value = () => {
        const v = rest[++i];
        if (v === undefined) throw new Error(`${a} needs a value`);
        return v;
      };
      if (a === "--repo") repos.push(resolve(value()));
      else if (a === "--fingerprint-key") params.fingerprintKey = value();
      else if (a === "--out") verdictOut = value();
      else if (a === "--author") (params.author ??= []).push(value());
      else throw new Error("verdict takes only the report, --repo, --author, --fingerprint-key and --out");
    }
    argv = [];
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
    else if (a === "--no-exclusions") params.exclusions = false;
    else if (a === "--no-merge-identities") params.mergeIdentities = false;
    else if (a === "--exclude") params.exclude!.push(next());
    else if (a === "--seed") params.seed = next();
    else if (a === "--copies") params.copies = true;
    else if (a === "--ignore-revs-file") params.ignoreRevsFile = next();
    else if (a === "--fingerprint-key") params.fingerprintKey = next();
    else if (a === "--paths") params.paths = true;
    else if (a === "--emails") params.emails = true;
    else if (a === "--key") signKey = next();
    else if (a === "--as") signLabel = next();
    else if (a === "--narrate") doNarrate = true;
    else if (a === "--badge") badge = true;
    else if (a === "--quiet") quiet = true;
    else if (a === "--out") out = next();
    else if (a === "--format") {
      const value = next();
      if (value !== "both" && value !== "markdown" && value !== "json") throw new Error("--format must be markdown, json, or both");
      format = value;
    }
    else if (a === "--json") { json = true; format = "json"; }
    else if (a === "-h" || a === "--help") {
      console.log(HELP);
      process.exit(0);
    } else throw new Error(`unknown option ${a} (see --help)`);
  }
  if ((signKey !== undefined || signLabel !== undefined) && !countersignFile) throw new Error("--key and --as belong to countersign");
  if (countersignFile && !signKey) throw new Error("countersign needs --key <ssh private key>");
  if (authors.length) params.author = authors;
  if (!repos.length) repos.push(process.cwd());
  return { params, repos, out, format, json, doNarrate, badge, quiet, verifyFile, verdictFile, verdictOut, checkFile, attestFile, localKey, countersignFile, signKey, signLabel, countersigns, allowedSigners };
}

/**
 * Runs the Claude Code session miner in its own Node process, with the rest of the arguments and
 * the caller's environment (WORKPROOF_HOME included), and exits with the miner's exit code.
 * The miner's path is resolved from this module's location, never from the working directory.
 */
export function runSessions(args: string[]): never {
  const miner = fileURLToPath(new URL("./sessions/mine-sessions.mjs", import.meta.url));
  const child = spawnSync(process.execPath, [miner, ...args], { stdio: "inherit", env: process.env });
  if (child.error) {
    console.error(`workproof sessions: could not start the miner (${child.error.message})`);
    process.exit(1);
  }
  process.exit(child.status ?? 1);
}

/** `workproof bullets`: prints or writes the tailoring draft. Returns the exit code: 0 produced, 1 usage or unreadable input. */
export async function runBullets(args: string[]): Promise<number> {
  const usage = "usage: workproof bullets --jd <file> (--report <report.json> | --facts <file.md>) [--resume] [--max-words N] [--out <file>]";
  let jd: string | undefined;
  let report: string | undefined;
  let facts: string | undefined;
  let out: string | undefined;
  let resume = false;
  let maxWords = DEFAULT_MAX_WORDS;
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    const value = (): string | undefined => args[++i];
    if (a === "--jd") jd = value();
    else if (a === "--report") report = value();
    else if (a === "--facts") facts = value();
    else if (a === "--out") out = value();
    else if (a === "--resume") resume = true;
    else if (a === "--max-words") {
      const n = Number(value());
      if (!Number.isInteger(n) || n < 1) {
        console.error(`--max-words needs a whole number of at least 1\n${usage}`);
        return 1;
      }
      maxWords = n;
    } else {
      console.error(`unknown option ${a}\n${usage}`);
      return 1;
    }
  }
  if (jd === undefined || (report === undefined) === (facts === undefined) || [jd, report, facts, out].some((v) => v === "")) {
    console.error(usage);
    return 1;
  }
  try {
    const jdText = await readFile(jd, "utf8");
    const source = report !== undefined
      ? { kind: "report" as const, report: JSON.parse(await readFile(report, "utf8")) as Report }
      : { kind: "facts" as const, name: facts!, markdown: await readFile(facts!, "utf8") };
    const { markdown, words, notice } = buildBullets({ jd: jdText, source, resume, maxWords });
    if (out !== undefined) {
      await writeFile(out, markdown);
      console.log(`wrote ${out} (${words} words${resume ? `, limit ${maxWords}` : ""})`);
      if (notice) console.log(notice);
    } else {
      process.stdout.write(markdown);
    }
    return 0;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}

/** `workproof mine`: prints or writes the summary of one author's work per repository. Returns the exit code: 0 produced, 1 usage or unreadable repository. */
export async function runMine(args: string[]): Promise<number> {
  const usage = "usage: workproof mine [--repo <dir>]... [--author <email|name>]... [--no-merge-identities] [--emails] [--out <file>]";
  const repos: string[] = [];
  const authors: string[] = [];
  let emails = false;
  let mergeIdentities = true;
  let out: string | undefined;
  try {
    for (let i = 0; i < args.length; i++) {
      const a = args[i]!;
      const value = (): string => {
        const v = args[++i];
        if (v === undefined || v === "") throw new Error(`${a} needs a value\n${usage}`);
        return v;
      };
      if (a === "--repo") repos.push(resolve(value()));
      else if (a === "--author") authors.push(value());
      else if (a === "--no-merge-identities") mergeIdentities = false;
      else if (a === "--emails") emails = true;
      else if (a === "--out") out = value();
      else throw new Error(`unknown option ${a}\n${usage}`);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
  // The same defaults as the report run: exclusions on, sample chosen by size, merging on unless opted out.
  // The fingerprint key is fresh and never printed; the summary carries no fingerprint.
  const params: Params = {
    depth: 2,
    threshold: 0.5,
    minCommits: 5,
    paths: false,
    emails,
    exclusions: true,
    exclude: [],
    seed: "",
    copies: false,
    fingerprintKey: newFingerprintKey(),
    mergeIdentities,
    ...(authors.length ? { author: authors } : {}),
  };
  try {
    const reports: RepoReport[] = [];
    for (const dir of repos.length ? repos : [process.cwd()]) reports.push(await analyseRepo(dir, params));
    const markdown = buildMine(reports, { emails });
    if (out !== undefined) {
      await writeFile(out, markdown);
      console.log(`wrote ${out}`);
    } else {
      process.stdout.write(markdown);
    }
    return 0;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}

/** `workproof stop-check`: the Stop hook. Reads the hook JSON on stdin, prints a block decision or nothing, and always exits 0. */
function runStopCheck(): void {
  let line = "";
  try {
    line = stopCheck(readFileSync(0, "utf8"));
  } catch {
    line = "";
  }
  if (line) process.stdout.write(`${line}\n`);
}

async function main() {
  if (process.argv[2] === "stop-check") {
    runStopCheck();
    return;
  }
  if (process.argv[2] === "sessions") runSessions(process.argv.slice(3));
  if (process.argv[2] === "bullets") {
    process.exitCode = await runBullets(process.argv.slice(3));
    return;
  }
  if (process.argv[2] === "figures") {
    process.exitCode = await runFigures(process.argv.slice(3));
    return;
  }
  if (process.argv[2] === "mine") {
    process.exitCode = await runMine(process.argv.slice(3));
    return;
  }
  if (process.argv.includes("--version")) {
    console.log(createRequire(import.meta.url)("../../package.json").version as string);
    return;
  }
  const started = Date.now();
  const { params, repos, out, format, json, doNarrate, badge, quiet, verifyFile, verdictFile, verdictOut, checkFile, attestFile, localKey, countersignFile, signKey, signLabel, countersigns, allowedSigners } = parse(process.argv.slice(2));
  // Notices stay visible under --quiet: the fingerprint key, merged addresses and split-address warnings change what a reader can check.
  const notice = (m: string) => process.stderr.write(`${m}\n`);
  const progress = quiet ? (_m: string) => {} : (m: string) => process.stderr.write(`${m}\n`);
  const printIntegrity = (i: ReturnType<typeof checkReport>) => {
    const schemaProblems = i.problems.filter((p) => !p.startsWith("hash mismatch"));
    console.log(schemaProblems.length ? `schema: ${schemaProblems.length} problem${schemaProblems.length === 1 ? "" : "s"}` : "schema ok");
    for (const p of schemaProblems) console.log(`  ${p}`);
    if (!schemaProblems.length) console.log(i.ok ? `hash ok ${i.hash.computed}` : i.problems.find((p) => p.startsWith("hash mismatch"))!);
  };
  const printCountersignature = (r: CountersignatureReading, listed: boolean) => {
    console.log(`countersignature ${r.file}`);
    if (r.keyFingerprint) {
      const trust = r.principal ? `, listed in your allowed signers as ${r.principal}` : listed ? "" : ", not checked against any list of keys you trust (pass --allowed-signers)";
      console.log(`  signed with key type ${r.keyType ?? "unknown"}, ${r.keyFingerprint}${trust}`);
    }
    if (r.label !== undefined) console.log(`  the signer's own label, not verified: ${JSON.stringify(r.label)}`);
    if (r.countersignedAt !== undefined) console.log(`  countersigned at ${r.countersignedAt}`);
    console.log(r.ok ? "  signature valid and bound to this report" : "  NOT VALID");
    for (const p of r.problems) console.log(`  ${p}`);
  };
  if (countersignFile) {
    const report = JSON.parse(await readFile(countersignFile, "utf8")) as Report;
    const toolVersion = createRequire(import.meta.url)("../../package.json").version as string;
    const statement = await countersignStatement(report, repos, {
      toolVersion,
      ...(params.fingerprintKey ? { fingerprintKey: params.fingerprintKey } : {}),
      ...(signLabel ? { label: signLabel } : {}),
    });
    const written = await signCountersignature(statement, countersignFile, signKey!);
    console.log(`wrote ${written.statement}, ${written.signature} and ${written.envelope}`);
    console.log(`Send back only the .dsse.json file: ${written.envelope}`);
    console.log(`\n${COUNTERSIGN_PROVES}\n${COUNTERSIGN_DOES_NOT_PROVE}`);
    return;
  }
  if (attestFile) {
    const { statement, predicate } = await writeStatement(attestFile);
    const files = [statement, predicate];
    if (localKey) {
      const { signature, envelope } = await signLocal(statement, localKey);
      files.push(signature, envelope);
    }
    console.log(`wrote ${files.slice(0, -1).join(", ")} and ${files[files.length - 1]}`);
    return;
  }
  if (checkFile) {
    const checked = JSON.parse(await readFile(checkFile, "utf8")) as Report;
    const result = checkReport(checked);
    printIntegrity(result);
    let failed = !result.ok;
    if (countersigns.length) {
      if (!result.ok) {
        console.log("countersignatures were not read: the report itself does not check");
      } else {
        for (const file of countersigns) {
          const reading = await readCountersignature(file, checked, allowedSigners === undefined ? {} : { allowedSigners });
          printCountersignature(reading, allowedSigners !== undefined);
          if (!reading.ok) failed = true;
        }
        console.log(`\n${COUNTERSIGN_PROVES}\n${COUNTERSIGN_DOES_NOT_PROVE}`);
      }
    }
    process.exit(failed ? 1 : 0);
  }
  if (verdictFile) {
    const reportText = await readFile(verdictFile, "utf8");
    const report = parseReportText(reportText);
    const { markdown } = await buildVerdict(report, repos, {
      reportName: basename(verdictFile),
      reportPath: verdictFile,
      reportText,
      ...(params.author ? { authors: params.author } : {}),
      ...(params.fingerprintKey ? { fingerprintKey: params.fingerprintKey } : {}),
    });
    if (verdictOut) {
      await writeFile(verdictOut, markdown);
      console.log(`wrote ${verdictOut}`);
    } else {
      process.stdout.write(markdown);
    }
    return;
  }
  if (verifyFile) {
    const report = JSON.parse(await readFile(verifyFile, "utf8")) as Report;
    const result = await verifyReport(report, repos, params.fingerprintKey ? { fingerprintKey: params.fingerprintKey } : {});
    printIntegrity(result.integrity);
    if (!result.integrity.ok) {
      console.log("the report was edited or damaged after it was written; figures were not recomputed");
      process.exit(1);
    }
    for (const f of result.fingerprints) {
      if (!f.compared) console.log(`${f.repo}: fingerprint not compared (pass --fingerprint-key)`);
      else if (!f.match) console.log(`${f.repo}: fingerprint differs; this is a different repository, figures were not recomputed`);
      else console.log(`${f.repo}: fingerprint ok`);
    }
    for (const h of result.headMoved) console.log(`HEAD moved: ${h}`);
    for (const r of result.rows) if (!r.match) console.log(`mismatch ${r.repo}/${r.figure}\n  report:     ${r.expected}\n  repository: ${r.actual}`);
    const differ = result.rows.filter((r) => !r.match).length;
    if (result.fingerprints.some((f) => f.compared && !f.match)) process.exit(1);
    console.log(result.ok ? "all figures reproduce" : `${differ} figures differ`);
    console.log(
      result.ok
        ? "\nWhat this proves: every figure in the report was recomputed from this repository just now and came out the same, and the document has not been edited since it was written.\nWhat it does not prove: that the repository itself is honest history, that the figures measure anything worth measuring, or that the work was good. A repository whose history was rewritten before the report was made reproduces perfectly."
        : "\nA figure that differs is not proof of dishonesty. HEAD moves, and every figure except tenure is computed at HEAD; check the HEAD line above before concluding anything.",
    );
    process.exit(result.ok ? 0 : 1);
  }
  const version = createRequire(import.meta.url)("../../package.json").version as string;
  if (!params.fingerprintKey) {
    // One key per report, so the repositories in a combined report share it; printed once, stored nowhere.
    params.fingerprintKey = newFingerprintKey();
    notice(`fingerprint key ${params.fingerprintKey} (keep it to compare reports or to verify the fingerprint; it is not stored)`);
  }
  const repositories: RepoReport[] = [];
  const merged = (m: MergeNotice) => {
    const n = m.emails.length;
    const shown = m.emails.slice(0, 5).join(", ") + (n > 5 ? `, and ${n - 5} more` : "");
    notice(`${m.repo}: merged ${n} other ${n === 1 ? "address" : "addresses"} into your identity because ${m.reasons.join(", ")}: ${shown}. Pass --no-merge-identities to count only the configured address, or --author to choose exactly.`);
  };
  for (const dir of repos) repositories.push(await analyseRepo(dir, params, { progress, merged }));
  const report = buildReport(repositories, params, { version, generatedAt: new Date().toISOString() });
  let narrative: string | undefined;
  if (doNarrate) {
    const url = process.env.WORKPROOF_API_URL;
    const key = process.env.WORKPROOF_API_KEY;
    const model = process.env.WORKPROOF_MODEL;
    if (!url || !key || !model) throw new Error("--narrate needs WORKPROOF_API_URL, WORKPROOF_API_KEY and WORKPROOF_MODEL");
    narrative = await narrate(report, { url, key, model });
  }
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const written: string[] = [];
  if (format === "markdown" || format === "both") {
    await writeFile(`${out}.md`, renderMarkdown(report, narrative));
    written.push(`${out}.md`);
  }
  if (format === "both") {
    await writeFile(`${out}.json`, JSON.stringify(report, null, 2));
    written.push(`${out}.json`);
  }
  if (badge) {
    await writeFile(`${out}.badge.json`, JSON.stringify(badgeFor(report), null, 2));
    written.push(`${out}.badge.json`);
  }
  for (const repo of report.repositories) {
    const split = repo.identity.possiblySplit;
    if (!split) continue;
    const n = split.count ?? split.names.length;
    const who = split.names.length ? ` (${split.names.join(", ")})` : ` ${split.hint ?? ""}`;
    notice(`${repo.name}: warning, ${n} other ${n === 1 ? "address" : "addresses"} in this repository may be the same person and ${n === 1 ? "is" : "are"} not in these figures${who}. Pass every address to --author, or merge them in a .mailmap.`);
  }
  console.log(`wrote ${written.join(" and ")} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  printStarHintIfDue({
    stdoutIsTTY: process.stdout.isTTY === true,
    stderrIsTTY: process.stderr.isTTY === true,
    env: process.env,
    quiet,
    command: starHintCommandFor(process.argv.slice(2)),
    stderr: process.stderr,
    markerExists: () => starHintMarkerExists(process.env),
    writeMarker: () => writeStarHintMarker(process.env),
  });
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (entry === import.meta.url || entry.endsWith("/workproof")) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
