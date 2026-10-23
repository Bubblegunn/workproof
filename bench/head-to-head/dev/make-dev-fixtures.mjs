#!/usr/bin/env node
// usage: node make-dev-fixtures.mjs <outdir>
// Builds the six development fixtures (HCV1..HCV6) as synthetic git repositories with fixed dates, plus
// <outdir>/truth.json with the counts the tasks' ground truth quotes. Nothing is fetched; every name and
// address is invented. The fixtures are written for the round 13 development gate (they are not the
// public set and not a held-out set) and assert their own counts at the end.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const out = process.argv[2];
if (!out) { console.error("usage: make-dev-fixtures.mjs <outdir>"); process.exit(2); }

const people = {
  mira: { name: "Mira Santos", email: "mira@northwind.example" },
  miraLaptop: { name: "Mira Santos", email: "msantos@laptop.example" },
  dev: { name: "Dev Okafor", email: "dev@northwind.example" },
  lee: { name: "Lee Contractor", email: "lee@freelance.example" },
  noor: { name: "Noor Haddad", email: "noor@northwind.example" },
};

function repo(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const run = (args, who, author, committer = author) =>
    execFileSync("git", args, {
      cwd: dir, encoding: "utf8",
      env: { ...process.env, GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email, GIT_AUTHOR_DATE: author, GIT_COMMITTER_DATE: committer },
    }).trim();
  const lines = (p, n) => Array.from({ length: n }, (_, i) => `${p} ${i + 1}`).join("\n") + "\n";
  return {
    dir, run, lines,
    init(who, when) { run(["init", "-q", "-b", "main"], who, when); },
    write(file, text) { const f = join(dir, file); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); },
    commit(who, file, text, msg, author, committer = author) {
      this.write(file, text);
      run(["add", "."], who, author);
      run(["commit", "-q", "-m", msg], who, author, committer);
      return run(["rev-parse", "HEAD"], who, author);
    },
    cfg(who) { run(["config", "user.name", who.name], who, "2026-01-01T00:00:00Z"); run(["config", "user.email", who.email], who, "2026-01-01T00:00:00Z"); },
    count(args) { return Number(run(["rev-list", "--count", ...args, "HEAD"], people.mira, "2026-01-01T00:00:00Z")); },
  };
}
const must = (cond, msg) => { if (!cond) { console.error("fixture self-check failed: " + msg); process.exit(1); } };
const truth = {};

// HCV1: promotion evidence. Configured identity mira@northwind; a second address with the same name; a vendored
// file; a whitespace-only reformat; a revert pair; a colleague.
{
  const r = repo(join(out, "HCV1"));
  const { mira, miraLaptop, dev } = people;
  r.init(mira, "2026-01-06T09:00:00Z");
  const base = r.lines("total", 30);
  r.commit(mira, "src/billing.js", base, "init billing service", "2026-01-06T09:00:00Z");
  r.commit(mira, "src/invoice.js", r.lines("invoice", 25), "add invoice totals", "2026-01-14T09:00:00Z");
  r.commit(miraLaptop, "src/tax.js", r.lines("tax", 18), "add tax rules", "2026-01-21T09:00:00Z");
  r.commit(mira, "lib/decimal.js", `/*! decimal.js v10 - Copyright (c) 2018 The Decimal Authors. MIT License. Source: https://github.com/example/decimal */\n${r.lines("d", 220)}`, "vendor decimal library", "2026-01-28T09:00:00Z");
  r.commit(mira, "src/billing.js", base.split("\n").map((l) => (l ? `    ${l}` : l)).join("\n"), "reformat billing with new style", "2026-02-04T09:00:00Z");
  r.commit(mira, "src/refund.js", r.lines("refund", 22), "add refunds", "2026-02-11T09:00:00Z");
  const exp = r.commit(mira, "src/export.js", r.lines("export", 40), "add export feature", "2026-02-18T09:00:00Z");
  r.run(["revert", "--no-edit", exp], mira, "2026-02-19T09:00:00Z");
  r.commit(miraLaptop, "src/audit.js", r.lines("audit", 16), "add audit log", "2026-03-02T09:00:00Z");
  r.commit(dev, "src/currency.js", r.lines("currency", 12), "add currency table", "2026-03-09T09:00:00Z");
  r.commit(mira, "README.md", r.lines("usage", 8), "docs: usage notes", "2026-03-16T09:00:00Z");
  r.cfg(mira);
  const w = ["--no-merges", "--since=2026-01-01", "--until=2026-03-31T23:59:59Z"];
  truth.HCV1 = { configured: r.count([...w, "--author=mira@northwind.example"]), bothAddresses: r.count([...w, "--author=mira@northwind.example", "--author=msantos@laptop.example"]), all: r.count(w) };
  must(truth.HCV1.configured === 8 && truth.HCV1.bothAddresses === 10 && truth.HCV1.all === 11, "HCV1 counts " + JSON.stringify(truth.HCV1));
}

