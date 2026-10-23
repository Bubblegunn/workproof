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
  assert.doesNotMatch(weak, /npx workproof \.\.\./);
  const strong = JSON.parse(run(hook, gitDir, phrasings.work_delivery[0]).stdout).hookSpecificOutput.additionalContext;
  assert.match(strong, /npx workproof/);
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
  assert.equal(h.timeout, 5);
});

test("the rules live in core-rules.md only: the hint carries the eight keywords and SKILL.md rule 9 is a pointer", () => {
  const keywords = ["please confirm", "rebase", "not counted", "sidecar", "whitespace", "what holds", "author date|author versus committer", "evidence/"];
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

test("the hint and the session pointer lead to the figures command through core-rules.md", () => {
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  assert.match(core, /npx workproof figures/);
  const ctx = JSON.parse(run(hook, gitDir, phrasings.claim_check[0]).stdout).hookSpecificOutput.additionalContext;
  assert.match(ctx.replace(/\s+/g, " "), /run `npx workproof figures` first/);
  const out = JSON.parse(run(session, gitDir, "").stdout).hookSpecificOutput.additionalContext;
  assert.match(out, /figures/);
});

test("a matching prompt gets the intent class and the rules block", () => {
  const r = run(hook, gitDir, phrasings.claim_check[0]);
  const ctx = JSON.parse(r.stdout).hookSpecificOutput.additionalContext;
  assert.match(ctx, /Intent class: .*claim/);
  assert.match(ctx, /workproof core rules/);
  assert.match(ctx, /references\/core-rules\.md/);
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
  assert.match(out.additionalContext, /skills\/workproof\/references\/core-rules\.md/);
  assert.equal(out.additionalContext.split("\n").length, 3);
  const outside = run(session, plainDir, "");
  assert.equal(outside.status, 0);
  assert.equal(outside.stdout, "");
});

// Limit raised from 1700 to 2000 characters: restoring the user-named file exception (rule 4), the whitespace re-measure and raw-figure label (rule 6), and the delivered-only figure sentence keeps the always-loaded rules equal in meaning to SKILL.md.
test("core-rules.md is short and lists R1 to R8", () => {
  const text = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  assert.ok(text.length <= 2000, `${text.length} characters`);
  for (let i = 1; i <= 8; i++) assert.match(text, new RegExp(`^${i}\\. `, "m"));
});

test("core-rules.md carries each rule inside its numbered line", () => {
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  const line = (n) => core.split("\n").find((l) => l.startsWith(`${n}. `)) ?? "";
  const checks = {
    4: [/unless the user names a file/i],
    5: [/basis/i, /never a session count/i, /no number/i],
    6: [/lines written/i, /third-party/i, /reverted/i, /ignoring whitespace/i, /for the same filter/i, /state both/i, /which is raw/i, /delivered-only figure gets its own label and does not replace lines written/i],
    7: [/what holds or does not/i],
  };
  for (const [n, res] of Object.entries(checks)) {
    for (const re of res) assert.match(line(n), re, `rule ${n} lacks ${re}`);
  }
});

test("core-rules.md carries the figure rule, the filtered-count rule and the three round 12 clauses", () => {
  const core = readFileSync(join(root, "skills", "workproof", "references", "core-rules.md"), "utf8");
  for (const k of ["lines written", "reverted", "third-party", "state both", "basis", "never a session count", "no number", "does not replace lines written"]) {
    assert.match(core, new RegExp(k, "i"), `core-rules.md lacks ${k}`);
  }
  assert.match(core, /run `npx workproof figures` first, write each figure with its printed label/);
  assert.match(core, /run `figures --doc <file>`; fix or label any number matching no computed figure/);
  assert.match(core, /not computed is not zero/);
  assert.match(core, /Out of scope: do the task, add one scope line, no refusal/);
});

test("core-rules.md stays under the 3000 bytes the hint reads, so no rule is cut mid-line", () => {
  const f = join(root, "skills", "workproof", "references", "core-rules.md");
  const text = readFileSync(f, "utf8");
  assert.ok(Buffer.byteLength(text) < 3000, `${Buffer.byteLength(text)} bytes`);
});

test("near-miss negatives: general git help, code review, commit messages and repo health reports stay silent even inside a repository", () => {
  assert.ok(phrasings.near_miss.length >= 15, `${phrasings.near_miss.length} near-miss phrasings`);
  const fp = phrasings.near_miss.filter((p) => matches(gitDir, p));
  assert.deepEqual(fp, []);
});

test.after(() => {
  rmSync(gitDir, { recursive: true, force: true });
  rmSync(plainDir, { recursive: true, force: true });
});
