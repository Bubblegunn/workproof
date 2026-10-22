import { closeSync, fstatSync, openSync, readFileSync, readSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isAbsolute, resolve } from "node:path";

/** What the Stop hook receives on stdin. */
export interface StopInput {
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  stop_hook_active?: boolean;
}

/** One workproof command of the turn and the text its tool_result returned. */
export interface Run {
  command: string;
  output: string;
}

/** The part of a transcript that the checks read. */
export interface Turn {
  runs: Run[];
  finalText: string;
}

const MAX_TAIL = 5 * 1024 * 1024;
/** A command segment that invokes the CLI: `workproof <sub|flag>`, `npx workproof ...`, or `node <path>/cli.js <arg>`. */
const INVOKE = /^(?:(?:npx|pnpx|bunx)\s+(?:-\S+\s+)*workproof(?:@\S+)?|workproof|node\s+\S*cli\.js)(?:\s+(\S+))?/;
const SUBCOMMANDS_ON_REPO = new Set(["bullets", "verdict", "mine", "sessions", "report"]);
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;

export const PRIVACY_REASON =
  "The final answer shows an email address. Describe people and addresses by rule (for example 'two addresses were merged'), not by address, and send the answer again.";
export const GAPS_REASON =
  "The final answer does not state the Gaps. End with one sentence: 'Not in your facts: <items>. Add them to your bank if they are true.'";

/** The last `max` bytes of a file as text; a cut first line is dropped. */
export function readTail(path: string, max = MAX_TAIL): string {
  const fd = openSync(path, "r");
  try {
    const size = fstatSync(fd).size;
    const len = Math.min(size, max);
    const buf = Buffer.alloc(len);
    readSync(fd, buf, 0, len, size - len);
    const text = buf.toString("utf8");
    return size > len ? text.slice(text.indexOf("\n") + 1) : text;
  } finally {
    closeSync(fd);
  }
}

/** The first argument after the CLI name for each segment of the command that invokes the CLI. */
export function invocations(command: string): string[] {
  const out: string[] = [];
  for (const seg of command.split(/&&|\|\||[;|\n]/)) {
    const m = INVOKE.exec(seg.trim());
    if (m) out.push(m[1] ?? "");
  }
  return out;
}

/** True when the run reads the repository (bullets, verdict, mine, sessions, report, or a bare or flag-only report run). */
function readsRepo(command: string): boolean {
  return invocations(command).some((a) => a === "" || SUBCOMMANDS_ON_REPO.has(a) || (a.startsWith("-") && !/^(-h|--help|-v|--version)$/.test(a)));
}

function blocksOf(line: unknown): { type: string; [k: string]: unknown }[] {
  const content = (line as { message?: { content?: unknown } }).message?.content;
  if (typeof content === "string") return [{ type: "text", text: content }];
  return Array.isArray(content) ? (content as { type: string }[]).filter((b) => b && typeof b === "object") : [];
}

function resultText(block: Record<string, unknown>): string {
  const c = block.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((p) => (p && typeof (p as { text?: unknown }).text === "string" ? (p as { text: string }).text : "")).join("\n");
  return "";
}

/** The turn is every line after the last user line that holds real text (not only tool results). */
export function parseTurn(jsonl: string): Turn {
  const lines: { type?: string }[] = [];
  for (const raw of jsonl.split("\n")) {
    if (!raw.trim()) continue;
    try {
      lines.push(JSON.parse(raw) as { type?: string });
    } catch {
      // a partial first line of the tail or a damaged line is skipped
    }
  }
  let start = 0;
  lines.forEach((l, i) => {
    if (l.type !== "user") return;
    const blocks = blocksOf(l);
    if (blocks.some((b) => b.type === "text" && typeof b.text === "string" && b.text.trim())) start = i + 1;
  });
  const commands = new Map<string, string>();
  const runs: Run[] = [];
  let finalText = "";
  for (const l of lines.slice(start)) {
    if (l.type === "assistant") {
      const texts: string[] = [];
      for (const b of blocksOf(l)) {
        if (b.type === "tool_use" && typeof b.id === "string") {
          const cmd = (b.input as { command?: unknown } | undefined)?.command;
          if (b.name === "Bash" && typeof cmd === "string" && invocations(cmd).length > 0) commands.set(b.id, cmd);
        } else if (b.type === "text" && typeof b.text === "string") texts.push(b.text);
      }
      if (texts.length) finalText = texts.join("\n");
    } else if (l.type === "user") {
      for (const b of blocksOf(l)) {
        if (b.type !== "tool_result" || typeof b.tool_use_id !== "string") continue;
        const command = commands.get(b.tool_use_id);
        if (command !== undefined) runs.push({ command, output: resultText(b) });
      }
    }
  }
  return { runs, finalText };
}

