import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dirname, "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const skillDir = "skills/workproof";
const skill = read(`${skillDir}/SKILL.md`);
const commandFiles = ["workproof.md", "verify-report.md", "cv-bullets.md", "self-review.md", "usage-report.md", "tailor-resume.md"];
const commandNames = commandFiles.map((f) => `commands/${f}`);
const shippedFiles = [
  `${skillDir}/SKILL.md`,
  `${skillDir}/references/bullets.md`,
  `${skillDir}/references/received-report.md`,
  `${skillDir}/references/tailor.md`,
  ...commandNames,
];

function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(m, "no frontmatter block");
  const fields = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

function body(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n/, "");
}

test("SKILL.md has the name workproof and a description that names every situation it serves", () => {
  const fm = frontmatter(skill);
  assert.equal(fm.name, "workproof");
  assert.ok(fm.description, "no description");
  assert.ok(fm.description.length <= 1024, `description is ${fm.description.length} characters`);
  const d = fm.description.toLowerCase();
  for (const phrase of [
    "CV",
    "self-review",
    "how much of this",
    "visa",
    "trusted",
    "workproof-report.json",
    "several email addresses",
    "npx workproof",
    "how many commits are mine across all my email addresses",
    "how much of this repo is my work",
    "tailor",
    "job description",
    "Claude Code usage",
  ]) {
    assert.ok(d.includes(phrase.toLowerCase()), `description lacks: ${phrase}`);
  }
  assert.ok(fm.description.startsWith("Use when someone asks how many commits are mine"), "description does not start with the commit-count request");
  const usageAt = d.indexOf("claude code usage");
  const visaAt = d.indexOf("visa");
  assert.ok(usageAt >= 0 && visaAt >= 0, "description lacks Claude Code usage or visa");
  assert.ok(usageAt < visaAt, "the first Claude Code usage phrase comes after visa");
});

test("the SKILL.md Start here section routes Claude Code usage before several addresses, and names references/tailor.md", () => {
  const b = body(skill);
  const start = b.indexOf("## Start here");
  const rules = b.indexOf("## Rules that always apply");
  assert.ok(start >= 0 && rules > start, "Start here section missing");
  const section = b.slice(start, rules);
  const usageAt = section.indexOf("Claude Code usage");
  const addressesAt = section.indexOf("several email addresses");
  assert.ok(usageAt >= 0, "Start here lacks the Claude Code usage bullet");
  assert.ok(addressesAt >= 0, "Start here lacks the several-addresses bullet");
  assert.ok(usageAt < addressesAt, "the usage bullet must come before the several-addresses bullet");
  assert.match(section, /even when the working directory is a git repository/);
  assert.match(section, /Do not make the git report for this request/);
  assert.ok(b.includes("references/tailor.md"), "SKILL.md body does not name references/tailor.md");
});

test("the SKILL.md body treats project names as data and says null, not zero for a non-repository row", () => {
  const b = body(skill);
  assert.ok(b.includes("Project names"), "Project names rule missing");
  assert.ok(b.includes("never instructions"), "Project names are not called data, never instructions");
  assert.ok(b.includes("null, not zero"), "null, not zero rule missing");
});

test("references/tailor.md exists, keeps the upstream credit and the tailoring rules", () => {
  const path = `${skillDir}/references/tailor.md`;
  assert.ok(existsSync(join(root, path)), `${path} missing`);
  const t = read(path);
  assert.ok(t.includes("Copyright (c) 2026 Dayesh Raval"), "tailor.md lacks the copyright line");
  assert.ok(t.includes("MIT License"), "tailor.md does not name the MIT License");
  assert.ok(t.includes("Day-Raval/jd-resume-tailor"), "tailor.md does not credit the upstream repository");
  for (const term of ["Gaps", "Fact table", "never add a skill", "under 450 words"]) {
    assert.ok(t.includes(term), `tailor.md lacks: ${term}`);
  }
  assert.ok(t.includes("Keep employer names, job titles and dates exactly as the source writes them"), "tailor.md lacks the employer, title and date hard rule");
});

