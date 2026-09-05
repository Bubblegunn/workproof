/**
 * RFC 8785 (JSON Canonicalization Scheme) serialisation, without a dependency.
 *
 * Object keys are sorted by UTF-16 code units, numbers use the shortest round-trip
 * form JSON.stringify already produces, strings are escaped as JSON.stringify does,
 * and there is no whitespace. Properties whose value is undefined are skipped, as
 * JSON.stringify skips them. Non-finite numbers have no JSON form and throw.
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`cannot canonicalise a non-finite number (${value})`);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? "null" : canonicalize(v))).join(",")}]`;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record)
      .filter((k) => record[k] !== undefined)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(record[k])}`).join(",")}}`;
  }
  throw new Error(`cannot canonicalise a value of type ${typeof value}`);
}
