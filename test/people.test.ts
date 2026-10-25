import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { groupPeople, addressClass } from "../src/figures/people.js";
import type { PersonCommit } from "../src/figures/people.js";
import { computePeople, renderPeople, runPeople } from "../src/people.js";
import { computeFigures } from "../src/figures.js";
import { buildHistory, lines } from "./history.js";

const c = (name: string, email: string, body = "msg", committerEmail = email): PersonCommit => ({ sha: `${name}${email}${body}`.slice(0, 40), name, email, body, parents: 1, committerEmail });
const NOW = new Date("2026-10-24T12:00:00Z");

test("addressClass: organisational, personal mailbox, noreply, unknown", () => {
  assert.equal(addressClass("a@acme-labs.dev"), "organisational");
  assert.equal(addressClass("a@gmail.com"), "personal");
  assert.equal(addressClass("12345+a@users.noreply.github.com"), "noreply");
  assert.equal(addressClass("a@localhost"), "unknown");
});

test("a GitHub noreply login equal to another address's name part joins them as proven", () => {
  const g = groupPeople([c("Ana Souza", "asouza@acme-labs.dev"), c("asouza", "4411+asouza@users.noreply.github.com")]);
  assert.equal(g.people.length, 1);
  assert.deepEqual(g.merges.map((m) => [m.rule, m.strength]), [["GitHub noreply login matches the other address", "proven"]]);
});

test("a Signed-off-by of a known address on a commit the address both authored and committed joins them as proven", () => {
  const g = groupPeople([
    c("asouza", "9+asouza@users.noreply.github.com", "fix\n\nSigned-off-by: Ana Souza <ana@acme-labs.dev>"),
    c("Ana Souza", "ana@acme-labs.dev", "other"),
  ]);
  assert.equal(g.people.length, 1);
  assert.equal(g.merges[0]!.strength, "proven");
});

test("a maintainer's sign-off on someone else's patch joins nobody", () => {
  // Author Cy, committed by Mo, signed off by Mo: the sign-off is the committer's certification, not Cy saying Mo is Cy.
  const g = groupPeople([c("Cy Park", "cy@acme-labs.dev", "patch\n\nSigned-off-by: Mo Reyes <mo@acme-labs.dev>", "mo@acme-labs.dev"), c("Mo Reyes", "mo@acme-labs.dev", "own")]);
  assert.equal(g.people.length, 2);
  assert.equal(g.merges.length, 0);
});

test("the same full name at the same organisation, or beside a personal mailbox, joins as probable", () => {
  const sameOrg = groupPeople([c("Lee Wong", "lee@acme-labs.dev"), c("Lee Wong", "lee.wong@acme-labs.dev")]);
  assert.equal(sameOrg.people.length, 1);
  assert.deepEqual(sameOrg.merges.map((m) => [m.rule, m.strength]), [["same full name at the same organisation", "probable"]]);
  const personal = groupPeople([c("Lee Wong", "lee@acme-labs.dev"), c("Lee Wong", "leewong@gmail.com")]);
  assert.equal(personal.people.length, 1);
  assert.equal(personal.merges[0]!.rule, "same full name beside a personal mailbox");
});

test("the same full name at different organisations is joined as probable, with a namesake caution and the split figure", () => {
  const g = groupPeople([c("Nadia Petrova", "nadia@acme-labs.dev"), c("Nadia Petrova", "nadia.petrova@othercorp.example")]);
  assert.equal(g.people.length, 1);
  assert.deepEqual(g.merges.map((m) => [m.rule, m.strength]), [["same full name at a different organisation (a namesake is possible)", "probable"]]);
  assert.equal(g.namesakes.length, 1);
  assert.match(g.namesakes[0]!.reason, /different organisations.*proven-only figure is the split/);
});

test("a one-word name is not enough, and a bot is not a person", () => {
  const g = groupPeople([c("sam", "sam@acme-labs.dev"), c("sam", "sam@gmail.com"), c("dependabot[bot]", "49699333+dependabot[bot]@users.noreply.github.com"), c("renovate", "bot@renovateapp.com")]);
  assert.equal(g.people.length, 2);
  assert.equal(g.bots.length, 2);
});

const A = { name: "Ana Souza", email: "ana@acme-labs.dev" };
const A2 = { name: "asouza", email: "9+asouza@users.noreply.github.com" };
const B = { name: "Ben Okoro", email: "ben@beta-works.dev" };

