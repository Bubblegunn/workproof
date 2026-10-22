import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from "node:fs";
import os, { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const scriptPath = join(root, "hooks", "workproof-hint.sh");
const hooksPath = join(root, "hooks", "hooks.json");
const script = readFileSync(scriptPath, "utf8");

const frozen = JSON.parse(readFileSync(join(root, "bench", "head-to-head", "hook-prompts.json"), "utf8"));
const tasksFile = JSON.parse(readFileSync(join(root, "bench", "head-to-head", "tasks.json"), "utf8"));
const taskPrompts = Object.entries(tasksFile.tasks).map(([id, t]) => [
  id,
  t.prompt.replaceAll("{suffix}", tasksFile.suffix).replaceAll("{home}", homedir()),
]);

const positives = [
  ...frozen.positives.map((p, i) => [`P${i + 1}`, p]),
  ...taskPrompts,
];
const negatives = frozen.negatives.map((p, i) => [`N${i + 1}`, p]);

const shells = ["sh", ...(existsSync("/bin/dash") ? ["/bin/dash"] : [])];

// The hook input is the JSON Claude Code sends on stdin. The cwd is set to a path that
// contains the word "workproof", so a match that reads past the prompt field would show.
const hookInput = (prompt) =>
  JSON.stringify({
    session_id: "test-session",
    cwd: "/Users/example/workproof",
    hook_event_name: "UserPromptSubmit",
    prompt,
  });

// GIT_* variables are dropped (a hook run from a git hook would leak GIT_DIR), and the global git config is
// ignored, so the identity a throwaway repository sees is only the one the test set.
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const gitEnv = { ...cleanEnv, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };

function run(input, { shell = "sh", cwd = root } = {}) {
  const t0 = process.hrtime.bigint();
  const r = spawnSync(shell, [scriptPath], { input, cwd, encoding: "utf8", env: gitEnv });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { stdout: r.stdout, stderr: r.stderr, status: r.status, ms };
}

function assertHint(stdout) {
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(out.hookSpecificOutput.additionalContext, /workproof skill/);
}

for (const [id, prompt] of positives) {
  test(`${id} yields one valid JSON hint naming the workproof skill`, () => {
    const r = run(hookInput(prompt));
    assert.equal(r.status, 0);
    assertHint(r.stdout);
  });
}

test("the 20 negative prompts add nothing and exit 0", () => {
  const fired = negatives.filter(([, prompt]) => {
    const r = run(hookInput(prompt));
    assert.equal(r.status, 0);
    return r.stdout !== "";
  });
  console.log(`false triggers on the ${negatives.length} negatives: ${fired.length} of ${negatives.length}`);
  assert.deepEqual(fired.map(([id]) => id), []);
});

const extraNegatives = JSON.parse(readFileSync(join(root, "bench", "head-to-head", "hook-extra-negatives.json"), "utf8")).negatives;

test("the extra negatives add nothing and exit 0", () => {
  const fired = extraNegatives.filter((prompt) => {
    const r = run(hookInput(prompt));
    assert.equal(r.status, 0);
    return r.stdout !== "";
  });
  console.log(`false triggers on the ${extraNegatives.length} extra negatives: ${fired.length} of ${extraNegatives.length}`);
  assert.deepEqual(fired, []);
});

test("the positives matched count is printed (every frozen positive and task prompt)", () => {
  const matched = positives.filter(([, prompt]) => run(hookInput(prompt)).stdout !== "");
  console.log(`positives matched ${matched.length} of ${positives.length}`);
  assert.equal(matched.length, positives.length);
});

// Round 5: email-address phrasings. The eight positives must add the hint; the eight close negatives must add nothing.
const r5 = JSON.parse(readFileSync(join(root, "bench", "head-to-head", "hook-prompts-r5.json"), "utf8"));

for (const [i, prompt] of r5.positives.entries()) {
  test(`R${i + 1} (round 5 email-address positive) yields one valid JSON hint naming the workproof skill`, () => {
    const r = run(hookInput(prompt));
    assert.equal(r.status, 0);
    assertHint(r.stdout);
  });
}

test("the round 5 negatives add nothing and exit 0", () => {
  const fired = r5.negatives.filter((prompt) => {
    const r = run(hookInput(prompt));
    assert.equal(r.status, 0);
    return r.stdout !== "";
  });
  console.log(`false triggers on the ${r5.negatives.length} round 5 negatives: ${fired.length} of ${r5.negatives.length}`);
  assert.deepEqual(fired, []);
});

// Close negatives with the first-person, commit and email parts present but no counting intent: the counting part must
// stop them. They are not in the frozen lists; they exist so that a counting part that matches everything is caught.
const noCountingIntent = [
  "several email addresses are on the commits I made, rewrite the author on them",
  "two email addresses on my old commits, fix the author name on each one",
];

test("email phrasings without any counting intent add nothing and exit 0", () => {
  const fired = noCountingIntent.filter((prompt) => {
    const r = run(hookInput(prompt));
    assert.equal(r.status, 0);
    return r.stdout !== "";
  });
  assert.deepEqual(fired, []);
});

test("only the first 4000 characters are matched: a positive at 4000 is seen, one at 4500 is not", () => {
  const phrase = "Tailor my resume to this job description. ";
  const pad = (n) => "x".repeat(n);
  const early = run(hookInput(pad(3900) + phrase));
  assert.equal(early.status, 0);
  assertHint(early.stdout);
  const late = run(hookInput(pad(4500) + phrase));
  assert.equal(late.status, 0);
  assert.equal(late.stdout, "");
});

test("a 100 KB prompt with a positive in its first 4000 characters matches in under 150 ms (median of five)", () => {
  const input = hookInput("Tailor my resume to this job description. " + "lorem ipsum dolor sit amet ".repeat(4000));
  assert.ok(Buffer.byteLength(input) > 100 * 1024);
  const times = [];
  for (let i = 0; i < 5; i++) {
    const r = run(input);
    assert.equal(r.status, 0);
    assertHint(r.stdout);
    times.push(r.ms);
  }
  times.sort((a, b) => a - b);
  console.log(`100 KB prompt median runtime: ${times[2].toFixed(1)} ms`);
  assert.ok(times[2] < 150, `median ${times[2].toFixed(1)} ms`);
});

for (const [name, input] of [
  ["empty input", ""],
  ["input without a prompt field", JSON.stringify({ session_id: "x", cwd: "/a/workproof" })],
  ["garbage input", "not json at all {{{ ]]"],
]) {
  test(`${name} yields no output and exit 0`, () => {
    const r = run(input);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, "");
  });
}

