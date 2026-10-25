import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync, execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Trigger classes for hooks/workproof-hint.sh. The phrasings are written for the five intent classes, in
// varied wording; they are not copied from any benchmark task. Positives run with the working directory
// inside a git work tree (the usual case); negatives run with a directory that is not a repository, so a
// prompt that only mentions "report" or "history" without git or work context must stay silent.
const root = join(import.meta.dirname, "..");
const hook = join(root, "hooks", "workproof-hint.sh");
const session = join(root, "hooks", "workproof-session.sh");
const phrasings = JSON.parse(readFileSync(join(root, "test", "fixtures", "trigger-phrasings.json"), "utf8"));
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const gitDir = mkdtempSync(join(tmpdir(), "wp-trigger-git-"));
const plainDir = mkdtempSync(join(tmpdir(), "wp-trigger-plain-"));
execFileSync("git", ["init", "-q", gitDir], { env: cleanEnv });
mkdirSync(join(plainDir, "x"));

const run = (script, cwd, prompt) =>
  spawnSync("sh", [script], {
    input: JSON.stringify({ cwd, hook_event_name: "UserPromptSubmit", prompt }),
    env: { ...cleanEnv, CLAUDE_PLUGIN_ROOT: root },
    encoding: "utf8",
    timeout: 10000,
  });
const matches = (cwd, prompt) => {
  const r = run(hook, cwd, prompt);
  assert.equal(r.status, 0);
  return r.stdout.trim() !== "";
};

const classes = ["work_delivery", "report_summary", "evidence_proof", "usage", "claim_check"];

test("phrasings file has at least 40 per class and 40 negatives", () => {
  for (const c of classes) assert.ok(phrasings[c].length >= 40, `${c}: ${phrasings[c].length}`);
  assert.ok(phrasings.negative.length >= 40);
});

for (const c of classes) {
  test(`trigger recall >= 90 percent: ${c}`, () => {
    const misses = phrasings[c].filter((p) => !matches(gitDir, p));
    const recall = 1 - misses.length / phrasings[c].length;
    if (misses.length) console.log(`${c}: recall ${(recall * 100).toFixed(1)}%, misses:\n  ${misses.join("\n  ")}`);
    assert.ok(recall >= 0.9, `${c} recall ${recall.toFixed(3)}; misses: ${misses.join(" | ")}`);
  });
}

test("no false positive on the negatives", () => {
  const fp = phrasings.negative.filter((p) => matches(plainDir, p));
  if (fp.length) console.log(`false positives:\n  ${fp.join("\n  ")}`);
  assert.deepEqual(fp, []);
});

test("git-vocabulary coding prompts stay mostly silent in a git work tree (false positive budget 10 percent)", () => {
  assert.ok(phrasings.negative_git.length >= 40);
  const fp = phrasings.negative_git.filter((p) => matches(gitDir, p));
  if (fp.length) console.log(`git-cwd false positives:\n  ${fp.join("\n  ")}`);
  assert.ok(fp.length <= phrasings.negative_git.length * 0.1, `${fp.length} false positives: ${fp.join(" | ")}`);
});

test("a weak match (repository word or cwd only) gets the pointer, not the run-the-tool instruction", () => {
  const weak = JSON.parse(run(hook, gitDir, "Write the Q3 summary for the review doc").stdout).hookSpecificOutput.additionalContext;
  assert.match(weak, /workproof core rules/);
  assert.doesNotMatch(weak, /Run the tool as:/);
  const strong = JSON.parse(run(hook, gitDir, "How many commits and lines in the git history are mine? I need it for my promotion self-review.").stdout).hookSpecificOutput.additionalContext;
  assert.match(strong, /Run the tool as: node \S+\/dist\/src\/cli\.js <command>/);
});

test("the request is found after a long pasted text and after a line break", () => {
  const filler = "Invoice line item, 40 hours, design work, project phase two. ".repeat(100);
  assert.ok(matches(gitDir, `${filler}\n\nCheck whether the contractor's claim matches the commit history.`));
  assert.ok(matches(gitDir, "Here is the context.\nCheck whether the vendor's claim matches the commit history."));
  assert.ok(matches(gitDir, "Context first.\r\nI need a quarterly summary of my commits."));
});

