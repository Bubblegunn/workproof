import type { Report } from "./report.js";

/**
 * Ask a model for one sober paragraph built only from the figures. Nothing
 * but figure ids, titles and values leaves the machine: no paths, no code.
 */
export async function narrate(report: Report, env: { url: string; key: string; model: string }, fetchImpl: typeof fetch = fetch): Promise<string> {
  const figures = report.repositories.map((r) => ({ repository: r.name, figures: r.figures.map((f) => ({ id: f.id, title: f.title, value: f.value })) }));
  const prompt = `You are writing a short, sober paragraph for an engineering résumé. Use only the numbers below; add nothing, round nothing up, and treat "commit share" and "surviving lines" as separate things. No adjectives like "impressive". Figures:\n${JSON.stringify(figures)}`;
  const anthropic = /anthropic\.com/.test(env.url);
  const body = anthropic
    ? { model: env.model, max_tokens: 400, messages: [{ role: "user", content: prompt }] }
    : { model: env.model, messages: [{ role: "user", content: prompt }], temperature: 0.2 };
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (anthropic) {
    headers["x-api-key"] = env.key;
    headers["anthropic-version"] = "2023-06-01";
  } else headers.authorization = `Bearer ${env.key}`;
  const res = await fetchImpl(env.url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`narrative request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { content?: { text?: string }[]; choices?: { message?: { content?: string } }[] };
  const text = anthropic ? data.content?.[0]?.text : data.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("narrative response had no text");
  return text;
}