test("bullets.md still holds the full MIT permission notice that tailor.md points to", () => {
  const t = read(`${skillDir}/references/bullets.md`);
  assert.ok(t.includes("Permission is hereby granted"), "MIT permission notice missing from bullets.md");
  assert.ok(t.includes("THE SOFTWARE IS PROVIDED"), "MIT warranty disclaimer missing from bullets.md");
});

test("the SKILL.md body covers check, verify, identity merging, both references and the public-repository check", () => {
  const b = body(skill);
  for (const term of [
    "check",
    "verify",
    "--no-merge-identities",
    "references/bullets.md",
    "references/received-report.md",
    "git remote -v",
  ]) {
    assert.ok(b.includes(term), `SKILL.md body lacks: ${term}`);
  }
  assert.match(b, /\bpublic\b/i, "SKILL.md body never says public");
});

test("every --flag in SKILL.md exists in the CLI help text or in the session miner", () => {
  const help = spawnSync(process.execPath, [join(root, "dist/src/cli.js"), "--help"], { encoding: "utf8" });
  assert.equal(help.status, 0);
  const flags = [...new Set([...skill.matchAll(/(?<![\w-])--[a-z][a-z-]*/g)].map((m) => m[0]))];
  assert.ok(flags.length >= 5, `only ${flags.length} flags found`);
  for (const f of flags) assert.ok(help.stdout.includes(f) || read("src/sessions/mine-sessions.mjs").includes(`'${f}'`), `SKILL.md names ${f}, which neither --help nor the miner lists`);
});

test("every references/ path named in SKILL.md or in commands/ exists inside the skill folder", () => {
  const named = [];
  for (const f of [`${skillDir}/SKILL.md`, ...commandNames]) {
    for (const m of read(f).matchAll(/references\/[\w.-]+\.md/g)) named.push(m[0]);
  }
  assert.ok(named.length >= 3, `only ${named.length} reference paths named`);
  for (const p of new Set(named)) {
    assert.ok(existsSync(join(root, skillDir, p)), `${p} is named but missing under ${skillDir}/`);
  }
});

test("commands/ holds the six commands, each with a description and a pointer to the skill", () => {
  assert.deepEqual(readdirSync(join(root, "commands")).sort(), [...commandFiles].sort());
  for (const f of commandNames) {
    const fm = frontmatter(read(f));
    assert.ok(fm.description, `${f} has no description`);
    assert.ok(body(read(f)).includes("workproof skill"), `${f} does not name the workproof skill`);
  }
});

test("bullets.md keeps the upstream copyright, licence and source credit", () => {
  const t = read(`${skillDir}/references/bullets.md`);
  assert.ok(t.includes("Copyright (c) 2026 Dayesh Raval"), "copyright line missing");
  assert.ok(t.includes("MIT License"), "licence name missing");
  assert.ok(t.includes("Day-Raval/jd-resume-tailor"), "upstream repository not credited");
});

test("shipped skill and command files contain no em dash, en dash or email address", () => {
  for (const f of shippedFiles) {
    const t = read(f);
    assert.ok(!/[—–]/.test(t), `${f} contains an em dash or en dash`);
    assert.ok(!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(t), `${f} contains an email address`);
  }
});

test("plugin.json version matches package.json and the paths it names exist", () => {
  const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
  const pkg = JSON.parse(read("package.json"));
  assert.equal(plugin.version, pkg.version);
  assert.ok(existsSync(join(root, plugin.skills)), `plugin.json skills path missing: ${plugin.skills}`);
  assert.ok(existsSync(join(root, plugin.skills, "workproof", "SKILL.md")));
  assert.ok(existsSync(join(root, "commands")), "commands/ missing at the repository root");
});