test("a very large input is capped and still exits 0", () => {
  const r = run(hook, gitDir, "x ".repeat(400000));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "");
});

test("prompts in a language other than English are a known limit: no match is required", () => {
  // Documented limit: the word lists are English. This test only pins that the hook stays silent and exits 0.
  const r = run(hook, plainDir, "Kisi gecmisimden ozet cikar");
  assert.equal(r.status, 0);
});

test("the UserPromptSubmit hook has a timeout", () => {
  const h = JSON.parse(readFileSync(join(root, "hooks", "hooks.json"), "utf8")).hooks.UserPromptSubmit[0].hooks[0];
  assert.equal(h.timeout, 8);
});

test("the rules live in core-rules.md only: the hint carries their keywords and SKILL.md rule 9 is a pointer", () => {
  const keywords = ["please confirm", "listed apart", "whitespace", "holds with an exception", "committer date", "purpose the user states", "namesake caution", "not verifiable here"];
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  const skill = readFileSync(join(root, "skills", "workproof", "SKILL.md"), "utf8");
  const ctx = JSON.parse(run(hook, gitDir, phrasings.claim_check[0]).stdout).hookSpecificOutput.additionalContext;
  const flatCtx = ctx.replace(/\s+/g, " ");
  for (const k of keywords) {
    const re = new RegExp(k, "i");
    assert.match(core, re, `core-rules lacks ${k}`);
    assert.match(flatCtx, re, `hint context lacks ${k}`);
  }
  const rule9 = skill.split("\n").find((l) => l.startsWith("9. ")) ?? "";
  assert.match(rule9, /references\/core-rules\.md/);
  assert.ok(rule9.length < 700, `SKILL.md rule 9 is ${rule9.length} characters; the bullets live in core-rules.md`);
  assert.doesNotMatch(skill, /^   - (Identity|Window|Deliverables|Audience|Counts|Provenance|Dates):/m, "SKILL.md still repeats the document rules");
});

test("the hint and the session pointer lead to the tools through core-rules.md", () => {
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  assert.match(core, /`workproof figures`/);
  assert.match(core, /`people`/);
  const ctx = JSON.parse(run(hook, gitDir, phrasings.claim_check[0]).stdout).hookSpecificOutput.additionalContext;
  assert.match(ctx.replace(/\s+/g, " "), /Numbers come from `workproof figures` \(one person\), `people` \(several people\)/);
  const out = JSON.parse(run(session, gitDir, "").stdout).hookSpecificOutput.additionalContext;
  assert.match(out, /figures/);
});

test("a matching prompt gets the intent class and the rules block, and is not sent to re-read the rules file", () => {
  const r = run(hook, gitDir, phrasings.claim_check[0]);
  const ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
  assert.match(ctx, /Intent: .*claim/);
  assert.match(ctx, /workproof core rules/);
  assert.doesNotMatch(ctx, /references\/core-rules\.md/, "the rules are in the context; naming the file makes the model read them again");
});

test("the hint still answers when the rules file is missing", () => {
  const r = spawnSync("sh", [hook], {
    input: JSON.stringify({ cwd: gitDir, prompt: phrasings.evidence_proof[0] }),
    env: { ...cleanEnv, CLAUDE_PLUGIN_ROOT: join(tmpdir(), "wp-no-such-root") },
    encoding: "utf8",
  });
  assert.equal(r.status, 0);
  const ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
  assert.doesNotMatch(ctx, /workproof core rules/);
});

test("session hook: pointer inside a git work tree, nothing outside", () => {
  const inside = run(session, gitDir, "");
  assert.equal(inside.status, 0);
  const out = JSON.parse(inside.stdout).hookSpecificOutput;
  assert.equal(out.hookEventName, "SessionStart");
  assert.doesNotMatch(out.additionalContext, /core-rules\.md/, "naming the rules file makes the model read it again; the hint carries the rules");
  assert.match(out.additionalContext, /do not read the rules file/);
  assert.match(out.additionalContext, new RegExp(`${root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/dist/src/cli\\.js figures`));
  assert.equal(out.additionalContext.split("\n").length, 3);
  const outside = run(session, plainDir, "");
  assert.equal(outside.status, 0);
  assert.equal(outside.stdout, "");
});