// HCV2: committee statement. Window 2026-01-01..2026-06-30. One commit authored before the window and replayed into it,
// one merge, one commit dated in the future, a second address by trailer only.
{
  const r = repo(join(out, "HCV2"));
  const { noor, dev } = people;
  r.init(noor, "2026-01-08T09:00:00Z");
  r.commit(noor, "api/routes.py", r.lines("route", 40), "build routes", "2026-01-08T09:00:00Z");
  r.commit(noor, "api/auth.py", r.lines("auth", 33), "add token auth", "2026-02-10T09:00:00Z");
  r.commit(noor, "api/cache.py", r.lines("cache", 21), "carry over cache layer", "2025-11-20T09:00:00Z", "2026-03-03T09:00:00Z");
  r.run(["checkout", "-q", "-b", "feature/search"], noor, "2026-03-10T09:00:00Z");
  r.commit(noor, "api/search.py", r.lines("search", 28), "add search endpoint", "2026-03-11T09:00:00Z");
  r.run(["checkout", "-q", "main"], noor, "2026-03-12T09:00:00Z");
  r.run(["merge", "--no-ff", "-q", "feature/search", "-m", "merge search endpoint"], noor, "2026-03-13T09:00:00Z");
  r.commit(dev, "api/limits.py", r.lines("limit", 15), "add rate limits", "2026-04-02T09:00:00Z");
  r.commit(noor, "api/export.py", r.lines("export", 19), "add csv export", "2026-05-05T09:00:00Z");
  r.commit(noor, "api/audit.py", r.lines("audit", 14), "add audit trail", "2027-01-15T09:00:00Z", "2026-05-20T09:00:00Z");
  r.cfg(noor);
  const w = ["--no-merges", "--since=2026-01-01", "--until=2026-06-30T23:59:59Z", "--author=noor@northwind.example"];
  // git --since/--until read the committer date: 6 commits by noor, of which 4 have an author date inside the window and not in the future.
  truth.HCV2 = { byCommitterDateInWindow: r.count(w), byAuthorDateInWindowNotFuture: 4, authoredBeforeWindow: 1, futureDated: 1 };
  must(truth.HCV2.byCommitterDateInWindow === 6, "HCV2 count " + truth.HCV2.byCommitterDateInWindow);
}

// HCV3: a freelancer's claim checked before hiring. A copied file with a source header, a whitespace-only commit,
// a branch that was never merged.
{
  const r = repo(join(out, "HCV3"));
  const { lee, dev } = people;
  r.init(dev, "2026-01-05T09:00:00Z");
  r.commit(dev, "billing/core.js", r.lines("core", 60), "billing core", "2026-01-05T09:00:00Z");
  r.commit(lee, "billing/ledger.js", `// Source: https://github.com/example/ledger-js (Apache-2.0)\n${r.lines("ledger", 150)}`, "add ledger module", "2026-02-02T09:00:00Z");
  r.commit(lee, "billing/ledger.js", `// Source: https://github.com/example/ledger-js (Apache-2.0)\n${r.lines("ledger", 150)}`.split("\n").map((l) => (l ? `  ${l}` : l)).join("\n"), "tidy ledger", "2026-02-09T09:00:00Z");
  r.commit(lee, "billing/rates.js", r.lines("rates", 24), "add rate table", "2026-02-16T09:00:00Z");
  r.run(["checkout", "-q", "-b", "lee/reporting"], lee, "2026-02-20T09:00:00Z");
  r.commit(lee, "billing/report.js", r.lines("report", 45), "add reporting", "2026-02-23T09:00:00Z");
  r.run(["checkout", "-q", "main"], lee, "2026-02-24T09:00:00Z");
  r.cfg(dev);
  truth.HCV3 = { leeNonMerge: r.count(["--no-merges", "--author=lee@freelance.example", "--all"]), leeOnMain: r.count(["--no-merges", "--author=lee@freelance.example"]), totalOnMain: r.count([]) };
  must(truth.HCV3.leeNonMerge === 4 && truth.HCV3.leeOnMain === 3 && truth.HCV3.totalOnMain === 4, "HCV3 " + JSON.stringify(truth.HCV3));
}

