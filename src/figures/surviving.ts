import type { Figure, Identity } from "./types.js";
// surviving-lines ships plain ESM JavaScript without type declarations.
// @ts-ignore
import { analyse, parseArgs } from "surviving-lines/bin/surviving-lines.js";

interface AuthorRow { mail: string; lines: number }

export async function survivingLines(cwd: string, id: Identity, opts: { sample: number; version: string; exclude?: string[] }) {
  const result = await analyse(parseArgs(["--cwd", cwd, "--sample", String(opts.sample), ...(opts.exclude ?? []).flatMap((g) => ["--exclude", g])]));
  const mine = (result.authors as AuthorRow[]).filter((a) => id.emails.includes(a.mail));
  const lines = mine.reduce((s, a) => s + a.lines, 0);
  const value = {
    lines,
    linesAttributed: result.sample.linesAttributed as number,
    share: result.sample.linesAttributed ? lines / result.sample.linesAttributed : 0,
    filesSampled: result.sample.filesSampled as number,
    filesTotal: result.sample.filesTotal as number,
    sample: opts.sample,
  };
  const figure: Figure<typeof value> = {
    id: "survivingLines",
    title: "Surviving lines at HEAD",
    value,
    command: `surviving-lines ${opts.version}: git blame -w -M --line-porcelain over a deterministic 1-in-${opts.sample} file sample (FNV-1a on path)`,
    limits: [
      "Survivorship, not merit: code deleted on purpose counts for nobody.",
      "Whitespace and moved lines keep their original author; copied lines do not unless --copies is used upstream.",
    ],
  };
  return figure;
}