test("a prompt with escaped quotes and newlines still yields valid JSON", () => {
  const prompt = 'He wrote "proof of my work"\nin this private repo\tfor a visa';
  const r = run(hookInput(prompt));
  assert.equal(r.status, 0);
  assertHint(r.stdout);
});

test("a raw escaped quote before the matching words still yields valid JSON", () => {
  const raw = '{"prompt":"he said \\"hi\\" then prove what I built here"}';
  const r = run(raw);
  assert.equal(r.status, 0);
  assertHint(r.stdout);
});

test("a pretty-printed multi-line hook input still matches", () => {
  const r = run(JSON.stringify({ prompt: "Give me a usage report for my manager about my Claude Code sessions" }, null, 2));
  assert.equal(r.status, 0);
  assertHint(r.stdout);
});

for (const shell of shells) {
  test(`${shell}: positives trigger and negatives stay silent`, () => {
    for (const [id, prompt] of positives) {
      const r = run(hookInput(prompt), { shell });
      assert.equal(r.status, 0, id);
      assertHint(r.stdout);
    }
    for (const [id, prompt] of negatives) {
      const r = run(hookInput(prompt), { shell });
      assert.equal(r.stdout, "", id);
    }
  });
}

test("median of 15 runs on a positive prompt is under 50 ms (best of three batches, so a busy machine does not fail it)", () => {
  const input = hookInput(positives[0][1]);
  const medians = [];
  for (let batch = 0; batch < 3; batch++) {
    const times = [];
    for (let i = 0; i < 15; i++) {
      const r = run(input);
      assert.equal(r.status, 0);
      times.push(r.ms);
    }
    times.sort((a, b) => a - b);
    medians.push(times[7]);
    if (times[7] < 50) break;
  }
  const best = Math.min(...medians);
  console.log(`median runtime: ${best.toFixed(1)} ms`);
  // The 50 ms budget is for a machine that is not saturated; when the one-minute load is above half the CPU count the limit is relaxed to 200 ms so the test measures the script and not the machine.
  const busy = os.loadavg()[0] > os.cpus().length * 0.5;
  const limit = busy ? 200 : 50;
  assert.ok(best < limit, `best median ${best.toFixed(1)} ms (limit ${limit} ms, busy machine: ${busy})`);
});

