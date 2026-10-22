import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBullets, parseJd } from "../src/bullets.js";

const facts = [
  "## E01 Billing service",
  "Status: complete",
  "Stack: Python, PostgreSQL",
  "- F1: Built a billing service in Python that handles 12000 invoices a month.",
  "",
].join("\n");
const draft = (jd: string) => buildBullets({ jd, source: { kind: "facts", name: "bank.md", markdown: facts } as never });

test("a prose JD without bullets yields rows from the sentences and clauses that hold requirement wording", () => {
  const jd = "Acme is hiring a platform engineer. We value curiosity and good manners. You must have experience with Python, and knowledge of Kubernetes is a plus. Familiarity with PostgreSQL is expected.";
  const { rows } = parseJd(jd);
  const labels = rows.map((r) => r.label);
  assert.ok(labels.some((l) => /experience with Python/i.test(l)), labels.join("|"));
  assert.ok(labels.some((l) => /Kubernetes/.test(l)), labels.join("|"));
  assert.ok(labels.some((l) => /PostgreSQL/.test(l)), labels.join("|"));
  assert.ok(!labels.some((l) => /curiosity|good manners|hiring/.test(l)), "sentences without requirement wording are left out");
  assert.equal(rows.find((r) => /Kubernetes/.test(r.label))?.must, false, "a plus is nice-to-have");
});

test("bullet JDs keep their rows and the bullet path; the prose fallback is not used", () => {
  const { rows } = parseJd("Backend engineer\n\n## Required\n- Python\n- 3 years of experience with Go\n\n## About us\nWe must say that this plain line is ignored under other headings.\n");
  assert.deepEqual(rows.map((r) => r.label), ["Python", "3 years of experience with Go"]);
});

test("a hard-requirement line that no fact covers is listed in Gaps with the marker, and the run is not blocked", () => {
  const out = draft("Backend engineer\n\n## Required\n- Python\n- Valid work authorisation in the EU\n- Security clearance\n- Experience with Rust\n");
  assert.ok(out.gaps.includes("Valid work authorisation in the EU: not in your facts (hard requirement)"), out.gaps.join("|"));
  assert.ok(out.gaps.includes("Security clearance: not in your facts (hard requirement)"), out.gaps.join("|"));
  assert.ok(out.gaps.includes("Experience with Rust: not in your facts"), "an ordinary gap carries no marker");
  assert.ok(!out.gaps.some((g) => g.startsWith("Python")), "a covered requirement is not a gap");
  assert.match(out.markdown, /\(hard requirement\)/);
});

test("a hard requirement in a prose JD is flagged, and the draft is still produced", () => {
  const out = draft("We need a backend developer. Candidates must have the right to work in the UK, and experience with Python is required.");
  assert.ok(out.gaps.some((g) => /right to work/i.test(g) && g.endsWith("(hard requirement)")), out.gaps.join("|"));
  assert.ok(out.markdown.includes("## Gaps"));
});

test("payments with Visa and Kubernetes required are not flagged as hard requirements", () => {
  const out = draft("## Requirements\n- Built payments with Visa\n- Kubernetes required\n- Must have a degree in physics\n");
  assert.ok(!out.gaps.some((g) => /Visa|Kubernetes/.test(g) && g.endsWith("(hard requirement)")), out.gaps.join("|"));
  assert.ok(out.gaps.some((g) => /degree in physics/i.test(g) && g.endsWith("(hard requirement)")), out.gaps.join("|"));
});
