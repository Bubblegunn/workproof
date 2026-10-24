import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { stopCheck, parseTurn, gapItems, writtenFileLeak, PRIVACY_REASON, GAPS_REASON, FILE_REASON } from "../src/stopcheck.js";

const AUTHOR = "grace.hopper@example.org";

function repo(): string {
  const dir = mkdtempSync(join(tmpdir(), "workproof-stop-"));
  const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  execFileSync("git", ["init", "-q"], { cwd: dir, env });
  writeFileSync(join(dir, "a.txt"), "x\n");
  execFileSync("git", ["add", "."], { cwd: dir, env });
  execFileSync("git", ["-c", "user.name=Grace", `-c`, `user.email=${AUTHOR}`, "commit", "-q", "-m", "init"], { cwd: dir, env });
  return dir;
}

type Line = Record<string, unknown>;
const user = (text: string): Line => ({ type: "user", message: { role: "user", content: text } });
const say = (text: string): Line => ({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text }] } });
const bash = (id: string, command: string): Line => ({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id, name: "Bash", input: { command } }] } });
const result = (id: string, content: string): Line => ({ type: "user", message: { role: "user", content: [{ type: "tool_result", tool_use_id: id, content }] } });

function run(lines: Line[], cwd: string, extra: Record<string, unknown> = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "workproof-stop-t-"));
  const transcript = join(dir, "t.jsonl");
  writeFileSync(transcript, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  return stopCheck(JSON.stringify({ session_id: "s", transcript_path: transcript, cwd, ...extra }));
}

const withGaps = "# Tailoring draft\n\n## Gaps\n- Kubernetes\n- Terraform (alternatives: Pulumi)\n\n## Coverage\n| a |\n";
const noGaps = "# Tailoring draft\n\n## Gaps\nNone.\n\n## Coverage\n";
const bulletsTurn = (out: string, final: string): Line[] => [user("tailor my cv"), bash("t1", "npx workproof bullets --jd jd.txt --report r.json"), result("t1", out), say(final)];

test("allows when no workproof command ran in the turn", () => {
  const cwd = repo();
  assert.equal(run([user("hi"), bash("t1", "ls"), result("t1", AUTHOR), say(`mail ${AUTHOR}`)], cwd), "");
});

test("a workproof command before the last user message does not count", () => {
  const cwd = repo();
  const lines = [user("one"), bash("t1", "npx workproof"), result("t1", "ok"), say("done"), user("two"), say(`mail ${AUTHOR}`)];
  assert.equal(run(lines, cwd), "");
});

test("allows when stop_hook_active is true", () => {
  const cwd = repo();
  const lines = [user("go"), bash("t1", "npx workproof"), result("t1", "ok"), say(`mail ${AUTHOR}`)];
  assert.equal(run(lines, cwd, { stop_hook_active: true }), "");
});

test("blocks when the final message shows a repository author address, without echoing it", () => {
  const cwd = repo();
  const lines = [user("go"), bash("t1", "node /x/dist/src/cli.js mine"), result("t1", "ok"), say(`Counted ${AUTHOR.toUpperCase()} and others.`)];
  const out = run(lines, cwd);
  assert.deepEqual(JSON.parse(out), { decision: "block", reason: PRIVACY_REASON });
  assert.ok(!out.includes("hopper"));
});

test("blocks on a fullwidth form of the address", () => {
  const cwd = repo();
  const wide = AUTHOR.replace("@", "＠").replace("grace", "ｇｒａｃｅ");
  const lines = [user("go"), bash("t1", "npx workproof"), result("t1", "ok"), say(`Address ${wide}`)];
  assert.match(run(lines, cwd), /"decision":"block"/);
});

test("blocks on an address printed by the workproof output that is not in the author data", () => {
  const cwd = repo();
  const lines = [user("go"), bash("t1", "npx workproof --emails"), result("t1", "merged old.mail@corp.example"), say("It used old.mail@corp.example.")];
  assert.match(run(lines, cwd), /"decision":"block"/);
});

