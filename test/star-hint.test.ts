import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { makeRepo } from "./fixture.js";
import { starHintDecision, starHintMarkerPath, starHintMarkerExists, writeStarHintMarker, AGENT_ENV_VARS, STAR_HINT_LINE, printStarHintIfDue, starHintCommandFor } from "../src/cli.js";

const cli = join(process.cwd(), "dist/src/cli.js");
const FIXED_KEY = "00112233445566778899aabbccddeeff";

const base = { stdoutIsTTY: true, stderrIsTTY: true, env: {} as NodeJS.ProcessEnv, quiet: false, markerExists: false, command: "report" as "report" | "other" };
const decide = (over: Partial<typeof base> = {}) => starHintDecision({ ...base, ...over });

test("the hint shows when every condition holds", () => {
  const d = decide();
  assert.equal(d.show, true, d.reason);
});

test("the hint does not show when stdout is not a TTY", () => {
  assert.equal(decide({ stdoutIsTTY: false }).show, false);
});

test("the hint does not show when stderr is not a terminal, even if stdout is", () => {
  const d = decide({ stderrIsTTY: false });
  assert.equal(d.show, false);
  assert.equal(d.reason, "stderr is not a terminal");
});

test("the hint does not show when CI is set", () => {
  assert.equal(decide({ env: { CI: "true" } }).show, false);
  assert.equal(decide({ env: { CI: "1" } }).show, false);
  assert.equal(decide({ env: { CI: "true" } }).reason, "CI is set");
});

test("the hint shows when CI is empty, 0 or false", () => {
  for (const CI of ["", "0", "false"]) assert.equal(decide({ env: { CI } }).show, true, `CI=${JSON.stringify(CI)}`);
});

test("the hint does not show when GITHUB_ACTIONS is set", () => {
  assert.equal(decide({ env: { GITHUB_ACTIONS: "true" } }).show, false);
  assert.equal(decide({ env: { GITHUB_ACTIONS: "true" } }).reason, "GITHUB_ACTIONS is set");
});

test("the hint does not show for any agent variable, and an empty one does not count", () => {
  assert.ok(AGENT_ENV_VARS.includes("CLAUDECODE"));
  assert.ok(AGENT_ENV_VARS.includes("CLAUDE_PLUGIN_ROOT"));
  assert.ok(!(AGENT_ENV_VARS as readonly string[]).includes("AGENT"), "a generic AGENT variable must not suppress the hint for a human");
  assert.equal(decide({ env: { AGENT: "1" } }).show, true);
  for (const name of AGENT_ENV_VARS) {
    assert.equal(decide({ env: { [name]: "1" } }).show, false, `${name} set`);
    assert.equal(decide({ env: { [name]: "" } }).show, true, `${name} empty`);
  }
});

test("the hint does not show with --quiet", () => {
  assert.equal(decide({ quiet: true }).show, false);
  assert.equal(decide({ quiet: true }).reason, "--quiet");
});

test("the hint does not show with WORKPROOF_NO_STAR_HINT=1", () => {
  assert.equal(decide({ env: { WORKPROOF_NO_STAR_HINT: "1" } }).show, false);
  assert.equal(decide({ env: { WORKPROOF_NO_STAR_HINT: "0" } }).show, true);
});

test("the hint does not show when the marker exists", () => {
  assert.equal(decide({ markerExists: true }).show, false);
});

test("the hint is printed once: shown, marker written, then nothing on the next call", () => {
  let marked = false;
  let writes = 0;
  const chunks: string[] = [];
  const stderr = { write: (s: string) => { chunks.push(s); return true; } };
  const call = () => printStarHintIfDue({
    stdoutIsTTY: true,
    stderrIsTTY: true,
    env: {},
    quiet: false,
    command: "report",
    stderr,
    markerExists: () => marked,
    writeMarker: () => { marked = true; writes++; },
  });
  assert.equal(call(), true);
  assert.equal(chunks.join(""), `${STAR_HINT_LINE}\n`);
  assert.equal(writes, 1);
  chunks.length = 0;
  assert.equal(call(), false);
  assert.equal(chunks.join(""), "");
  assert.equal(writes, 1);
});