// Redesign (round 16): the rules shrank from 4,300 to about 2,500 characters. The conventions moved into labelled tool rows.
test("core-rules.md is short and lists rules 1 to 8", () => {
  const text = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  assert.ok(text.length <= 2800, `${text.length} characters`);
  for (let i = 1; i <= 8; i++) assert.match(text, new RegExp(`^${i}\\. `, "m"));
});

test("core-rules.md carries each rule inside its numbered line", () => {
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  const line = (n) => core.split("\n").find((l) => l.startsWith(`${n}. `)) ?? "";
  const checks = {
    1: [/Not computed is not zero/i, /state both/i],
    2: [/purpose the user states picks the headline/i, /other reading goes beside it in one line/i, /UTC unless the user names one/i, /impossible author dates/i, /merged people beside proven-only/i, /Never pick a convention the user did not ask for/i],
    3: [/`people`/, /figures --person NAME/, /please confirm/i, /another organisation is joined too, with a namesake caution and the proven-only figure beside it/i],
    4: [/Listed apart with the reason/i, /vendored/i, /reverted work/i],
    5: [/Write only the file the user asked for/i, /Addresses stay out of documents/i],
    6: [/holds with an exception/i, /not verifiable here/i, /committer alone is not the author/i],
    7: [/commit share and the line share/i],
    8: [/Hedge only for a real ambiguity/i],
  };
  for (const [n, res] of Object.entries(checks)) {
    for (const re of res) assert.match(line(n), re, `rule ${n} lacks ${re}`);
  }
});

test("core-rules.md no longer fixes a convention that depends on the user's purpose", () => {
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  // These sentences chose one reading for every user and caused most of the fresh-writer losses of gates 3 and 4.
  for (const gone of [/stays in lines written/i, /is its own row/i, /Signed-off-by are no help/i, /omit from dated lists/i, /commits authored before the window .* are outside/i, /evidence\//, /figures --doc/]) {
    assert.doesNotMatch(core, gone, `core-rules.md still contains ${gone}`);
  }
});

test("core-rules.md stays under the 4500 bytes the hint reads, so no rule is cut mid-line", () => {
  const f = join(root, "skills", "workproof", "references", "core-rules.md");
  const text = readFileSync(f, "utf8");
  assert.ok(Buffer.byteLength(text) < 4500, `${Buffer.byteLength(text)} bytes`);
});

test("the hint points review-evidence requests to `workproof reviews` and ownership claims to `workproof owner`, and only those", () => {
  const ctx = (text) => JSON.parse(run(hook, gitDir, text).stdout).hookSpecificOutput.additionalContext;
  const review = ctx("Our auditor wants evidence that every change in Q1 got a second person's review, recorded as Reviewed-by trailers in commit messages; write a CSV of change, author, reviewer.");
  assert.match(review, /cli\.js reviews --path <area>/);
  assert.doesNotMatch(review, /cli\.js owner --path <path>/);
  const owner = ctx(phrasings.claim_check[0] + " The candidate says they wrote the parser module.");
  assert.match(owner, /cli\.js owner --path <path>/);
  const plain = ctx(phrasings.work_delivery[0]);
  assert.doesNotMatch(plain, /reviews --path <area>/);
});

test("near-miss negatives: general git help, code review, commit messages and repo health reports stay silent even inside a repository", () => {
  assert.ok(phrasings.near_miss.length >= 15, `${phrasings.near_miss.length} near-miss phrasings`);
  const fp = phrasings.near_miss.filter((p) => matches(gitDir, p));
  assert.deepEqual(fp, []);
});

// Auditor, compliance, reviewer and approver wording is an evidence intent. The entries that name those roles are
// read from the fixture, so the test follows the fixture and fails if a word is removed from the hook.
test("audit and review-record phrasings (auditor, compliance, Reviewed-by, approver, second person's review) fire", () => {
  const roles = /auditor|compliance (team|officer)|reviewed-by trailers?|second person/i;
  const audit = phrasings.evidence_proof.filter((p) => roles.test(p));
  assert.ok(audit.length >= 4, `${audit.length} audit phrasings in the fixture`);
  const misses = audit.filter((p) => !matches(gitDir, p));
  assert.deepEqual(misses, []);
});

test.after(() => {
  rmSync(gitDir, { recursive: true, force: true });
  rmSync(plainDir, { recursive: true, force: true });
});
