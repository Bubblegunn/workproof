import { SPLIT_CATEGORY } from "./figures/identity.js";

/** The fixed phrase for each mergeable rule. Any other reason string is printed as it is. */
const RULE_PHRASE = new Map<string, string>([
  [SPLIT_CATEGORY.sameName, "an address whose commits carry the same name"],
  [SPLIT_CATEGORY.login, "a GitHub noreply address whose login matches the name or the address in git config"],
  [SPLIT_CATEGORY.local, "an address whose name matches the GitHub login"],
]);

/** The sentence used when no other address was merged. */
export const NO_MERGE_SENTENCE = "No other address was merged by rule. The address from git config (or --author) is counted, together with any address whose commits carry the same name.";

/**
 * One sentence the user can paste, saying which rules merged other addresses into the identity.
 * It names the rule for each reason and no address, unless `addresses` is given (the caller passes
 * it only when the report shows addresses, that is with --emails).
 */
export function mergeBasisSentence(merged: { count: number; reasons: string[] }, opts: { addresses?: string[] } = {}): string {
  if (merged.count <= 0 || merged.reasons.length === 0) return NO_MERGE_SENTENCE;
  const rules = merged.reasons.map((r) => RULE_PHRASE.get(r) ?? r);
  const who = `${merged.count} other ${merged.count === 1 ? "address" : "addresses"}`;
  let sentence = `Counted as the same person: ${who}, because the rules matched: ${rules.join("; ")}. This is a rule, not proof: it can be wrong, and --no-merge-identities counts only the configured address and addresses with the same name.`;
  if (opts.addresses && opts.addresses.length) sentence += ` Addresses: ${opts.addresses.join(", ")}.`;
  return sentence;
}