test("printStarHintIfDue prints nothing and writes no marker when stderr is redirected", () => {
  let writes = 0;
  const chunks: string[] = [];
  const shown = printStarHintIfDue({
    stdoutIsTTY: true,
    stderrIsTTY: false,
    env: {},
    quiet: false,
    command: "report",
    stderr: { write: (s: string) => { chunks.push(s); return true; } },
    markerExists: () => false,
    writeMarker: () => { writes++; },
  });
  assert.equal(shown, false);
  assert.equal(chunks.join(""), "");
  assert.equal(writes, 0);
});

test("starHintCommandFor classifies a plain run as a report and every other invocation as other", () => {
  assert.equal(starHintCommandFor([]), "report");
  assert.equal(starHintCommandFor(["--repo", "/x", "--author", "ada@example.com"]), "report");
  assert.equal(starHintCommandFor(["--format", "markdown"]), "report");
  assert.equal(starHintCommandFor(["--quiet"]), "report");
  for (const sub of ["check", "verify", "verdict", "attest", "countersign"]) {
    assert.equal(starHintCommandFor([sub, "report.json"]), "other", sub);
  }
  assert.equal(starHintCommandFor(["sessions"]), "other", "sessions");
  assert.equal(starHintCommandFor(["sessions", "--days", "30"]), "other", "sessions with flags");
  for (const flag of ["--help", "-h", "--version", "--json"]) {
    assert.equal(starHintCommandFor([flag]), "other", flag);
  }
  assert.equal(starHintCommandFor(["--format", "json"]), "other");
});

test("the subcommands never get the hint through printStarHintIfDue", () => {
  for (const sub of ["check", "verify", "verdict", "attest", "countersign"]) {
    let writes = 0;
    const chunks: string[] = [];
    const shown = printStarHintIfDue({
      stdoutIsTTY: true,
      stderrIsTTY: true,
      env: {},
      quiet: false,
      command: starHintCommandFor([sub, "report.json"]),
      stderr: { write: (s: string) => { chunks.push(s); return true; } },
      markerExists: () => false,
      writeMarker: () => { writes++; },
    });
    assert.equal(shown, false, sub);
    assert.equal(chunks.join(""), "", sub);
    assert.equal(writes, 0, sub);
  }
});

test("the marker path is under XDG_CONFIG_HOME, else under the home config directory", () => {
  assert.equal(starHintMarkerPath({ XDG_CONFIG_HOME: "/x/cfg" }), join("/x/cfg", "workproof", "star-hint-shown"));
  assert.equal(starHintMarkerPath({}), join(homedir(), ".config", "workproof", "star-hint-shown"));
  assert.equal(starHintMarkerPath({ XDG_CONFIG_HOME: "" }), join(homedir(), ".config", "workproof", "star-hint-shown"));
});

