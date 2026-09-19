const BOT_EMAIL_PATTERNS = [
  /^(?:\d+)?[^@]+\[bot\]@users\.noreply\.github\.com$/i,
  /^bot@renovateapp\.com$/i,
  /^gitlab-bot@gitlab\.com$/i,
  /^teabot@gitea\.io$/i,
];

export function isBotIdentity(email: string): boolean {
  return BOT_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}