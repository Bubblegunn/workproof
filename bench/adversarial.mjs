/**
 * "These numbers are gameable." Yes, partly, and this runs the gaming so the
 * reader can see which figures move and which do not.
 *
 * Four strategies are applied to copies of the same fixture repository, each as
 * commits by the subject, and every figure is recomputed with identical
 * parameters. Run: npm run bench:adversarial
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, writeFileSync, appendFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeRepo } from "../dist/test/fixture.js";
import { analyseRepo } from "../dist/src/analyse.js";

const ADA = { name: "Ada", email: "ada@example.com" };
const PARAMS = { author: ["ada@example.com"], sample: 1, depth: 2, exclusions: true, exclude: [], seed: "", copies: false };

const git = (dir, args, date = "2026-03-01T10:00:00Z", who = ADA) =>
  execFileSync("git", args, {
    cwd: dir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email,
      GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email,
      GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date,
    },
  });

const copy = (from) => {
  const to = mkdtempSync(join(tmpdir(), "workproof-adv-"));
  cpSync(from, to, { recursive: true });
  return to;
};

/**
 * Every gaming commit is dated inside the subject's existing tenure (5 to 19
 * January 2026). Adding commits outside it would stretch the window and pull
 * other people's work into the denominator, which moves figures for a reason
 * that has nothing to do with the strategy being measured.
 */
const day = (n) => `2026-01-${String(Math.min(18, Math.max(6, n))).padStart(2, "0")}T10:00:00Z`;

/** 60 commits that each touch one line of a scratch file: the cheapest way to look busy. */
function commitPadding(dir) {
  for (let i = 0; i < 60; i++) {
    writeFileSync(join(dir, "src/notes.ts"), `// note ${i}\n`);
    git(dir, ["add", "."], day(6 + (i % 12)));
    git(dir, ["commit", "-q", "-m", `chore: note ${i}`], day(6 + (i % 12)));
  }
}

/** Re-indent every source line without changing a token. */
function whitespaceChurn(dir) {
  for (const file of ["src/a.ts", "src/renamed.ts"]) {
    const text = readFileSync(join(dir, file), "utf8");
    writeFileSync(join(dir, file), text.split("\n").map((l) => (l ? `    ${l}   ` : l)).join("\n"));
  }
  git(dir, ["add", "."], day(18));
  git(dir, ["commit", "-q", "-m", "style: reindent"], day(18));
}

/**
 * 2,000 lines of machine output under a name the built-in lists do not match.
 * `schema.generated.ts` would be caught by the list; `schema_table.ts` is not,
 * which is the honest case: the defence is a convention, not a detector.
 */
function generatedFiles(dir, marked) {
  const body = Array.from({ length: 2000 }, (_, i) => `export const value${i} = ${i};`).join("\n") + "\n";
  writeFileSync(join(dir, "src/schema_table.ts"), body);
  if (marked) appendFileSync(join(dir, ".gitattributes"), "src/schema_table.ts linguist-generated\n");
  git(dir, ["add", "-A"], day(17));
  git(dir, ["commit", "-q", "-m", "feat: schema table"], day(17));
}

/**
 * Bob writes the code. With `trailer`, every commit also names the subject as a
 * co-author. The column that matters is this one against its own control, since
 * Bob's real work moves the shares either way.
 */
const bobCommits = (trailer) => (dir) => {
  const BOB = { name: "Bob", email: "bob@example.com" };
  for (let i = 0; i < 8; i++) {
    writeFileSync(join(dir, `src/feature${i}.ts`), Array.from({ length: 25 }, (_, j) => `bob ${i} ${j}`).join("\n") + "\n");
    git(dir, ["add", "."], day(8 + i), BOB);
    const message = trailer ? `feat: feature ${i}\n\nCo-authored-by: Ada <ada@example.com>` : `feat: feature ${i}`;
    git(dir, ["commit", "-q", "-m", message], day(8 + i), BOB);
  }
};

