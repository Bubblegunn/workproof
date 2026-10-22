import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = (f) => readFileSync(join(root, f), "utf8");

const INSTALL_BLOCK = "```\ncd your-private-repo\nnpx workproof\n```";
const PLUGIN_LINE = "/plugin install workproof --marketplace Bubblegunn/workproof";
const SKILLS_LINE = "npx skills add Bubblegunn/workproof";
const DASH = /[–—]/;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

// Character offset of the first line equal to `line`, or -1.
function lineOffset(text, line) {
  let off = 0;
  for (const l of text.split("\n")) {
    if (l === line) return off;
    off += l.length + 1;
  }
  return -1;
}

// Character offset of the first line matching `re`, or -1.
function matchingLineOffset(text, re) {
  let off = 0;
  for (const l of text.split("\n")) {
    if (re.test(l)) return off;
    off += l.length + 1;
  }
  return -1;
}

const GIF_LINE = /^!\[[^\]]*\]\(docs\/demo\.gif\)$/;

test("both READMEs give the three install routes in order, all before the recording", () => {
  for (const f of ["README.md", "README.tr.md"]) {
    const t = read(f);
    const npx = t.indexOf(INSTALL_BLOCK);
    const plugin = lineOffset(t, PLUGIN_LINE);
    const skills = lineOffset(t, SKILLS_LINE);
    const gif = matchingLineOffset(t, GIF_LINE);
    assert.ok(npx >= 0 && plugin >= 0 && skills >= 0 && gif >= 0, `${f}: missing ${[npx, plugin, skills, gif]}`);
    assert.ok(npx < plugin && plugin < skills && skills < gif, `${f}: order is ${[npx, plugin, skills, gif]}`);
  }
});

test("README.md, CHANGELOG.md and PLUGIN-COMPARISON credit JD Resume Tailor and Dayesh Raval", () => {
  for (const f of ["README.md", "CHANGELOG.md", "docs/PLUGIN-COMPARISON.md"]) {
    const t = read(f);
    assert.ok(t.includes("Dayesh Raval"), `${f} does not name Dayesh Raval`);
    assert.ok(t.includes("JD Resume Tailor"), `${f} does not name JD Resume Tailor`);
  }
});

test("CHANGELOG has an Unreleased entry above 0.7.0 naming the flag, the four commands and the bullets reference", () => {
  const t = read("CHANGELOG.md");
  const u = t.indexOf("\n## Unreleased\n");
  const v = t.indexOf("\n## 0.7.0 ");
  assert.ok(u >= 0, "no ## Unreleased heading");
  assert.ok(v > u, "## Unreleased is not above ## 0.7.0");
  const block = t.slice(u, v);
  assert.ok(block.includes("--no-merge-identities"), "Unreleased lacks --no-merge-identities");
  for (const c of ["/workproof", "/verify-report", "/cv-bullets", "/self-review"]) {
    assert.ok(block.includes(c), `Unreleased lacks ${c}`);
  }
  assert.ok(block.includes("references/bullets.md"), "Unreleased lacks references/bullets.md");
});

test("README documents --no-merge-identities, and the identity paragraph says merged rather than warning only", () => {
  for (const f of ["README.md", "README.tr.md"]) {
    assert.ok(read(f).includes("--no-merge-identities"), `${f} does not document --no-merge-identities`);
  }
  const en = read("README.md");
  const para = en.split(/\n\s*\n/).find((p) => p.includes("possiblySplit"));
  assert.ok(para, "README.md: no paragraph names possiblySplit");
  assert.ok(para.includes("merged"), "README.md: the possiblySplit paragraph does not say merged");
  assert.ok(para.includes("--no-merge-identities"), "README.md: the possiblySplit paragraph does not name --no-merge-identities");
  assert.ok(!en.includes("never merges them for you"), "README still says the tool never merges addresses");
  assert.ok(!en.includes("was not counted here"), "README example still says the address was not counted");
});

test("PLUGIN-COMPARISON links HEAD-TO-HEAD, names the other tools with licences, and has the 'Where the others are ahead' section", () => {
  const t = read("docs/PLUGIN-COMPARISON.md");
  assert.ok(t.includes("(HEAD-TO-HEAD.md)"), "no relative link to HEAD-TO-HEAD.md");
  const header = t.split("\n").find((l) => l.startsWith("|"));
  assert.ok(header, "no table");
  for (const col of ["receipts (Apache-2.0)", "JD Resume Tailor (MIT)", "GapToGrowth (MIT)", "Infinite Resume"]) {
    assert.ok(header.includes(col), `table header lacks ${col}`);
  }
  const at = t.indexOf("## Where the others are ahead");
  assert.ok(at >= 0, "no 'Where the others are ahead' section");
  const end = t.indexOf("\n## ", at + 5);
  const body = t.slice(at, end === -1 ? undefined : end);
  assert.ok(body.includes("Claude Code usage receipt"), "section does not name the Claude Code usage receipt");
  assert.ok(body.includes("job description"), "section does not name tailoring to a job description");
});

test("README.md and README.tr.md link PLUGIN-COMPARISON and HEAD-TO-HEAD", () => {
  for (const f of ["README.md", "README.tr.md"]) {
    const t = read(f);
    assert.ok(t.includes("](docs/PLUGIN-COMPARISON.md)"), `${f} does not link PLUGIN-COMPARISON`);
    assert.ok(t.includes("](docs/HEAD-TO-HEAD.md)"), `${f} does not link HEAD-TO-HEAD`);
  }
});

test("PLUGIN-COMPARISON has no em dash, no en dash, no email address and no Gmail address", () => {
  const t = read("docs/PLUGIN-COMPARISON.md");
  assert.ok(!DASH.test(t), "contains an em dash or en dash");
  assert.ok(!EMAIL.test(t), "contains an email address");
  assert.ok(!/gmail/i.test(t), "names Gmail");
});

test("the receipts miner adaptation is credited under Apache-2.0 in the README, the Turkish README, the changelog and the comparison", () => {
  for (const f of ["README.md", "README.tr.md", "CHANGELOG.md", "docs/PLUGIN-COMPARISON.md"]) {
    const text = read(f);
    assert.ok(text.includes("mine-sessions.mjs"), `${f} does not name the miner`);
    assert.ok(text.includes("Apache"), `${f} does not name the licence`);
    assert.ok(text.includes("receipts"), `${f} does not name receipts`);
  }
});