async function team(): Promise<string> {
  return buildHistory([
    { ...A, date: "2026-01-05T10:00:00Z", message: "a1", files: { "a1.txt": lines(3) } },
    { ...A2, date: "2026-02-05T10:00:00Z", message: `a2\n\nSigned-off-by: ${A.name} <${A.email}>`, files: { "a2.txt": lines(2) } },
    { ...B, date: "2026-03-05T10:00:00Z", message: "b1\n\nCo-authored-by: Ana Souza <ana@acme-labs.dev>", files: { "b1.txt": lines(4) } },
    { ...B, date: "2026-03-06T10:00:00Z", message: "b merge-ish", files: { "b2.txt": lines(1) } },
    { ...B, date: "2025-12-31T23:30:00-05:00", message: "b edge west", files: { "b3.txt": lines(1) } }, // 2026-01-01T04:30Z: in
    { name: "dependabot[bot]", email: "49699333+dependabot[bot]@users.noreply.github.com", date: "2026-04-01T10:00:00Z", message: "bump", files: { "d.txt": lines(1) } },
    { ...A, date: "2026-07-02T10:00:00Z", message: "outside window", files: { "a3.txt": lines(1) } },
  ]);
}

test("people: commits per person in a UTC window, joined addresses, proven-only split, co-authorship, bots apart", async () => {
  const dir = await team();
  try {
    const r = await computePeople({ repo: dir, since: "2026-01-01", until: "2026-06-30", json: false, emails: false, max: 40 }, NOW);
    const ana = r.people.find((p) => p.name === "Ana Souza")!;
    const ben = r.people.find((p) => p.name === "Ben Okoro")!;
    assert.equal(ana.commits, 2, "both addresses, inside the window");
    assert.equal(ana.coAuthored, 1);
    assert.equal(ana.addresses.length, 2);
    assert.deepEqual(ana.mergedBy, ["Signed-off-by trailer on a commit of the other address (proven)"]);
    assert.equal(ben.commits, 3, "the west-coast New Year's Eve commit is 2026-01-01 in UTC");
    assert.equal(r.people.some((p) => p.name.includes("dependabot")), false);
    assert.deepEqual(r.bots, [{ name: "dependabot[bot]", commits: 1 }]);
    assert.deepEqual(r.inactive, [], "everyone in this team has a commit in the window");
    const later = await computePeople({ repo: dir, since: "2026-07-01", until: "2026-07-31", json: false, emails: false, max: 40 }, NOW);
    assert.deepEqual(later.people.map((p) => p.name), ["Ana Souza"]);
    assert.deepEqual(later.inactive, ["Ben Okoro"], "named apart as having no commit in July, not listed as a contributor");
    assert.match(renderPeople(later), /no commits in the window \| Ben Okoro \|/);
    assert.equal(ana.linesAdded, 5);
    const text = renderPeople(r);
    assert.match(text, /identity rule \| Signed-off-by trailer/);
    assert.match(text, /read in UTC/);
    assert.doesNotMatch(text, /@/, "no address is printed by default");
    assert.match(text, /addresses 2: organisational acme-labs\.dev; noreply/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("people --emails prints the addresses; --person narrows to one person; the command exits 0", async () => {
  const dir = await team();
  try {
    const chunks: string[] = [];
    assert.equal(await runPeople(["--repo", dir, "--since", "2026-01-01", "--until", "2026-06-30", "--emails", "--person", "ana souza"], { write: (s) => chunks.push(s) }), 0);
    const out = chunks.join("");
    assert.match(out, /ana@acme-labs\.dev/);
    assert.doesNotMatch(out, /Ben Okoro/);
    assert.equal(await runPeople(["--repo", dir, "--bogus"], { write: () => {} }), 1);
    assert.equal(await runPeople(["--repo", dir, "--tz", "Mars/Olympus"], { write: () => {} }), 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("people --brief reads the window and the zone from the prompt on stdin, caps the people, and prints no address", async () => {
  const dir = await team();
  try {
    const out = execFileSync("node", [join(import.meta.dirname, "..", "src", "cli.js"), "people", "--brief", "--window-from-stdin", "--repo", dir], {
      input: "Who contributed between 1 January and 30 June 2026? I report in UTC.",
      encoding: "utf8",
    });
    assert.match(out, /^People in 2026-01-01 to 2026-06-30, author date read in UTC/);
    assert.match(out, /Ana Souza: 2 commits/);
    assert.match(out, /Ben Okoro: 3 commits/);
    assert.match(out, /joined: Signed-off-by trailer/);
    assert.match(out, /bots \(not people\): dependabot\[bot\] 1/);
    assert.doesNotMatch(out, /@/);
    const r = await computePeople({ repo: dir, since: "2026-01-01", until: "2026-06-30", json: false, emails: false, max: 1 }, NOW);
    assert.equal(r.people.length, 1);
    assert.equal(r.hidden, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("figures --person joins the addresses the evidence ties, and says why", async () => {
  const dir = await team();
  try {
    const r = await computeFigures({ repo: dir, authors: [], person: "Ana Souza", since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(r.rows.find((x) => x.label === "authored non-merge commits")?.value, 2);
    const joined = r.rows.find((x) => x.label === "identity joined by evidence");
    assert.equal(joined?.value, "2 addresses");
    assert.match(joined!.filter, /Signed-off-by trailer.*proven/);
    const single = await computeFigures({ repo: dir, authors: [A.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(single.rows.find((x) => x.label === "authored non-merge commits")?.value, 1, "--author alone still means exactly that address");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a namesake at another organisation is joined in --person figures, flagged in people, and the proven-only count is the split", async () => {
  const dir = await buildHistory([
    { name: "Nadia Petrova", email: "nadia@acme-labs.dev", date: "2026-02-01T10:00:00Z", message: "mine", files: { "a.txt": lines(1) } },
    { name: "Nadia Petrova", email: "nadia.petrova@othercorp.example", date: "2026-02-02T10:00:00Z", message: "theirs", files: { "b.txt": lines(1) } },
  ]);
  try {
    const r = await computePeople({ repo: dir, since: "2026-01-01", until: "2026-12-31", json: false, emails: false, max: 40 }, NOW);
    const nadia = r.people.filter((p) => p.name === "Nadia Petrova");
    assert.equal(nadia.length, 1);
    assert.equal(nadia[0]!.commits, 2);
    assert.equal(nadia[0]!.commitsProvenOnly, 1, "the split reading is printed beside the merged one");
    assert.equal(r.namesakes.length, 1);
    assert.match(renderPeople(r), /caution, namesake possible \| nadia petrova \| the same full name at different organisations/);
    const f = await computeFigures({ repo: dir, authors: [], person: "Nadia Petrova", since: "2026-01-01", until: "2026-12-31", json: false }, NOW);
    assert.equal(f.rows.find((x) => x.label === "authored non-merge commits")?.value, 2);
    const one = await computeFigures({ repo: dir, authors: [], person: "nadia@acme-labs.dev", since: "2026-01-01", until: "2026-12-31", json: false }, NOW);
    assert.equal(one.rows.find((x) => x.label === "authored non-merge commits")?.value, 2, "a person is the joined addresses");
    const split = await computeFigures({ repo: dir, authors: ["nadia@acme-labs.dev"], since: "2026-01-01", until: "2026-12-31", json: false }, NOW);
    assert.equal(split.rows.find((x) => x.label === "authored non-merge commits")?.value, 1, "--author keeps exactly one address");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a squash commit that lists several signers joins nobody; a lone signer on a self-committed commit still does", () => {
  const squash = groupPeople([
    c("Alice Wu", "alice@acme-labs.dev", "squash of three PRs\n\nSigned-off-by: Bob Ray <bob@other-works.org>\nSigned-off-by: Cy Lin <cy@third-works.org>"),
    c("Bob Ray", "bob@other-works.org", "own"),
    c("Cy Lin", "cy@third-works.org", "own"),
  ]);
  assert.equal(squash.people.length, 3);
  assert.equal(squash.merges.length, 0);
  const lone = groupPeople([c("asouza", "9+asouza@users.noreply.github.com", "fix\n\nSigned-off-by: Ana Souza <ana@acme-labs.dev>"), c("Ana Souza", "ana@acme-labs.dev", "own")]);
  assert.equal(lone.people.length, 1);
});

test("figures --person with a name nobody has is a not-computed row, never the configured identity's figures", async () => {
  const dir = await team();
  try {
    execFileSync("git", ["config", "user.email", A.email], { cwd: dir });
    const r = await computeFigures({ repo: dir, authors: [], person: "Jon Smith", since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    const row = r.rows.find((x) => x.label === "authored non-merge commits")!;
    assert.equal(row.computed, false);
    assert.match(String(row.value), /no person in this history has the name or address "Jon Smith"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("people in a repository with no commit prints one not-computed line and exits 0; a bad zone is a usage error", async () => {
  const dir = await buildHistory([]);
  try {
    const chunks: string[] = [];
    assert.equal(await runPeople(["--repo", dir], { write: (s) => chunks.push(s) }), 0);
    assert.match(chunks.join(""), /people \| not computed \(/);
    assert.doesNotMatch(chunks.join(""), /usage:/);
    assert.equal(await runPeople(["--repo", dir, "--tz", "Mars/Olympus"], { write: () => {} }), 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("figures --person with a one-word name two people share asks for an address instead of choosing", async () => {
  const dir = await buildHistory([
    { name: "sam", email: "sam@acme-labs.dev", date: "2026-02-01T10:00:00Z", message: "a", files: { "a.txt": lines(1) } },
    { name: "sam", email: "sam@othercorp.example", date: "2026-02-02T10:00:00Z", message: "b", files: { "b.txt": lines(1) } },
  ]);
  try {
    const r = await computeFigures({ repo: dir, authors: [], person: "sam", json: false }, NOW);
    assert.match(String(r.rows.find((x) => x.label === "authored non-merge commits")!.value), /2 people in this history match "sam".*pass one address with --author/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
