import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The composite action is YAML the test suite cannot execute; these checks pin the contract
// the README promises: every step is SHA-pinned, the Markdown report reaches the job summary,
// and the report files are uploaded as one artifact.
const action = readFileSync(new URL("../../action.yml", import.meta.url), "utf8").replace(/\r\n/g, "\n"); // Windows checkouts may carry CRLF

test("every action the composite uses is pinned to a full commit SHA", () => {
  const uses = [...action.matchAll(/^\s+uses:\s+(\S+)/gm)].map((m) => m[1] ?? "");
  assert.ok(uses.length >= 2, `expected at least two uses:, found ${uses.length}`);
  for (const u of uses) assert.match(u, /^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/, `${u} is not pinned to a 40-hex SHA`);
});

test("the Markdown report is appended to the job summary", () => {
  assert.match(action, /cat workproof-report\.md >> "\$GITHUB_STEP_SUMMARY"/);
});

test("the report files are uploaded as the workproof-report artifact", () => {
  const upload = action.match(/uses: actions\/upload-artifact@[0-9a-f]{40}[\s\S]*?if-no-files-found: error/);
  assert.ok(upload, "upload-artifact step with if-no-files-found: error");
  const uploadText = upload[0];
  assert.match(uploadText, /name: workproof-report\n/);
  for (const f of ["workproof-report.md", "workproof-report.json", "workproof-report.intoto.json", "workproof-report.predicate.json"]) {
    assert.ok(uploadText.includes(f), `${f} is uploaded`);
  }
});