const STRATEGIES = [
  ["commit padding", commitPadding, "60 one-line commits by the subject"],
  ["whitespace churn", whitespaceChurn, "every source line re-indented, no token changed"],
  ["generated file", (d) => generatedFiles(d, false), "2,000 machine-written lines the lists do not match"],
  ["generated, marked", (d) => generatedFiles(d, true), "the same file, marked linguist-generated"],
  ["Bob works alone", bobCommits(false), "8 commits by Bob, no trailer (the control)"],
  ["Bob credits Ada", bobCommits(true), "the same 8 commits naming the subject as co-author"],
];

const read = (figures, id) => figures.find((f) => f.id === id)?.value;
const dirs = [];

try {
  const base = await makeRepo();
  dirs.push(base);
  const baseline = await analyseRepo(base, PARAMS);

  const rows = [];
  for (const [name, apply, note] of STRATEGIES) {
    const dir = copy(base);
    dirs.push(dir);
    apply(dir);
    rows.push({ name, note, result: await analyseRepo(dir, PARAMS) });
  }

  const METRICS = [
    ["commit share", (r) => read(r.figures, "commitShare").share, (v) => `${(v * 100).toFixed(1)}%`],
    ["commits/week", (r) => read(r.figures, "cadence").commitsPerActiveWeek, (v) => v.toFixed(1)],
    ["median commit", (r) => read(r.figures, "commitSize").median, (v) => `${v} lines`],
    ["files authored", (r) => read(r.figures, "filesAuthored").share, (v) => `${(v * 100).toFixed(1)}%`],
    ["surviving lines", (r) => read(r.figures, "survivingLines").share, (v) => `${(v * 100).toFixed(1)}%`],
    ["surviving count", (r) => read(r.figures, "survivingLines").lines, (v) => `${v}`],
    ["co-authored", (r) => read(r.figures, "coAuthored").trailerCommits, (v) => `${v}`],
    ["excluded files", (r) => r.excluded.files, (v) => `${v}`],
  ];

  const pad = (s, n) => String(s).padEnd(n);
  const W = 18;
  console.log("Every strategy is applied to a copy of the same fixture and measured with identical parameters.\n");
  console.log(pad("figure", 16) + pad("baseline", 11) + STRATEGIES.map(([n]) => pad(n, W)).join(""));
  console.log("-".repeat(16 + 11 + W * STRATEGIES.length));
  for (const [label, get, fmt] of METRICS) {
    const b = get(baseline);
    const cells = rows.map((row) => {
      const v = get(row.result);
      const moved = JSON.stringify(v) !== JSON.stringify(b);
      return pad(`${fmt(v)}${moved ? "  moved" : ""}`, W);
    });
    console.log(pad(label, 16) + pad(fmt(b), 11) + cells.join(""));
  }

  console.log("\nwhat each strategy is:");
  for (const [name, , note] of STRATEGIES) console.log(`  ${pad(name, 20)}${note}`);

  console.log(`
Read the rows, not the totals.

Commit padding is loud and cheap: sixty commits take the cadence from 1.0 to 21.0
commits a week and buy exactly one surviving line, 16 to 17. The median commit
falls from 4 lines to 2, which is the tell a reader can see in the same report.

Whitespace churn moves nothing that counts code. Every source line was re-indented
and the surviving count stayed at 16, because blame runs with -w.

The generated file is the real hole. Two thousand machine-written lines under a
name the built-in lists do not match take surviving lines from 51.6% to 99.3%.
The same file marked linguist-generated in .gitattributes drops out of every
count and appears in the excluded column instead. The defence is a repository
convention, not a detector, and a report from a repository that keeps no such
convention deserves less trust for exactly this reason.

The co-author trailer buys nothing. Bob's eight commits move the subject's shares
down either way, because Bob really wrote that code; naming the subject as
co-author changes one number, the co-authored count, and no other row differs
between those two columns. Blame follows whoever wrote the line.`);
} finally {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
}