test("the script is POSIX sh, executable, and free of network, launcher, write and credential rules", () => {
  assert.equal(script.split("\n")[0], "#!/bin/sh");
  assert.notEqual(statSync(scriptPath).mode & 0o111, 0, "script must be executable");

  // Code: the script without comments and without the output text (the generic line, the plain-count sentence,
  // and the basis sentence's noreply phrase, which says "git config" in words).
  // Only the exact noreply phrase is removed, after joining, so a forbidden word on the same code line is still checked.
  const code = script
    .split("\n")
    .filter((l) => !/^\s*#/.test(l) && !l.includes("This request matches") && !l.includes("Plain git count"))
    .join("\n")
    .replaceAll("a GitHub noreply address whose login matches the name or the address in git config", "");

  const forbidden = [
    /\bcurl\b/, /\bwget\b/, /\bnc\b/, /\bnode\b/, /\bnpm\b/, /\bpython\d?\b/,
    /\bopen\b/, /\bssh\b/, /~\//, /\$HOME/, /credential/i, /token/i,
    /\.claude\.json/, /settings\.json/, /KEY/,
    // Writing git subcommands. The word alone is not checked: the prompt patterns legitimately say "commit history".
    /\bgit\b[^\n]*\b(commit|push|add|checkout|fetch|clone)\b/,
  ];
  for (const re of forbidden) assert.doesNotMatch(code, re, `forbidden: ${re}`);

  // git: every git word is `git -C "$cwd" <subcommand>`, and the subcommands are the four read-only ones.
  const readOnly = ["config", "shortlog", "rev-parse", "rev-list"];
  // A git invocation is `git` and a space; the prompt patterns contain `git` only as regex text (git[[:space:]]...).
  const gitWords = code.match(/\bgit /g) || [];
  const gitSubcommands = [...code.matchAll(/\bgit -C "\$cwd" ([a-z-]+)/g)].map((m) => m[1]);
  assert.equal(gitSubcommands.length, gitWords.length, 'every git word must be git -C "$cwd" <subcommand>');
  for (const sub of gitSubcommands) assert.ok(readOnly.includes(sub), `git ${sub} is not read-only`);
  assert.deepEqual([...new Set(gitSubcommands)].sort(), [...readOnly].sort());

  // npx is allowed only inside the output text: the generic line and the plain-count sentence.
  const npxLines = script.split("\n").filter((l) => l.includes("npx"));
  assert.ok(npxLines.length >= 1, "output text must mention npx");
  for (const line of npxLines) {
    assert.ok(/This request matches|verifiable figures/.test(line), `npx outside the output text: ${line}`);
  }

  // Redirections: the only allowed targets are /dev/null and >&2.
  const withoutAllowed = code.replace(/\d?>\s*\/dev\/null/g, "").replace(/>&2/g, "");
  assert.ok(!withoutAllowed.includes(">"), "a redirection to a file is present");
});

test("hooks.json registers the script under UserPromptSubmit with the plugin root path", () => {
  const hooks = JSON.parse(readFileSync(hooksPath, "utf8")).hooks;
  assert.deepEqual(Object.keys(hooks), ["UserPromptSubmit"]);
  const command = hooks.UserPromptSubmit[0].hooks[0].command;
  assert.equal(command, '"${CLAUDE_PLUGIN_ROOT}/hooks/workproof-hint.sh"');
});

test("the hook writes nothing: an empty working directory stays empty after a match", () => {
  const dir = mkdtempSync(join(tmpdir(), "workproof-hook-"));
  for (const [, prompt] of [positives[0], negatives[0]]) {
    const r = run(hookInput(prompt), { cwd: dir });
    assert.equal(r.status, 0);
  }
  assert.deepEqual(readdirSync(dir), []);
});

test("negatives found by the round 5 review (bare words such as contribution, share, total and merge no longer satisfy the email rule) add nothing", () => {
  for (const p of [
    "my app has two email addresses per user, share the contribution form total",
    "different email addresses in the config, and merge two branches in this repo",
  ]) {
    const r = run(hookInput(p));
    assert.equal(r.status, 0);
    assert.equal(r.stdout.trim(), "", p);
  }
});

// ---- Several-addresses answer: for an email-address question the hook computes the figures from git ----

const CONFIGURED = { name: "Jonathan Ong", email: "jonathan@example.com" };
const STRANGER = { name: "Someone Else", email: "someone@example.com" };
const COUNT = "I committed to this repo from several email addresses. How many commits are mine?";
const ASK = "I committed to this repo from several email addresses. Which email addresses are mine?";
const COUNT_SENTENCE =
  "Plain git count (git shortlog -sne --no-merges, a quick estimate that can differ from the tool by bot and generated-file exclusions): " +
  "10 non-merge commits across 4 address(es): the configured one, 1 carrying the configured name, 1 whose address name matches, " +
  "1 GitHub noreply address(es) whose login matches. These are rules, not proof, and may include another person who shares the name or the address name. For the full verifiable figures run `npx workproof mine --out <file>`.";

// The paste-ready basis sentence the hook appends when another address is merged (decoded JSON text).
const SAME_PHRASE = "an address whose commits carry the same name";
const NOREPLY_PHRASE = "a GitHub noreply address whose login matches the name or the address in git config";
const ADDRESS_PHRASE = "an address whose name matches the GitHub login";
const basisFor = (count, phrases) =>
  ` To record the basis, paste this under a heading "Which addresses are counted": "Counted as the same person: ` +
  `${count} other ${count === 1 ? "address" : "addresses"}, because the rules matched: ${phrases.join("; ")}. ` +
  `This is a rule, not proof: it can be wrong, and --no-merge-identities counts only the configured address and addresses with the same name."`;

const nonRepo = mkdtempSync(join(tmpdir(), "workproof-norepo-"));
const hookInputIn = (prompt, cwd) =>
  JSON.stringify({ session_id: "test-session", cwd, hook_event_name: "UserPromptSubmit", prompt });
const genericFor = (prompt) => run(hookInputIn(prompt, nonRepo)).stdout;

function git(dir, args, env = {}) {
  const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", env: { ...gitEnv, ...env } });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
}

function identityEnv({ name, email }) {
  return { GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email };
}

function makeRepo(identity) {
  const dir = mkdtempSync(join(tmpdir(), "workproof-addr-"));
  git(dir, ["init", "-q", "-b", "main"]);
  if (identity) {
    git(dir, ["config", "user.name", identity.name]);
    git(dir, ["config", "user.email", identity.email]);
  }
  return dir;
}

function commitAs(dir, identity, count = 1) {
  for (let i = 0; i < count; i++) git(dir, ["commit", "-q", "--allow-empty", "-m", "work"], identityEnv(identity));
}

// Configured address (3 commits), a second address with the configured name (3 commits, one of them under
// another name), an address whose local part matches (2), a noreply login equal to the squashed name (2),
// a stranger (4, one on a side branch), and one merge commit by the configured address (not counted).
// Merged total: 3 + 3 + 2 + 2 = 10 across 4 addresses.
function personRepo() {
  const dir = makeRepo(CONFIGURED);
  commitAs(dir, CONFIGURED, 3);
  commitAs(dir, { name: "Jonathan Ong", email: "jon.ong@example.net" }, 2);
  commitAs(dir, { name: "J Ong", email: "jon.ong@example.net" }, 1);
  commitAs(dir, { name: "Jon Other", email: "jonathan@example.org" }, 2);
  commitAs(dir, { name: "jonathanong", email: "12345+jonathanong@users.noreply.github.com" }, 2);
  commitAs(dir, STRANGER, 3);
  git(dir, ["checkout", "-q", "-b", "side"]);
  commitAs(dir, STRANGER, 1);
  git(dir, ["checkout", "-q", "main"]);
  git(dir, ["merge", "-q", "--no-ff", "-m", "merge side", "side"], identityEnv(CONFIGURED));
  return dir;
}

// Writes history with git fast-import: every tenth commit is by the stranger, the rest by the configured address.
function fastImport(dir, count) {
  const chunks = [];
  for (let i = 1; i <= count; i++) {
    const who = i % 10 === 0 ? STRANGER : CONFIGURED;
    const when = `${1_600_000_000 + i} +0000`;
    chunks.push(
      `commit refs/heads/main\nmark :${i}\nauthor ${who.name} <${who.email}> ${when}\n` +
        `committer ${who.name} <${who.email}> ${when}\ndata 2\nc\n`,
    );
    if (i > 1) chunks.push(`from :${i - 1}\n`);
    chunks.push("\n");
  }
  const r = spawnSync("git", ["-C", dir, "fast-import", "--quiet"], { input: chunks.join(""), encoding: "utf8", env: gitEnv });
  assert.equal(r.status, 0, r.stderr);
}

const contextOf = (stdout) => JSON.parse(stdout).hookSpecificOutput.additionalContext;

test("(1) the count prompt states the merged total and group counts, names no address and no name, and skips strangers and merges", () => {
  const dir = personRepo();
  const r = run(hookInputIn(COUNT, dir));
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "");
  assertHint(r.stdout);
  const ctx = contextOf(r.stdout);
  assert.ok(ctx.endsWith(" " + COUNT_SENTENCE + basisFor(1, [NOREPLY_PHRASE])), ctx);
  for (const leak of ["@", "Jonathan", "Jon Other", "jonathanong", "Ong", "Someone", "example"]) {
    assert.ok(!ctx.includes(leak), `leaked: ${leak}`);
  }
});