test("allows when the address is absent", () => {
  const cwd = repo();
  const lines = [user("go"), bash("t1", "npx workproof"), result("t1", AUTHOR), say("Two addresses were merged.")];
  assert.equal(run(lines, cwd), "");
});

test("an address in a non-workproof tool result does not count", () => {
  const cwd = repo();
  const lines = [user("go"), bash("t1", "npx workproof"), result("t1", "ok"), bash("t2", "cat notes"), result("t2", "someone@else.example"), say("Mail someone@else.example")];
  assert.equal(run(lines, cwd), "");
});

test("bullets with Gaps and a final message that omits them blocks", () => {
  const cwd = repo();
  assert.deepEqual(JSON.parse(run(bulletsTurn(withGaps, "Your tailored resume is ready."), cwd)), { decision: "block", reason: GAPS_REASON });
});

test("a final message that names a gap item allows", () => {
  const cwd = repo();
  assert.equal(run(bulletsTurn(withGaps, "Not in your facts: kubernetes. Add them to your bank if they are true."), cwd), "");
});

test("a final message that says every requirement is covered allows", () => {
  const cwd = repo();
  assert.equal(run(bulletsTurn(withGaps, "Every requirement is covered by a fact."), cwd), "");
});

test("Gaps of None. need no gap sentence", () => {
  const cwd = repo();
  assert.equal(run(bulletsTurn(noGaps, "Done."), cwd), "");
});

test("Gaps are read from the --out file when the tool result only says it wrote the file", () => {
  const cwd = repo();
  writeFileSync(join(cwd, "cv.md"), withGaps);
  const lines = [user("go"), bash("t1", "npx workproof bullets --jd jd.txt --report r.json --resume --out cv.md"), result("t1", "wrote cv.md"), say("Ready.")];
  assert.match(run(lines, cwd), /"decision":"block"/);
  lines[3] = say("Not in your facts: Terraform. Add them to your bank if they are true.");
  assert.equal(run(lines, cwd), "");
});

test("malformed input allows", () => {
  assert.equal(stopCheck(""), "");
  assert.equal(stopCheck("not json"), "");
  assert.equal(stopCheck("{}"), "");
  assert.equal(stopCheck(JSON.stringify({ transcript_path: "/nonexistent/x.jsonl", cwd: "/nonexistent" })), "");
  const cwd = repo();
  const dir = mkdtempSync(join(tmpdir(), "workproof-stop-m-"));
  writeFileSync(join(dir, "t.jsonl"), "garbage\n{\"type\":\n");
  assert.equal(stopCheck(JSON.stringify({ transcript_path: join(dir, "t.jsonl"), cwd })), "");
});

test("parseTurn and gapItems read the shapes", () => {
  const turn = parseTurn([user("a"), bash("t1", "npx workproof"), result("t1", "x"), say("last")].map((l) => JSON.stringify(l)).join("\n"));
  assert.equal(turn.runs.length, 1);
  assert.equal(turn.finalText, "last");
  assert.deepEqual(gapItems(withGaps), ["Kubernetes", "Terraform (alternatives: Pulumi)"]);
  assert.equal(gapItems("# no section"), null);
});

test("the CLI subcommand prints the block line and exits 0", () => {
  const cwd = repo();
  const dir = mkdtempSync(join(tmpdir(), "workproof-stop-c-"));
  const transcript = join(dir, "t.jsonl");
  writeFileSync(transcript, [user("go"), bash("t1", "npx workproof"), result("t1", "ok"), say(`mail ${AUTHOR}`)].map((l) => JSON.stringify(l)).join("\n"));
  const cli = join(import.meta.dirname, "..", "src", "cli.js");
  const r = spawnSync("node", [cli, "stop-check"], { input: JSON.stringify({ transcript_path: transcript, cwd }), encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).decision, "block");
  const bad = spawnSync("node", [cli, "stop-check"], { input: "nope", encoding: "utf8" });
  assert.equal(bad.status, 0);
  assert.equal(bad.stdout, "");
});

