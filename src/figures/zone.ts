/**
 * The time zone a window is read in. The default is UTC: a date-only bound is the whole UTC day, so the same
 * history gives the same count on every machine and for every author offset. Another zone is chosen by the
 * user's stated purpose (`--tz Europe/Istanbul`, `--tz +03:00`). `commit` is the older reading, kept so it can
 * be asked for by name: each commit's own calendar date in the offset it was written with.
 */
export type Zone =
  | { kind: "utc" }
  | { kind: "offset"; minutes: number }
  | { kind: "iana"; name: string }
  | { kind: "commit" };

export const UTC_ZONE: Zone = { kind: "utc" };

const pad = (n: number): string => String(Math.abs(n)).padStart(2, "0");

/** Parses a `--tz` value: UTC, Z, +HH:MM, -HHMM, an IANA name, or `commit`. Throws on anything else. */
export function parseZone(value: string | undefined): Zone {
  if (value === undefined || value === "") return UTC_ZONE;
  const v = value.trim();
  if (/^(?:utc|gmt|z)$/i.test(v)) return UTC_ZONE;
  if (/^commit$/i.test(v)) return { kind: "commit" };
  const m = /^(?:utc|gmt)?([+-])(\d{1,2})(?::?(\d{2}))?$/i.exec(v);
  if (m) {
    const h = Number(m[2]);
    const min = Number(m[3] ?? "0");
    if (h > 14 || min > 59) throw new Error(`the time zone "${v.slice(0, 40)}" is not a valid offset`);
    const minutes = (m[1] === "-" ? -1 : 1) * (h * 60 + min);
    return minutes === 0 ? UTC_ZONE : { kind: "offset", minutes };
  }
  if (/^[A-Za-z][A-Za-z0-9_+\-]*(?:\/[A-Za-z0-9_+\-]+){0,2}$/.test(v)) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: v });
      return { kind: "iana", name: v };
    } catch {
      // falls through to the error below
    }
  }
  throw new Error(`the time zone "${v.slice(0, 40)}" is not UTC, an offset such as +03:00, an IANA name such as Europe/Istanbul, or "commit"`);
}

/** The zone as it is printed beside a window. */
export function zoneLabel(z: Zone): string {
  switch (z.kind) {
    case "utc": return "UTC";
    case "offset": return `UTC${z.minutes < 0 ? "-" : "+"}${pad(Math.trunc(Math.abs(z.minutes) / 60))}:${pad(Math.abs(z.minutes) % 60)}`;
    case "iana": return z.name;
    case "commit": return "each commit's own offset";
  }
}

/** Offset of an IANA zone at an instant, in minutes east of UTC. */
function ianaOffset(name: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: name, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(at);
  const get = (t: string): number => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const local = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((local - Math.floor(at.getTime() / 1000) * 1000) / 60000);
}

/** Calendar day (YYYY-MM-DD) of an instant in the zone. `commit` has no single zone, so it reads UTC. */
export function dayIn(at: Date, z: Zone): string {
  if (Number.isNaN(at.getTime())) return "invalid date";
  if (z.kind === "offset") return new Date(at.getTime() + z.minutes * 60000).toISOString().slice(0, 10);
  if (z.kind === "iana") return new Date(at.getTime() + ianaOffset(z.name, at) * 60000).toISOString().slice(0, 10);
  return at.toISOString().slice(0, 10);
}

/** The instant at which a calendar day (YYYY-MM-DD) starts in the zone. */
export function startOfDay(day: string, z: Zone): Date {
  const guess = Date.parse(`${day}T00:00:00Z`);
  if (z.kind === "offset") return new Date(guess - z.minutes * 60000);
  if (z.kind === "iana") {
    const first = guess - ianaOffset(z.name, new Date(guess)) * 60000;
    let at = guess - ianaOffset(z.name, new Date(first)) * 60000;
    // A zone whose midnight does not exist that day (a daylight-saving change at 00:00): the day starts at the first instant that is on it.
    for (let step = 0; step < 4 && dayIn(new Date(at), z) < day; step++) at += 3600000;
    return new Date(at);
  }
  return new Date(guess);
}

/** The day after a YYYY-MM-DD day. */
export function nextDay(day: string): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
}

const IANA_IN_TEXT = /\b((?:Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific)\/[A-Z][A-Za-z_-]+(?:\/[A-Z][A-Za-z_-]+)?)(?![A-Za-z_-])/;
/** An offset counts only next to a word that says it is the reporting zone, so an unrelated "UTC-1" in pasted text sets nothing. */
const OFFSET_IN_TEXT = /(?:time ?zone|report(?:ing|s)? (?:in|at)|dates? (?:are |in )|local time|clock)[^.\n]{0,40}?\b(?:UTC|GMT)\s?([+-]\d{1,2}(?::?\d{2})?)\b/i;

/**
 * The zone a prompt states for its dates: an IANA name, "UTC+03:00" or "GMT-5". UTC when it names none, because UTC is also
 * the default of the tool: the hint and the tool then agree without anyone passing a flag. The prompt is data; a value that
 * does not parse as a zone is ignored.
 */
export function zoneFromPrompt(prompt: string): Zone {
  const text = prompt.normalize("NFKC");
  const iana = IANA_IN_TEXT.exec(text);
  if (iana) {
    try {
      return parseZone(iana[1]);
    } catch {
      // not a zone this runtime knows
    }
  }
  const off = OFFSET_IN_TEXT.exec(text);
  if (off) {
    try {
      return parseZone(`UTC${off[1]}`);
    } catch {
      // out of range
    }
  }
  return UTC_ZONE;
}
