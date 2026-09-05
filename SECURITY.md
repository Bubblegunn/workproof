# Security

Report a vulnerability privately through GitHub's security advisories:
https://github.com/Bubblegunn/workproof/security/advisories/new

Do not open a public issue for a security problem. You will get a first response within
72 hours, and a fix or a written assessment within 14 days of confirmation.

## Supported versions

Only the latest minor release receives security fixes. Upgrade before reporting if you are
behind; if the problem reproduces on the latest release, report it.

## Scope

The CLI reads git history and writes a report. In scope: anything that leaks code content, file paths or emails into a report without the corresponding flag, or that lets a report verify when the figures do not reproduce.