test("the marker is written once when the hint is shown, and the next decision says no", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workproof-star-"));
  try {
    const env = { XDG_CONFIG_HOME: join(dir, "config") };
    assert.equal(starHintMarkerExists(env), false);
    const first = starHintDecision({ ...base, env, markerExists: starHintMarkerExists(env) });
    assert.equal(first.show, true);
    writeStarHintMarker(env);
    assert.equal(existsSync(starHintMarkerPath(env)), true);
    const second = starHintDecision({ ...base, env, markerExists: starHintMarkerExists(env) });
    assert.equal(second.show, false);
    assert.equal(second.reason, "already shown on this machine");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an unwritable marker directory neither throws nor writes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "workproof-star-"));
  try {
    const blocker = join(dir, "blocker");
    await writeFile(blocker, "a file, so nothing can be created below it\n");
    const env = { XDG_CONFIG_HOME: join(blocker, "config") };
    assert.doesNotThrow(() => writeStarHintMarker(env));
    assert.equal(starHintMarkerExists(env), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

const SCRUB = ["CI", "GITHUB_ACTIONS", "WORKPROOF_NO_STAR_HINT", "XDG_CONFIG_HOME", ...AGENT_ENV_VARS];
function cleanEnv(home: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const k of SCRUB) delete env[k];
  return { ...env, HOME: home };
}

test("a spawned report run with piped stdout prints no star line and writes no marker", async () => {
  const repo = await makeRepo();
  const home = await mkdtemp(join(tmpdir(), "workproof-home-"));
  try {
    const out = join(home, "out");
    await mkdir(out);
    const run = spawnSync(process.execPath, [cli, "--repo", repo, "--author", "ada@example.com", "--out", join(out, "r")], { encoding: "utf8", env: cleanEnv(home), cwd: repo, stdio: ["ignore", "pipe", "pipe"] });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /^wrote /m);
    assert.ok(!run.stdout.includes("star on GitHub"));
    assert.ok(!run.stderr.includes("star on GitHub"));
    assert.equal(existsSync(starHintMarkerPath(cleanEnv(home))), false);
  } finally {
    await rm(repo, { recursive: true, force: true });
    await rm(home, { recursive: true, force: true });
  }
});

test("--quiet suppresses the progress lines on stderr, and a run without it shows them", async () => {
  const repo = await makeRepo();
  const home = await mkdtemp(join(tmpdir(), "workproof-home-"));
  try {
    const run = (extra: string[], name: string) =>
      spawnSync(process.execPath, [cli, "--repo", repo, "--author", "ada@example.com", "--out", join(home, name), ...extra], { encoding: "utf8", env: cleanEnv(home), cwd: repo });
    const loud = run([], "loud");
    assert.equal(loud.status, 0, loud.stderr);
    assert.match(loud.stderr, /blaming files/);
    const quiet = run(["--quiet"], "quiet");
    assert.equal(quiet.status, 0, quiet.stderr);
    assert.ok(!/blaming files|reading history/.test(quiet.stderr), quiet.stderr);
    assert.match(quiet.stderr, /fingerprint key [0-9a-f]{32}/, "the key verify needs stays visible");
    assert.match(quiet.stdout, /^wrote /m);
  } finally {
    await rm(repo, { recursive: true, force: true });
    await rm(home, { recursive: true, force: true });
  }
});

test("the report content is the same with the hint off, with --quiet, and in a plain run", async () => {
  const repo = await makeRepo();
  const home = await mkdtemp(join(tmpdir(), "workproof-home-"));
  try {
    const make = (name: string, extra: string[], env: NodeJS.ProcessEnv) => {
      const out = join(home, name);
      const run = spawnSync(process.execPath, [cli, "--repo", repo, "--author", "ada@example.com", "--fingerprint-key", FIXED_KEY, "--out", out, ...extra], { encoding: "utf8", env, cwd: repo });
      assert.equal(run.status, 0, run.stderr);
      return out;
    };
    const plain = make("plain", [], cleanEnv(home));
    const noHint = make("nohint", [], { ...cleanEnv(home), WORKPROOF_NO_STAR_HINT: "1" });
    const quiet = make("quiet", ["--quiet"], cleanEnv(home));
    const strip = async (file: string) => (await readFile(`${file}.json`, "utf8")).replace(/"generatedAt": "[^"]*"/, "");
    const reference = await strip(plain);
    assert.equal(await strip(noHint), reference);
    assert.equal(await strip(quiet), reference);
    const markdown = await readFile(`${quiet}.md`, "utf8");
    assert.ok(!markdown.includes("star on GitHub"));
  } finally {
    await rm(repo, { recursive: true, force: true });
    await rm(home, { recursive: true, force: true });
  }
});