test("(2) the ask prompt lists the merged addresses, leaves the stranger out, and stays valid JSON", () => {
  const dir = personRepo();
  const r = run(hookInputIn(ASK, dir));
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "");
  assertHint(r.stdout);
  const ctx = contextOf(r.stdout);
  assert.ok(ctx.includes(" Addresses: "), ctx);
  assert.ok(ctx.endsWith(basisFor(1, [NOREPLY_PHRASE])), ctx);
  for (const a of [
    "jonathan@example.com",
    "jon.ong@example.net",
    "jonathan@example.org",
    "12345+jonathanong@users.noreply.github.com",
  ]) {
    assert.ok(ctx.includes(a), `missing ${a}`);
  }
  assert.ok(!ctx.includes("someone@example.com"));
});

test("(3) not a repository, no cwd, a missing cwd, or no git identity: exactly the generic line, nothing on stderr", () => {
  const expected = genericFor(ASK);
  assertHint(expected);
  assert.ok(!expected.includes("non-merge"));
  const noIdentity = makeRepo(null);
  commitAs(noIdentity, CONFIGURED, 2);
  const cases = [
    run(JSON.stringify({ prompt: ASK }), { cwd: nonRepo }),
    run(hookInputIn(ASK, join(nonRepo, "does-not-exist"))),
    run(hookInputIn(ASK, noIdentity)),
  ];
  for (const r of cases) {
    assert.equal(r.status, 0);
    assert.equal(r.stderr, "");
    assert.equal(r.stdout, expected);
  }
});