test("the hook script prints the block line and nothing else", () => {
  const cwd = repo();
  const dir = mkdtempSync(join(tmpdir(), "workproof-stop-h-"));
  const transcript = join(dir, "t.jsonl");
  writeFileSync(transcript, [user("go"), bash("t1", "npx workproof"), result("t1", "ok"), say(`mail ${AUTHOR}`)].map((l) => JSON.stringify(l)).join("\n"));
  const script = join(import.meta.dirname, "..", "..", "hooks", "workproof-stop.sh");
  const r = spawnSync("sh", [script], { input: JSON.stringify({ transcript_path: transcript, cwd }), encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).reason, PRIVACY_REASON);
  assert.equal(spawnSync("sh", [script], { input: "x", encoding: "utf8" }).stdout, "");
});

const addressTurn = (command: string, final: string): Line[] => [user("go"), bash("t1", command), result("t1", "ok"), say(final)];

test("only a Bash command that invokes the CLI counts as a workproof run", () => {
  const cwd = repo();
  const final = `Mail ${AUTHOR}`;
  for (const cmd of ["cd workproof && npm test", "grep -r workproof src", "ls workproof/dist", 'git commit -m "workproof"']) {
    assert.equal(run(addressTurn(cmd, final), cwd), "", cmd);
  }
  for (const cmd of ["npx workproof bullets --jd j.txt", "cd x && workproof --repo .", "node dist/src/cli.js verdict r.json", "echo hi; npx -y workproof mine"]) {
    assert.match(run(addressTurn(cmd, final), cwd), /"decision":"block"/, cmd);
  }
});

test("repository addresses block only after a bullets, verdict, report or mine run", () => {
  const cwd = repo();
  const final = `Mail ${AUTHOR}`;
  assert.equal(run(addressTurn("npx workproof --help", final), cwd), "");
  assert.equal(run(addressTurn("npx workproof stop-check", final), cwd), "");
  assert.match(run(addressTurn("npx workproof verdict r.json", final), cwd), /"decision":"block"/);
  // an address in the run output blocks whatever the subcommand
  const lines = [user("go"), bash("t1", "npx workproof --help"), result("t1", "see other@corp.example"), say("Mail other@corp.example")];
  assert.match(run(lines, cwd), /"decision":"block"/);
});

test("noreply addresses never block", () => {
  const cwd = repo();
  const noreply = "12345+ada@users.noreply.github.com";
  const lines = [user("go"), bash("t1", "npx workproof mine"), result("t1", noreply), say(`Co-Authored-By: Claude <noreply@anthropic.com> and ${noreply}`)];
  assert.equal(run(lines, cwd), "");
});

test("a gap name matches whole words only, short names exactly, and an empty name is skipped", () => {
  const cwd = repo();
  const md = (items: string) => `## Gaps\n${items}\n\n## Coverage\n`;
  assert.match(run(bulletsTurn(md("- Go"), "Not in your facts: django."), cwd), /"decision":"block"/);
  assert.equal(run(bulletsTurn(md("- Go"), "Not in your facts: Go."), cwd), "");
  assert.match(run(bulletsTurn(md("- Java"), "Not in your facts: javascript."), cwd), /"decision":"block"/);
  assert.equal(run(bulletsTurn(md("- C++"), "Not in your facts: C++."), cwd), "");
  assert.match(run(bulletsTurn(md("- (empty)\n- Rust"), "Ready."), cwd), /"decision":"block"/);
});

test("a transcript with no workproof or cli.js text allows before any JSON parse", () => {
  const cwd = repo();
  assert.equal(run([user("go"), bash("t1", "ls"), result("t1", AUTHOR), say(`Mail ${AUTHOR}`)], cwd), "");
});

// --- a file the turn wrote with the Write tool ------------------------------------