// HCV4: exported sessions for a quarterly summary (no git repository needed). Folder ./sessions holds six files:
// session A in two files (a resumed session), B, C inside Q1 on the named work, D outside the quarter, E a personal project.
{
  const dir = join(out, "HCV4");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, "sessions"), { recursive: true });
  const row = (sid, ts, cwd, type, i, usage) => JSON.stringify(type === "user"
    ? { type, sessionId: sid, timestamp: ts, cwd, uuid: `${sid}-u${i}`, message: { role: "user", content: "work item" } }
    : { type, sessionId: sid, timestamp: ts, cwd, uuid: `${sid}-a${i}`, message: { id: `msg_${sid}_${i}`, model: "claude-sonnet-5-5", role: "assistant", content: [{ type: "tool_use", id: `tool_${sid}_${i}`, name: "Edit", input: {} }], usage } });
  const session = (sid, day, cwd, turns) => {
    const lines = [];
    for (let i = 1; i <= turns; i++) {
      lines.push(row(sid, `${day}T0${i}:00:00Z`, cwd, "user", i));
      lines.push(row(sid, `${day}T0${i}:05:00Z`, cwd, "assistant", i, { input_tokens: 1000 * i, output_tokens: 500 * i, cache_read_input_tokens: 2000, cache_creation_input_tokens: 100 }));
    }
    return lines;
  };
  const A = session("aaaa1111", "2026-01-12", "/work/billing-api", 4);
  writeFileSync(join(dir, "sessions", "a-part1.jsonl"), A.slice(0, 4).join("\n") + "\n");
  writeFileSync(join(dir, "sessions", "a-part2.jsonl"), A.join("\n") + "\n"); // resumed: repeats the first part
  writeFileSync(join(dir, "sessions", "b.jsonl"), session("bbbb2222", "2026-02-03", "/work/billing-api", 3).join("\n") + "\n");
  writeFileSync(join(dir, "sessions", "c.jsonl"), session("cccc3333", "2026-03-20", "/work/billing-api", 2).join("\n") + "\n");
  writeFileSync(join(dir, "sessions", "d.jsonl"), session("dddd4444", "2026-04-15", "/work/billing-api", 2).join("\n") + "\n");
  writeFileSync(join(dir, "sessions", "e.jsonl"), session("eeee5555", "2026-02-21", "/home/me/recipes-app", 2).join("\n") + "\n");
  truth.HCV4 = { exportedFiles: 6, uniqueSessions: 5, uniqueSessionsInQ1: 4, onNamedWorkInQ1: 3 };
}

// HCV5: an invoice checked against history. Three commits in March are claimed; two are on main, one sits on a branch that
// was never merged; a fourth commit by the same person is dated April (outside the invoice period).
{
  const r = repo(join(out, "HCV5"));
  const { lee, dev } = people;
  r.init(dev, "2026-03-02T09:00:00Z");
  r.commit(dev, "app/main.js", r.lines("main", 50), "app base", "2026-03-02T09:00:00Z");
  r.commit(lee, "app/orders.js", r.lines("orders", 35), "orders list", "2026-03-10T09:00:00Z");
  r.commit(lee, "app/orders-filter.js", r.lines("filter", 20), "orders filter", "2026-03-12T09:00:00Z");
  r.run(["checkout", "-q", "-b", "lee/export"], lee, "2026-03-13T09:00:00Z");
  r.commit(lee, "app/orders-export.js", r.lines("export", 30), "orders export", "2026-03-14T09:00:00Z");
  r.run(["checkout", "-q", "main"], lee, "2026-03-15T09:00:00Z");
  r.commit(lee, "app/orders-sort.js", r.lines("sort", 12), "orders sort", "2026-04-08T09:00:00Z");
  r.cfg(dev);
  truth.HCV5 = { leeNonMergeAll: r.count(["--no-merges", "--author=lee@freelance.example", "--all"]), leeMainInPeriod: r.count(["--no-merges", "--author=lee@freelance.example", "--since=2026-03-01", "--until=2026-03-31T23:59:59Z"]) };
  must(truth.HCV5.leeNonMergeAll === 4 && truth.HCV5.leeMainInPeriod === 2, "HCV5 " + JSON.stringify(truth.HCV5));
}

// HCV6: a plain git question that is not about anyone's work. A repository stuck in a merge conflict.
{
  const r = repo(join(out, "HCV6"));
  const { dev, mira } = people;
  r.init(dev, "2026-03-02T09:00:00Z");
  r.commit(dev, "package.json", '{\n  "name": "demo",\n  "version": "1.0.0"\n}\n', "start", "2026-03-02T09:00:00Z");
  r.run(["checkout", "-q", "-b", "other"], dev, "2026-03-03T09:00:00Z");
  r.commit(mira, "package.json", '{\n  "name": "demo",\n  "version": "1.1.0"\n}\n', "bump to 1.1.0", "2026-03-04T09:00:00Z");
  r.run(["checkout", "-q", "main"], dev, "2026-03-05T09:00:00Z");
  r.commit(dev, "package.json", '{\n  "name": "demo",\n  "version": "2.0.0"\n}\n', "bump to 2.0.0", "2026-03-06T09:00:00Z");
  try { r.run(["merge", "other"], dev, "2026-03-07T09:00:00Z"); } catch { /* the conflict is the point */ }
  r.cfg(dev);
  must(r.run(["status", "--porcelain"], dev, "2026-03-07T09:00:00Z").includes("UU package.json"), "HCV6 has no conflict");
  truth.HCV6 = { conflictedFile: "package.json" };
}

writeFileSync(join(out, "truth.json"), JSON.stringify(truth, null, 2) + "\n");
console.log("dev fixtures ready", JSON.stringify(truth));