test("(4) a prompt for another rule with a repository cwd gives exactly the generic line", () => {
  const dir = personRepo();
  const cv = "Write CV bullets for my work in this repository.";
  const r = run(hookInputIn(cv, dir));
  assert.equal(r.stdout, genericFor(cv));
  assertHint(r.stdout);
  assert.ok(!r.stdout.includes("non-merge"));
});

test("(5) the frozen negatives add nothing even with a repository cwd", () => {
  const dir = personRepo();
  const all = [...negatives.map(([, p]) => p), ...extraNegatives, ...r5.negatives];
  const fired = all.filter((p) => {
    const r = run(hookInputIn(p, dir));
    assert.equal(r.status, 0);
    return r.stdout !== "";
  });
  assert.deepEqual(fired, []);
});

test("(6) the T6 task prompt with a repository cwd computes the count", () => {
  const dir = personRepo();
  const t6 = taskPrompts.find(([id]) => id === "T6")[1];
  const r = run(hookInputIn(t6, dir));
  assert.equal(r.status, 0);
  assertHint(r.stdout);
  assert.match(contextOf(r.stdout), /Plain git count .* 10 non-merge commits across 4 address\(es\)/);
});

test("(7) a 10,001-commit repository: the hook computes in under 300 ms (median of five; 1000 ms on a busy machine)", () => {
  const dir = makeRepo(CONFIGURED);
  fastImport(dir, 10001);
  const input = hookInputIn(COUNT, dir);
  const times = [];
  for (let i = 0; i < 5; i++) {
    const r = run(input);
    assert.equal(r.status, 0);
    assert.equal(r.stderr, "");
    assertHint(r.stdout);
    assert.match(contextOf(r.stdout), /non-merge commits across/);
    times.push(r.ms);
  }
  times.sort((a, b) => a - b);
  const busy = os.loadavg()[0] > os.cpus().length * 0.5;
  const limit = busy ? 1000 : 300;
  console.log(`10,001-commit repository median runtime: ${times[2].toFixed(1)} ms (busy machine: ${busy})`);
  assert.ok(times[2] < limit, `median ${times[2].toFixed(1)} ms (limit ${limit} ms)`);
});

