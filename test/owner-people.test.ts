import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { computeOwner } from "../src/owner.js";
import { isFormattingOnly, normaliseLine } from "../src/figures/format.js";
import { groupPeople } from "../src/figures/people.js";
import type { PersonCommit } from "../src/figures/people.js";
import { buildHistory } from "./history.js";

const body = (q: string, n: number, tag: string) => Array.from({ length: n }, (_, i) => `name_${tag}_${i} = ${q}value ${i}${q}`).join("\n") + "\n";
const row = (r: { rows: { label: string; value: string }[] }, label: string) => r.rows.find((x) => x.label.startsWith(label));

test("normaliseLine and isFormattingOnly: quotes, whitespace and trailing commas are formatting; a changed value is not", () => {
  assert.equal(normaliseLine("  x = 'a',"), normaliseLine('x="a"'));
  const rm = Array.from({ length: 12 }, (_, i) => `v${i} = 'a${i}'`);
  assert.equal(isFormattingOnly(rm, rm.map((l) => l.replace(/'/g, '"'))), true);
  assert.equal(isFormattingOnly(rm, rm.map((l) => l.replace("a", "b"))), false);
  assert.equal(isFormattingOnly(rm.slice(0, 5), rm.slice(0, 5).map((l) => l.replace(/'/g, '"'))), false, "too small to call");
});

test("groupPeople: an initial with the surname of exactly one full name is joined as probable; two candidates are not guessed", () => {
  const c = (name: string, email: string): PersonCommit => ({ sha: name + email, name, email, body: "m", parents: 1, committerEmail: email });
  const one = groupPeople([c("Dana Whitfield", "dana@acme-labs.dev"), c("D. Whitfield", "dw@users.noreply.example.org")]);
  assert.equal(one.people.length, 1);
  assert.equal(one.merges[0]!.rule, "first name shortened to an initial with the surname of one full name");
  const two = groupPeople([c("Dana Whitfield", "dana@acme-labs.dev"), c("Dora Whitfield", "dora@beta-works.dev"), c("D. Whitfield", "dw@users.noreply.example.org")]);
  assert.equal(two.people.length, 3, "Dana and Dora both fit D.: nobody is chosen");
});

const DANA = { name: "Dana Whitfield", email: "dana.whitfield@acme-old.example" };
const DANA2 = { name: "Dana Whitfield", email: "dwhitfield@personal.example" };
const DANAN = { name: "D. Whitfield", email: "dana.w@users.noreply.example" };
const MARCUS = { name: "Marcus Obi", email: "marcus@acme-labs.dev" };
const BOT = { name: "ci-bot", email: "49699333+ci-bot[bot]@users.noreply.github.com" };

async function cacheRepo(): Promise<string> {
  return buildHistory([
    { ...DANA, date: "2025-02-03T10:00:00Z", message: "Add store", files: { "src/cache/store.py": body("'", 40, "s") } },
    { ...DANA2, date: "2025-04-03T10:00:00Z", message: "Add serialization", files: { "src/cache/ser.py": body("'", 30, "r") } },
    { ...MARCUS, date: "2025-06-01T10:00:00Z", message: "style: reformat to double quotes", files: { "src/cache/store.py": body('"', 40, "s"), "src/cache/ser.py": body('"', 30, "r") } },
    { ...MARCUS, date: "2025-07-01T10:00:00Z", message: "Add redis backend (#41)\n\nCo-authored-by: D. Whitfield <dana.w@users.noreply.example>", files: { "src/cache/redis.py": body('"', 20, "x") } },
    { ...BOT, date: "2025-08-01T10:00:00Z", message: "chore: license header", files: { "src/cache/header.py": "# Licensed under MIT\n" } },
    { ...DANAN, date: "2025-09-01T10:00:00Z", message: "Add metrics", files: { "src/cache/metrics.py": body('"', 10, "m") } },
  ]);
}

test("owner: a mass quote reformat is detected and skipped, bots are left out, addresses of one person are joined, co-author credit is its own number", async () => {
  const dir = await cacheRepo();
  try {
    const r = await computeOwner({ path: "src/cache", repo: dir, claim: "Dana Whitfield", json: false });
    const plain = row(r, "surviving lines by author, whitespace and moves ignored");
    assert.match(plain!.value, /\d+ lines/);
    const fmt = row(r, "formatting-only commits");
    assert.equal(fmt!.value, "1");
    assert.ok(r.rows.some((x) => /style: reformat to double quotes/.test(x.value)), "the reformat commit is listed with its subject");
    const people = row(r, "surviving lines by person");
    assert.match(people!.value, /100 lines not by a bot \(1 bot line left out\)/, "40 + 30 + 20 + 10 human lines; the license header is the bot's");
    const claim = row(r, "claim person: Dana Whitfield");
    assert.ok(claim, r.rows.map((x) => x.label).join("\n"));
    assert.match(claim!.value, /direct surviving lines 80 \(80\.0% of 100/, "the reformat did not take her lines; three addresses joined");
    assert.match(claim!.value, /Co-authored-by 20 in 1 commit, upper bound with that credit 100/);
    const printed = JSON.stringify(r);
    assert.doesNotMatch(printed, /[\w.+-]+@[\w-]+\.[\w.]+/, "no address is printed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("owner: a claim that matches no person says so in the people rows", async () => {
  const dir = await cacheRepo();
  try {
    const r = await computeOwner({ path: "src/cache", repo: dir, claim: "Nobody Atall", json: false });
    assert.match(row(r, "claim person: Nobody Atall")!.value, /no person in this history/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
