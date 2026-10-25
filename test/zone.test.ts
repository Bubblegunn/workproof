import { test } from "node:test";
import assert from "node:assert/strict";
import { parseZone, zoneLabel, dayIn, startOfDay, nextDay, zoneFromPrompt } from "../src/figures/zone.js";
import { placeCommit, authorDateIssue } from "../src/figures/dates.js";
import { windowFromPrompt } from "../src/answercheck.js";

const NOW = new Date("2026-10-24T12:00:00Z");

test("parseZone: UTC by default, offsets, IANA names, commit; garbage is an error", () => {
  assert.deepEqual(parseZone(undefined), { kind: "utc" });
  assert.deepEqual(parseZone("UTC"), { kind: "utc" });
  assert.deepEqual(parseZone("+00:00"), { kind: "utc" });
  assert.deepEqual(parseZone("+03:00"), { kind: "offset", minutes: 180 });
  assert.deepEqual(parseZone("-0530"), { kind: "offset", minutes: -330 });
  assert.deepEqual(parseZone("Europe/Istanbul"), { kind: "iana", name: "Europe/Istanbul" });
  assert.deepEqual(parseZone("commit"), { kind: "commit" });
  for (const bad of ["Mars/Olympus", "+25:00", "yesterday", "UTC+3:99", "../etc"]) assert.throws(() => parseZone(bad), /time zone/, bad);
  assert.equal(zoneLabel(parseZone("+03:00")), "UTC+03:00");
  assert.equal(zoneLabel(parseZone("-0530")), "UTC-05:30");
});

test("a date-only bound starts at the zone's midnight, across a daylight-saving change", () => {
  assert.equal(startOfDay("2026-07-01", parseZone("UTC")).toISOString(), "2026-07-01T00:00:00.000Z");
  assert.equal(startOfDay("2026-07-01", parseZone("+03:00")).toISOString(), "2026-06-30T21:00:00.000Z");
  assert.equal(startOfDay("2026-03-08", parseZone("America/New_York")).toISOString(), "2026-03-08T05:00:00.000Z", "EST the day the clocks go forward");
  assert.equal(startOfDay("2026-03-09", parseZone("America/New_York")).toISOString(), "2026-03-09T04:00:00.000Z", "EDT the next day");
  assert.equal(startOfDay("2026-10-25", parseZone("Europe/Berlin")).toISOString(), "2026-10-24T22:00:00.000Z", "CEST the day the clocks go back");
  // The midnight of the day after the clocks go back: the UTC midnight guess is already past the change, the local midnight is not.
  assert.equal(startOfDay("2026-04-05", parseZone("Pacific/Auckland")).toISOString(), "2026-04-04T11:00:00.000Z");
  // A zone whose midnight does not exist that day (Havana skips 00:00 to 01:00 on 2026-03-08): the day starts at 01:00 local.
  assert.equal(startOfDay("2026-03-08", parseZone("America/Havana")).toISOString(), "2026-03-08T05:00:00.000Z");
  assert.equal(nextDay("2026-12-31"), "2027-01-01");
});

test("dayIn reads an instant in the zone", () => {
  const at = new Date("2026-03-01T11:30:00Z");
  assert.equal(dayIn(at, parseZone("UTC")), "2026-03-01");
  assert.equal(dayIn(at, parseZone("+13:00")), "2026-03-02");
  assert.equal(dayIn(at, parseZone("Pacific/Auckland")), "2026-03-02");
  assert.equal(dayIn(at, parseZone("America/Los_Angeles")), "2026-03-01");
});

test("zoneFromPrompt: a named zone is used, no zone is UTC", () => {
  assert.equal(zoneLabel(zoneFromPrompt("report this in Europe/Istanbul time")), "Europe/Istanbul");
  assert.equal(zoneLabel(zoneFromPrompt("report the dates in GMT-5")), "UTC-05:00");
  assert.equal(zoneLabel(zoneFromPrompt("the build log says it ran at UTC-1 yesterday")), "UTC", "an offset with no reporting-zone wording sets nothing");
  assert.equal(zoneLabel(zoneFromPrompt("I report in America/Port-au-Prince time")), "America/Port-au-Prince", "a hyphen inside a zone name");
  assert.equal(zoneLabel(zoneFromPrompt("I report in UTC")), "UTC");
  assert.equal(zoneLabel(zoneFromPrompt("no zone named here")), "UTC");
  assert.equal(zoneLabel(zoneFromPrompt("Mars/Olympus time")), "UTC", "an unknown zone is ignored, not guessed");
});

test("authorDateIssue and placeCommit: impossible author dates are placed by the committer date, or left out when that is impossible too", () => {
  const d = (s: string) => new Date(s);
  assert.equal(authorDateIssue(d("2026-05-01T10:00:00Z"), d("2026-05-01T10:00:00Z"), NOW), undefined);
  assert.equal(authorDateIssue(d("1970-01-01T00:00:00Z"), d("2026-05-01T10:00:00Z"), NOW), "before 1990");
  assert.equal(authorDateIssue(d("2027-02-03T10:00:00Z"), d("2026-05-01T10:00:00Z"), NOW), "in the future");
  assert.equal(authorDateIssue(d("2026-06-01T10:00:00Z"), d("2026-05-01T10:00:00Z"), NOW), "later than its committer date");
  assert.equal(authorDateIssue(d("2026-05-01T10:00:00Z"), d("2026-05-01T09:00:00Z"), NOW), undefined, "a few hours of skew is not an error");
  assert.equal(authorDateIssue(new Date(NaN), d("2026-05-01T10:00:00Z"), NOW), "unparseable");
  const placed = placeCommit(d("2027-02-03T10:00:00Z"), d("2026-05-01T10:00:00Z"), NOW);
  assert.equal(placed.basis, "committer");
  assert.equal(placed.at?.toISOString(), "2026-05-01T10:00:00.000Z");
  const neither = placeCommit(d("1970-01-01T00:00:00Z"), d("2027-01-01T00:00:00Z"), NOW);
  assert.equal(neither.at, null);
  assert.equal(neither.basis, "none");
});

test("windowFromPrompt: two dates that share a year, with or without the first year, and abbreviated months", () => {
  assert.deepEqual(windowFromPrompt("who contributed between 1 January and 30 June 2026 (UTC)"), { since: "2026-01-01", until: "2026-06-30" });
  assert.deepEqual(windowFromPrompt("from Jan 1 to Jun 30, 2026"), { since: "2026-01-01", until: "2026-06-30" });
  assert.deepEqual(windowFromPrompt("1 Jan - 30 Jun 2026"), { since: "2026-01-01", until: "2026-06-30" });
  assert.deepEqual(windowFromPrompt("between 1 July 2025 and 30 June 2026"), { since: "2025-07-01", until: "2026-06-30" });
  assert.equal(windowFromPrompt("on 1 January and 30 June 2026 and 5 May 2026"), null, "three dates are not a window");
});