test("(7b) a 20,001-commit history is skipped: exactly the generic line", () => {
  const dir = makeRepo(CONFIGURED);
  fastImport(dir, 20001);
  const r = run(hookInputIn(COUNT, dir));
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "");
  assert.equal(r.stdout, genericFor(COUNT));
});

test("(8) the computed path writes nothing: git status and the directory listing are unchanged", () => {
  const dir = personRepo();
  const snapshot = () => ({
    status: git(dir, ["status", "--porcelain"]),
    files: readdirSync(dir, { recursive: true }).sort(),
  });
  const before = snapshot();
  const r = run(hookInputIn(ASK, dir));
  assert.ok(r.stdout.includes("Addresses:"));
  assert.deepEqual(snapshot(), before);
});

test("(9) round 7 review fixes: a noreply login equal to the configured address name is counted as a noreply group, the list is JSON-safe with control characters removed, and a cwd with a backslash stays generic", () => {
  const dir = makeRepo({ name: "Ada Lovelace", email: "ada.l@example.com" });
  commitAs(dir, { name: "Ada Lovelace", email: "ada.l@example.com" }, 2);
  commitAs(dir, { name: "adal", email: "77+ada.l@users.noreply.github.com" }, 3);
  const ctx = contextOf(run(hookInputIn(COUNT, dir)).stdout);
  assert.match(ctx, /5 non-merge commits across 2 address\(es\): the configured one, 1 GitHub noreply address\(es\) whose login matches\./);
  assert.ok(!/address name matches/.test(ctx));
  assert.match(ctx, /may include another person who shares the name or the address name/);
  assert.ok(ctx.endsWith(basisFor(1, [NOREPLY_PHRASE])), ctx);
  const asked = run(hookInputIn("which email addresses are mine, how many commits do I have across my three email addresses", dir));
  const out = contextOf(asked.stdout);
  assert.ok(out.includes("Addresses: "));
  assert.ok(out.endsWith(basisFor(1, [NOREPLY_PHRASE])), out);
  assert.ok(!/[\u0000-\u001f]/.test(out));
  const bs = run(JSON.stringify({ cwd: "C:\\\\repo\\\\x", hook_event_name: "UserPromptSubmit", prompt: COUNT }));
  assert.equal(contextOf(bs.stdout), contextOf(genericFor(COUNT)));
});

// ---- Paste-ready basis sentence: the hook's wording equals the one `workproof mine` prints ----

// The configured address (3 commits), then one noreply address per login (2 commits each). Every noreply login
// equals the name squashed, so the login rule merges each of them in the CLI and the hook alike.
function noreplyRepo(noreplies) {
  const dir = makeRepo(CONFIGURED);
  commitAs(dir, CONFIGURED, 3);
  for (const email of noreplies) commitAs(dir, { name: "jonathanong", email }, 2);
  return dir;
}