const writeCall = (file: string, content: string): Line => ({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", id: "w1", name: "Write", input: { file_path: file, content } }] } });
const COMMIT_PROMPT = "List my commits for the review period.";

test("a file written with the Write tool that holds a repository address blocks once, naming only the base name", () => {
  const cwd = repo();
  const dir = mkdtempSync(join(tmpdir(), "workproof-stop-w-"));
  const file = join(dir, "review-notes.md");
  const lines = [user(COMMIT_PROMPT), bash("t1", "npx workproof mine"), result("t1", "ok"), writeCall(file, `Reviewer contact: ${AUTHOR}`), say("Saved the notes.")];
  const out = run(lines, cwd);
  assert.deepEqual(JSON.parse(out), { decision: "block", reason: FILE_REASON("review-notes.md") });
  assert.ok(!out.includes("hopper"), "the address must not appear in the reason");
  // stop_hook_active: the block is given once, so the second stop allows
  assert.equal(run(lines, cwd, { stop_hook_active: true }), "");
});

test("a Write-tool file with a repository address blocks with no workproof run when the prompt matches the trigger", () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), writeCall("/tmp/notes.md", `Mail ${AUTHOR}`), say("Saved the notes.")];
  assert.deepEqual(JSON.parse(run(lines, cwd)), { decision: "block", reason: FILE_REASON("notes.md") });
  // the same write with no run and a prompt that is not a trigger allows
  const plain = [user("Tidy my shopping list"), writeCall("/tmp/notes.md", `Mail ${AUTHOR}`), say("Saved the notes.")];
  assert.equal(run(plain, cwd), "");
});

test("the same Write-tool file with a name only, and no address, does not block", () => {
  const cwd = repo();
  const lines = [user(COMMIT_PROMPT), bash("t1", "npx workproof mine"), result("t1", "ok"), writeCall("/tmp/review-notes.md", "Reviewed by Grace Hopper."), say("Saved the notes.")];
  assert.equal(run(lines, cwd), "");
});

test("a prompt that asks for addresses lets the Write-tool file keep its address", () => {
  const cwd = repo();
  const lines = [user("List the commits and which email addresses you counted."), bash("t1", "npx workproof mine"), result("t1", "ok"), writeCall("/tmp/ids.md", `Counted ${AUTHOR}`), say("Saved the list.")];
  assert.equal(run(lines, cwd), "");
});

test("an address the user's prompt itself contained does not block the file", () => {
  const cwd = repo();
  const lines = [user(`Commits by ${AUTHOR} for the review.`), bash("t1", "npx workproof mine"), result("t1", "ok"), writeCall("/tmp/review.md", `Commits by ${AUTHOR}`), say("Saved the notes.")];
  assert.equal(run(lines, cwd), "");
});

test("a noreply address in a written file never blocks", () => {
  const noreply = "12345+ada@users.noreply.github.com";
  const turn = parseTurn(JSON.stringify(user(COMMIT_PROMPT)) + "\n" + JSON.stringify(writeCall("/tmp/n.md", `Co-Authored-By: ${noreply}`)) + "\n");
  assert.equal(writtenFileLeak(turn, [noreply, "<noreply@anthropic.com>"]), null);
  assert.equal(writtenFileLeak(turn, [noreply, AUTHOR]), null, "the repository author is not in this file");
  const real = parseTurn(JSON.stringify(user(COMMIT_PROMPT)) + "\n" + JSON.stringify(writeCall("/tmp/n.md", `Mail ${AUTHOR}`)) + "\n");
  assert.equal(writtenFileLeak(real, [noreply, AUTHOR]), FILE_REASON("n.md"));
});

test("a file whose own name holds the address never puts the address in the reason", () => {
  const turn = parseTurn(JSON.stringify(user(COMMIT_PROMPT)) + "\n" + JSON.stringify(writeCall(`/tmp/${AUTHOR}.md`, `Mail ${AUTHOR}`)) + "\n");
  const reason = writtenFileLeak(turn, [AUTHOR]);
  assert.equal(reason, FILE_REASON("(address)"));
  assert.ok(!reason!.includes("hopper"));
});
