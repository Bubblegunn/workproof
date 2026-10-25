import { test } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { computeFigures } from "../src/figures.js";
import type { FiguresResult } from "../src/figures.js";
import { buildHistory, lines, head } from "./history.js";

const value = (r: FiguresResult, label: string): number | string => {
  const row = r.rows.find((x) => x.label === label);
  assert.ok(row, `no row ${label}`);
  return row.value;
};
const detail = (r: FiguresResult, label: string): string[] => r.rows.find((x) => x.label === label)?.detail ?? [];

const PAT = { name: "Pat Moss", email: "pat@acme-labs.dev" };
const NOW = new Date("2026-10-24T12:00:00Z");

test("a future author date with an in-window committer date is counted by the committer date, flagged, and listed", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-02-10T10:00:00Z", message: "ordinary", files: { "a.txt": lines(3) } },
    // clock error: authored in 2027, landed in the window
    { ...PAT, date: "2027-02-03T10:00:00Z", committerDate: "2026-03-05T09:00:00Z", message: "clock error", files: { "b.txt": lines(4) } },
  ]);
  try {
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(r, "authored non-merge commits"), 2, "the headline places the clock-error commit by its committer date");
    assert.equal(value(r, "authored non-merge commits, author date as written"), 1, "the strict reading is printed beside it");
    assert.equal(value(r, "commits with an impossible author date"), 1);
    const [line] = detail(r, "commits with an impossible author date");
    assert.match(line!, /author 2027-02-03 \(in the future\), committer 2026-03-05, placed 2026-03-05/);
    assert.equal(value(r, "last authored commit date"), "2026-03-05", "dated figures use the placed date");
    assert.equal(value(r, "author date in the future"), 1, "the older flag row still reports it");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an epoch author date is placed by its committer date; when the committer date is impossible too the commit is listed and left out", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "1970-01-01T00:00:00Z", committerDate: "2026-04-04T08:00:00Z", message: "zero clock", files: { "a.txt": lines(2) } },
    { ...PAT, date: "1970-01-02T00:00:00Z", committerDate: "1970-01-02T00:00:00Z", message: "zero clock twice", files: { "b.txt": lines(2) } },
  ]);
  try {
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(r, "authored non-merge commits"), 1);
    assert.equal(value(r, "commits with an impossible author date"), 2);
    const rows = detail(r, "commits with an impossible author date");
    assert.ok(rows.some((l) => /before 1990.*placed 2026-04-04/.test(l)), rows.join("\n"));
    assert.ok(rows.some((l) => /left out/.test(l)), rows.join("\n"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an author date later than the committer date by more than a day is impossible (two days here); a few hours is not", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-05-10T10:00:00Z", committerDate: "2026-05-08T10:00:00Z", message: "next day author", files: { "a.txt": lines(1) } },
    { ...PAT, date: "2026-05-10T10:00:00Z", committerDate: "2026-05-10T06:00:00Z", message: "skew", files: { "b.txt": lines(1) } },
  ]);
  try {
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-05-01", until: "2026-05-31", json: false }, NOW);
    assert.equal(value(r, "commits with an impossible author date"), 1);
    assert.match(detail(r, "commits with an impossible author date")[0]!, /later than its committer date/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a reverted-by-others commit is reported with who reverted it, and its lines leave the lasting figure", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-02-01T10:00:00Z", message: "kept work", files: { "keep.txt": lines(10) } },
    { ...PAT, date: "2026-02-05T10:00:00Z", message: "helper", files: { "helper.txt": lines(7) } },
  ]);
  try {
    const helper = head(dir);
    // A maintainer reverts it, with git's own message.
    const { execFileSync } = await import("node:child_process");
    const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_AUTHOR_NAME: "Maya Cole", GIT_AUTHOR_EMAIL: "maya@acme-labs.dev", GIT_COMMITTER_NAME: "Maya Cole", GIT_COMMITTER_EMAIL: "maya@acme-labs.dev", GIT_AUTHOR_DATE: "2026-02-20T10:00:00Z", GIT_COMMITTER_DATE: "2026-02-20T10:00:00Z" };
    execFileSync("git", ["-C", dir, "rm", "-q", "helper.txt"], { env });
    execFileSync("git", ["-C", dir, "commit", "-q", "-m", `Revert "helper"\n\nThis reverts commit ${helper}.`], { env });
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(r, "revert commits"), 0, "Pat authored no revert: the older row says 0");
    assert.equal(value(r, "commits by the identities that anyone reverted"), 1, "the new row sees the revert Maya made");
    assert.match(detail(r, "commits by the identities that anyone reverted")[0]!, /"helper" reverted by [0-9a-f]{7} \(Maya Cole, 2026-02-20; This reverts commit\)/);
    assert.equal(value(r, "lines written, net of exclusions"), 17, "written, reverts kept");
    assert.equal(value(r, "lines written, reverts removed"), 10, "lasting: the 7 backed-out lines leave");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a revert recognised only by its Revert \"subject\" is found and labelled as such", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-02-01T10:00:00Z", message: "add parser", files: { "p.txt": lines(5) } },
    { name: "Maya Cole", email: "maya@acme-labs.dev", date: "2026-02-09T10:00:00Z", message: 'Revert "add parser"', files: { "p.txt": "" } },
  ]);
  try {
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(r, "commits by the identities that anyone reverted"), 1);
    assert.match(detail(r, "commits by the identities that anyone reverted")[0]!, /subject Revert/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("UTC windows: the same instant is in or out of a quarter by UTC, whatever offset it was written in", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-06-30T23:30:00-05:00", message: "late june west", files: { "a.txt": lines(1) } }, // 2026-07-01T04:30Z
    { ...PAT, date: "2026-07-01T00:30:00+02:00", message: "early july east", files: { "b.txt": lines(1) } }, // 2026-06-30T22:30Z
  ]);
  try {
    const q3 = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-07-01", until: "2026-09-30", json: false }, NOW);
    const q2 = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-04-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(q3, "authored non-merge commits"), 1, "only the west-coast commit is in Q3 by UTC");
    assert.equal(value(q2, "authored non-merge commits"), 1, "only the east commit is in Q2 by UTC");
    const local = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-07-01", until: "2026-09-30", json: false, tz: "commit" }, NOW);
    assert.equal(value(local, "authored non-merge commits"), 1, "the older reading: the east commit's own date is 07-01, the west one's is 06-30");
    assert.match(q3.window, /read in UTC/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("--tz moves the quarter edge to the named zone's midnight", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-06-30T21:30:00Z", message: "evening utc", files: { "a.txt": lines(1) } }, // 2026-07-01 00:30 in Istanbul
  ]);
  try {
    const utc = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-07-01", until: "2026-09-30", json: false }, NOW);
    const ist = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-07-01", until: "2026-09-30", json: false, tz: "Europe/Istanbul" }, NOW);
    assert.equal(value(utc, "authored non-merge commits"), 0);
    assert.equal(value(ist, "authored non-merge commits"), 1);
    assert.match(ist.window, /read in Europe\/Istanbul/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a bad --tz is a not-computed window row, never a zero count", async () => {
  const dir = await buildHistory([{ ...PAT, date: "2026-05-01T10:00:00Z", message: "x", files: { "a.txt": lines(1) } }]);
  try {
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-12-31", json: false, tz: "Mars/Olympus" }, NOW);
    const row = r.rows.find((x) => x.label === "window");
    assert.match(String(row?.value), /not computed.*time zone/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("the end of a date-only window is exclusive at the next midnight: an instant exactly at midnight belongs to the next window", async () => {
  const dir = await buildHistory([
    { ...PAT, date: "2026-07-01T00:00:00Z", message: "midnight", files: { "a.txt": lines(1) } },
    { ...PAT, date: "2026-06-30T23:59:59Z", message: "last second", files: { "b.txt": lines(1) } },
  ]);
  try {
    const q2 = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-04-01", until: "2026-06-30", json: false }, NOW);
    const q3 = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-07-01", until: "2026-09-30", json: false }, NOW);
    assert.equal(value(q2, "authored non-merge commits"), 1, "the last second of June, not the midnight");
    assert.equal(value(q3, "authored non-merge commits"), 1, "the midnight, not the last second");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("two commits with the same subject: a Revert of that subject is not guessed onto either; a revert that was reverted again no longer counts", async () => {
  const { execFileSync } = await import("node:child_process");
  const dir = await buildHistory([
    { ...PAT, date: "2026-02-01T10:00:00Z", message: "fix typo", files: { "a.txt": lines(3) } },
    { name: "Bob Ray", email: "bob@acme-labs.dev", date: "2026-02-02T10:00:00Z", message: "fix typo", files: { "b.txt": lines(3) } },
    { name: "Bob Ray", email: "bob@acme-labs.dev", date: "2026-02-03T10:00:00Z", message: 'Revert "fix typo"', files: { "b.txt": "" } },
    { ...PAT, date: "2026-02-05T10:00:00Z", message: "feature", files: { "f.txt": lines(5) } },
  ]);
  try {
    const r = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(r, "commits by the identities that anyone reverted"), 0, "two earlier commits share the subject: the tool does not guess");
    const bob = await computeFigures({ repo: dir, authors: ["bob@acme-labs.dev"], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(bob, "commits by the identities that anyone reverted"), 0, "nor onto the other author's commit");
    // Now a sha-based revert, itself reverted: the work is back.
    const feature = head(dir);
    const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_AUTHOR_NAME: "Maya Cole", GIT_AUTHOR_EMAIL: "maya@acme-labs.dev", GIT_COMMITTER_NAME: "Maya Cole", GIT_COMMITTER_EMAIL: "maya@acme-labs.dev", GIT_AUTHOR_DATE: "2026-02-20T10:00:00Z", GIT_COMMITTER_DATE: "2026-02-20T10:00:00Z" };
    execFileSync("git", ["-C", dir, "rm", "-q", "f.txt"], { env });
    execFileSync("git", ["-C", dir, "commit", "-q", "-m", `Revert "feature"\n\nThis reverts commit ${feature}.`], { env });
    const revert = head(dir);
    const after = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(after, "commits by the identities that anyone reverted"), 1);
    execFileSync("git", ["-C", dir, "checkout", "-q", feature, "--", "f.txt"], { env });
    execFileSync("git", ["-C", dir, "commit", "-q", "-m", `Reapply feature\n\nThis reverts commit ${revert}.`], { env: { ...env, GIT_AUTHOR_DATE: "2026-02-25T10:00:00Z", GIT_COMMITTER_DATE: "2026-02-25T10:00:00Z" } });
    const again = await computeFigures({ repo: dir, authors: [PAT.email], since: "2026-01-01", until: "2026-06-30", json: false }, NOW);
    assert.equal(value(again, "commits by the identities that anyone reverted"), 0, "the revert was reverted");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