/** Lowercase, NFKC-normalised text, so a fullwidth or compatibility form of an address still matches. */
function norm(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

/** Author and committer addresses of the repository (read-only git); empty when git fails. */
export function repoEmails(cwd: string): string[] {
  try {
    const out = execFileSync("git", ["-C", cwd, "log", "--format=%ae%n%ce", "--max-count=20000"], {
      encoding: "utf8",
      timeout: 700,
      stdio: ["ignore", "pipe", "ignore"],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    });
    return [...new Set(out.split("\n").map((s) => norm(s.trim())).filter(Boolean))];
  } catch {
    return [];
  }
}

/** True when the final message contains an address that workproof output printed, or a repository address when a run read the repository. noreply addresses never count. */
export function leaksEmail(finalText: string, runs: Run[], repo: string[]): boolean {
  const printed = runs.flatMap((r) => norm(r.output).match(EMAIL) ?? []);
  const known = runs.some((r) => readsRepo(r.command)) ? repo : [];
  const final = norm(finalText);
  return [...new Set([...known, ...printed])].some((e) => e.length > 0 && !e.includes("noreply") && final.includes(e));
}

/** The items under `## Gaps`, or null when there is no such section. */
export function gapItems(markdown: string): string[] | null {
  const lines = markdown.split(/\r?\n/);
  const at = lines.findIndex((l) => /^## Gaps\s*$/.test(l));
  if (at < 0) return null;
  const items: string[] = [];
  for (const l of lines.slice(at + 1)) {
    if (/^## /.test(l)) break;
    const m = /^\s*[-*]\s+(.*\S)\s*$/.exec(l);
    if (m) items.push(m[1]!);
  }
  return items;
}

/** Gaps of the last `workproof bullets` run: from its output, else from the file named by --out. */
function bulletsGaps(runs: Run[], cwd: string): string[] | null {
  for (const run of [...runs].reverse()) {
    if (!invocations(run.command).includes("bullets")) continue;
    let gaps = gapItems(run.output);
    if (gaps === null) {
      const out = /--out(?:=|\s+)(?:"([^"]+)"|'([^']+)'|(\S+))/.exec(run.command);
      const file = out?.[1] ?? out?.[2] ?? out?.[3];
      if (file) {
        try {
          gaps = gapItems(readFileSync(isAbsolute(file) ? file : resolve(cwd, file), "utf8"));
        } catch {
          gaps = null;
        }
      }
    }
    return gaps;
  }
  return null;
}

/** A gap item as the closing sentence would name it: text before a dash or parenthesis, no backticks. */
function gapName(item: string): string {
  return item.replace(/`/g, "").split(/\s+[-–—:(]/)[0]!.trim();
}

/** True when the message names a gap item or says that every requirement is covered. */
export function statesGaps(finalText: string, gaps: string[]): boolean {
  const final = norm(finalText);
  if (/every requirement is covered|all requirements are covered/.test(final)) return true;
  return gaps.some((g) => {
    const name = norm(gapName(g));
    if (name.length === 0) return false;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`).test(final);
  });
}

/** The reason to block, or null to allow. Pure apart from the optional file read of --out and the git read. */
export function evaluate(turn: Turn, cwd: string, repo: string[]): string | null {
  if (!turn.runs.length || !turn.finalText.trim()) return null;
  if (leaksEmail(turn.finalText, turn.runs, repo)) return PRIVACY_REASON;
  const gaps = bulletsGaps(turn.runs, cwd);
  if (gaps !== null && gaps.length > 0 && !statesGaps(turn.finalText, gaps)) return GAPS_REASON;
  return null;
}

/** The hook line for one stdin payload: empty string to allow, else one JSON line. Never throws. */
export function stopCheck(stdin: string): string {
  try {
    const input = JSON.parse(stdin) as StopInput;
    if (input.stop_hook_active === true || typeof input.transcript_path !== "string") return "";
    const cwd = typeof input.cwd === "string" && input.cwd ? input.cwd : process.cwd();
    const tail = readTail(input.transcript_path);
    if (!tail.includes("workproof") && !tail.includes("cli.js")) return "";
    const turn = parseTurn(tail);
    if (!turn.runs.length) return "";
    const reason = evaluate(turn, cwd, repoEmails(cwd));
    return reason === null ? "" : JSON.stringify({ decision: "block", reason });
  } catch {
    return "";
  }
}