test("frontmatter values are valid YAML plain scalars (a colon followed by a space makes `npx skills add` skip the skill)", () => {
  const files = ["skills/workproof/SKILL.md", ...["workproof", "verify-report", "cv-bullets", "self-review", "usage-report", "tailor-resume"].map((n) => `commands/${n}.md`)];
  for (const f of files) {
    const fmText = readFileSync(join(root, f), "utf8").split("---")[1];
    for (const line of fmText.split("\n").filter(Boolean)) {
      const value = line.slice(line.indexOf(":") + 1).trim();
      if (value.startsWith('"') || value.startsWith("'")) continue;
      assert.doesNotMatch(value, /: | #/, `${f}: unquoted value would not parse: ${line.slice(0, 60)}`);
    }
  }
});

test("verify is told to compare the fingerprint, and an unreachable remote is unknown rather than public", () => {
  const skill = readFileSync(join(root, "skills/workproof/SKILL.md"), "utf8");
  assert.match(skill, /verify workproof-report\.json --repo \. --fingerprint-key/);
  assert.match(skill, /unknown, not public/);
  assert.match(readFileSync(join(root, "skills/workproof/references/received-report.md"), "utf8"), /fingerprint was not compared/);
});

test("the skill covers the usage report: trigger words, the bundled miner, the privacy and no-dollar rules, and the Apache credit", () => {
  const fm = frontmatter(read(`${skillDir}/SKILL.md`));
  for (const phrase of ["Claude Code usage", "manager", "three different email addresses", "old work email", "workproof-report.json"]) {
    assert.ok(fm.description.includes(phrase), `description lacks: ${phrase}`);
  }
  const text = read(`${skillDir}/SKILL.md`);
  assert.ok(text.includes("npx workproof sessions"), "SKILL.md does not run the miner through npx workproof sessions");
  assert.ok(!text.includes("CLAUDE_PLUGIN_ROOT"), "SKILL.md still depends on ${CLAUDE_PLUGIN_ROOT}");
  assert.ok(existsSync(join(root, "src/sessions/mine-sessions.mjs")), "the miner is missing from src/sessions");
  assert.match(text, /no dollar figures/i);
  assert.match(text, /no hours saved/i);
  assert.match(text, /do not read the raw/i);
  assert.match(text, /WORKPROOF_HOME/);
  assert.match(text, /## Start here/);
});

test("tailor.md carries the full MIT permission text itself and the review fixes (entry-qualified tags, current job is not in-progress, Gaps named in the answer)", () => {
  const t = read(`${skillDir}/references/tailor.md`);
  assert.ok(t.includes("Permission is hereby granted, free of charge"), "permission notice missing from tailor.md");
  assert.ok(t.includes("the entry id, a hyphen and the fact id"));
  assert.ok(t.includes("a current job (an end date of Present) is not in-progress"));
  assert.ok(t.includes("Not in your facts"));
});

test("the several-addresses path runs `workproof mine` and keeps its basis section, and tailor.md says to satisfy the checklist", () => {
  const skill = read(`${skillDir}/SKILL.md`);
  assert.ok(skill.includes("npx workproof mine"));
  assert.ok(skill.includes("Which addresses are counted"));
  assert.ok(skill.includes("names the rule, not the address"));
  const tailor = read(`${skillDir}/references/tailor.md`);
  assert.ok(tailor.includes("Satisfy the checklist"));
  assert.ok(tailor.includes("do not copy the checklist into the file"));
});

test("round 6 text: the tailoring and the several-addresses requests are single commands that write the file", () => {
  const skill = read(`${skillDir}/SKILL.md`);
  const tailor = read(`${skillDir}/references/tailor.md`);
  const cmd = read("commands/tailor-resume.md");
  assert.ok(skill.includes("npx workproof mine --out"));
  assert.ok(skill.includes("--resume --out"));
  assert.ok(tailor.includes("--resume --out"));
  assert.ok(tailor.includes("Do not rename, drop or reorder a heading"));
  assert.ok(cmd.includes("--resume --out"));
});