function mineLine(dir) {
  const r = spawnSync(process.execPath, [join(root, "dist", "src", "cli.js"), "mine"], { cwd: dir, encoding: "utf8", env: gitEnv });
  assert.equal(r.status, 0, r.stderr);
  const line = r.stdout.split("\n").find((l) => l.startsWith("Counted as the same person: "));
  assert.ok(line, r.stdout);
  return line;
}

test("(10) with one merged address, the hook's basis sentence equals the sentence workproof mine prints, and the JSON escapes its quotes", () => {
  const dir = noreplyRepo(["12345+jonathanong@users.noreply.github.com"]);
  const line = mineLine(dir);
  assert.match(line, /^Counted as the same person: 1 other address, because the rules matched: a GitHub noreply address/);
  const r = run(hookInputIn(COUNT, dir));
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "");
  assert.ok(r.stdout.includes('\\"Which addresses are counted\\"'), r.stdout);
  const ctx = contextOf(r.stdout);
  assert.ok(ctx.endsWith(` To record the basis, paste this under a heading "Which addresses are counted": "${line}"`), ctx);
});

test("(10b) with two merged addresses, the hook's plural wording equals the sentence workproof mine prints", () => {
  const dir = noreplyRepo(["12345+jonathanong@users.noreply.github.com", "99+jonathanong@users.noreply.github.com"]);
  const line = mineLine(dir);
  assert.match(line, /^Counted as the same person: 2 other addresses, because the rules matched: a GitHub noreply address/);
  const ctx = contextOf(run(hookInputIn(COUNT, dir)).stdout);
  assert.ok(ctx.endsWith(` To record the basis, paste this under a heading "Which addresses are counted": "${line}"`), ctx);
});

test("(11) with only the configured address found, nothing is appended: no basis sentence, the computed sentence ends as before", () => {
  const dir = makeRepo(CONFIGURED);
  commitAs(dir, CONFIGURED, 3);
  const r = run(hookInputIn(COUNT, dir));
  assert.equal(r.status, 0);
  assertHint(r.stdout);
  const ctx = contextOf(r.stdout);
  assert.ok(!ctx.includes("To record the basis"), ctx);
  assert.ok(!ctx.includes("Counted as the same person"), ctx);
  assert.match(ctx, /across 1 address\(es\): the configured one\. These are rules, not proof[^]*`npx workproof mine --out <file>`\.$/);
});

// A same-name second address is not merged by mine (it is in the base identity), so the computed sentence names it
// and no basis sentence is appended.
test("(12) a second address with only the configured name gives the computed sentence and NO basis sentence", () => {
  const dir = makeRepo(CONFIGURED);
  commitAs(dir, CONFIGURED, 2);
  commitAs(dir, { name: "Jonathan Ong", email: "jon.ong@example.net" }, 3);
  const r = run(hookInputIn(COUNT, dir));
  assert.equal(r.status, 0);
  assertHint(r.stdout);
  const ctx = contextOf(r.stdout);
  assert.match(ctx, /5 non-merge commits across 2 address\(es\): the configured one, 1 carrying the configured name\. These are rules, not proof[^]*`npx workproof mine --out <file>`\.$/);
  assert.ok(!ctx.includes("To record the basis"), ctx);
  assert.ok(!ctx.includes("Counted as the same person"), ctx);
});

// The same local part on another domain is only a warning in mine, so it is not named in a basis sentence either.
test("(13) a second address with the same local part on another domain gives the computed sentence and NO basis sentence", () => {
  const dir = makeRepo({ name: "Ada Lovelace", email: "a@x.example" });
  commitAs(dir, { name: "Ada Lovelace", email: "a@x.example" }, 2);
  commitAs(dir, { name: "Someone Else", email: "a@y.example" }, 2);
  const r = run(hookInputIn(COUNT, dir));
  assert.equal(r.status, 0);
  assertHint(r.stdout);
  const ctx = contextOf(r.stdout);
  assert.match(ctx, /4 non-merge commits across 2 address\(es\): the configured one, 1 whose address name matches\. These are rules, not proof/);
  assert.ok(!ctx.includes("To record the basis"), ctx);
  assert.ok(!ctx.includes("Counted as the same person"), ctx);
});
