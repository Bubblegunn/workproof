#!/usr/bin/env bash
# Fixture for task 5. Deterministic: same pin + fixed identities/dates => same HEAD sha.
REPO_URL=https://github.com/rack/rack-attack.git; PIN=b771ea18afb9e6b625906a641d2d331e6d0c282b
set -euo pipefail
D=${1:?usage: build-fixture.sh <dest>}
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null TZ=UTC LC_ALL=C GIT_TERMINAL_PROMPT=0
case "$D" in /*) ;; *) D="$PWD/$D" ;; esac
rm -rf "$D"; mkdir -p "$D"
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
git init -q "$W/up"
git -C "$W/up" fetch -q --depth 1 "$REPO_URL" "$PIN"
test "$(git -C "$W/up" rev-parse FETCH_HEAD)" = "$PIN"
git -C "$W/up" archive FETCH_HEAD | tar -x -C "$D"
git init -q -b main "$D"
g() { git -C "$D" "$@"; }
# cm AUTHOR_NAME AUTHOR_EMAIL AUTHOR_DATE COMMITTER_NAME COMMITTER_EMAIL COMMITTER_DATE MESSAGE
cm() { GIT_AUTHOR_NAME="$1" GIT_AUTHOR_EMAIL="$2" GIT_AUTHOR_DATE="$3" GIT_COMMITTER_NAME="$4" GIT_COMMITTER_EMAIL="$5" GIT_COMMITTER_DATE="$6" git -C "$D" commit -q --allow-empty -m "$7"; }
# sc NAME EMAIL DATE MESSAGE : author and committer identical
sc() { cm "$1" "$2" "$3" "$1" "$2" "$3" "$4"; }
# ap FILE LINE : append a line to FILE and stage everything
ap() { mkdir -p "$(dirname "$D/$1")"; printf '%s\n' "$2" >> "$D/$1"; g add -Af; }
# mg BRANCH DATE MESSAGE : no-ff merge by the maintainer (M_NAME, M_EMAIL), then delete the branch
mg() { g checkout -q main
  GIT_AUTHOR_NAME="$M_NAME" GIT_AUTHOR_EMAIL="$M_EMAIL" GIT_AUTHOR_DATE="$2" GIT_COMMITTER_NAME="$M_NAME" GIT_COMMITTER_EMAIL="$M_EMAIL" GIT_COMMITTER_DATE="$2" git -C "$D" merge -q --no-ff -m "$3" "$1"
  g branch -q -d "$1"; }
M_NAME="Mateo Ruiz"; M_EMAIL="mateo@example.com"
MT="Mateo Ruiz"
R=README.md; L=lib/rack/attack.rb; C=CHANGELOG.md; X=docs/advanced_configuration.md
g add -Af
sc "$MT" mateo@example.com "2024-01-10T09:00:00+0000" "Import rack-attack snapshot"
ap $R "throttle example"
sc "Tariq Aziz" tariq@example.com "2024-03-04T10:00:00+0000" "Add throttle example"
ap $X "redis timeout docs"
sc "Jordan Lee" jordan@example.org "2025-02-11T10:00:00+0000" "Fix redis timeout docs"
ap $X "safelist docs"
sc "Sam Rivera" Sam.Rivera@Example.com "2025-03-03T10:00:00+0000" "Improve safelist docs"
ap $R "blocklist semantics"
sc "Tariq Aziz" tariq@example.com "2025-04-10T10:00:00+0000" "Clarify blocklist semantics"
ap .github/workflows/build.yml "# ruby 3.4"
sc "Kofi Mensah" kofi@example.net "2025-05-01T10:00:00+0000" "Add Ruby 3.4 to CI"
ap .github/workflows/build.yml "# ruby 3.5"
sc "Kofi Mensah" kofi@example.net "2025-06-02T10:00:00+0000" "Add Ruby head to CI"
ap $L "# yara: track ips"
sc "Yara Haddad" yara@example.org "2025-07-08T10:00:00+0000" "Track blocked IPs separately"
ap $L "# yara: fix"
sc "Yara Haddad" yara@example.org "2025-08-20T10:00:00+0000" "Fix IP tracker reset"
ap $R "examples"
sc "Jordan Lee" jordan@example.org "2025-09-09T10:00:00+0000" "Update examples"
ap $R "throttle keys doc"
sc "Tariq Aziz" tariq@example.com "2025-10-14T10:00:00+0000" "Document throttle keys"
ap .github/dependabot.yml "# weekly"
sc "dependabot[bot]" bot@example.invalid "2025-11-03T07:00:00+0000" "Bump actions/checkout from 4 to 5"
# 2025-12-31 20:30 at UTC-5 is 2026-01-01 01:30 UTC: inside the 2026 period
ap CONTRIBUTING.md "typo"
sc "Rahul Menon" rahul@example.org "2025-12-31T20:30:00-0500" "Fix typo in CONTRIBUTING"
ap $C "- 6.9.0 prep"
sc "$MT" mateo@example.com "2026-01-12T09:00:00+0000" "Prepare 6.9.0 changelog"
ap $L "# custom throttle keys"
sc "Tariq Aziz" tariq.aziz@example.net "2026-02-03T10:00:00+0000" $'Support custom throttle keys\n\nNew work address; my previous address was tariq@example.com.'
ap $R "Chinese intro"
cm "Wen Zhao" wen@example.net "2026-02-11T10:00:00+0800" "$MT" mateo@example.com "2026-02-12T09:00:00+0000" "Translate README intro to Chinese"
ap .github/dependabot.yml "# monthly"
sc "dependabot[bot]" bot@example.invalid "2026-02-20T07:00:00+0000" "Bump actions/setup-ruby"
g checkout -q -b yara-ttl
ap $L "# yara: ttl"
sc "Yara Haddad" yara@example.org "2026-03-04T10:00:00+0000" "Expire tracked IPs after a TTL"
mg yara-ttl "2026-03-05T09:00:00+0000" "Merge pull request #77 from yara/ttl"
ap $X "cache store typo"
sc "Jordan Okafor" jordan@example.org "2026-03-18T10:00:00+0000" "Fix cache store typo in docs"
ap $L "# drop ruby 3.1"
sc "$MT" mateo@example.com "2026-04-01T09:00:00+0000" "Drop Ruby 3.1"
ap $X "broken link"
sc "Wen Zhao" wen@example.net "2026-04-09T10:00:00+0800" "Fix broken link in docs"
ap $R "safelist wording"
sc "Sam Rivera" sam.rivera@example.com "2026-04-22T10:00:00+0000" "Reword safelist section"
ap $L "# redis pipeline"
sc "$MT" mateo@example.com "2026-05-02T09:00:00+0000" "Fix Redis pipeline error handling"
# author date is a clock error (2027); committed 2026-05-15 by the maintainer
ap $X "typo in examples"
cm "Pia Larsen" pia@example.org "2027-03-04T10:00:00+0000" "$MT" mateo@example.com "2026-05-15T09:00:00+0000" "Fix typo in examples"
ap .github/workflows/build.yml "# ruby 3.5 rc"
sc "github-actions[bot]" actions@example.invalid "2026-06-01T00:05:00+0000" "chore: sync CI matrix"
g checkout -q -b jordan-docs
ap $X "prefix docs"
sc "Jordan Okafor" jordan@example.org "2026-06-05T10:00:00+0000" "Document key prefixes"
mg jordan-docs "2026-06-06T09:00:00+0000" "Merge pull request #82 from jordan/docs"
ap $C "- 6.9.0 notes"
sc "$MT" mateo@example.com "2026-06-20T09:00:00+0000" "Update changelog"
ap gemfiles/rails_8_1.gemfile "# rails 8.1"
sc "$MT" mateo@example.com "2026-07-15T09:00:00+0000" "Refresh Rails 8.1 gemfile"
# 2026-10-01 00:30 at UTC+2 is 2026-09-30 22:30 UTC: inside the period
ap $R "Spanish intro"
sc "Ola Berg" ola@example.net "2026-10-01T00:30:00+0200" "Add Spanish translation of the README intro"
ap $L "# kofi again"
sc "Kofi Mensah" kofi@example.net "2026-10-12T10:00:00+0000" "Add Ruby 4.0 to CI"
ap $R "newcomer"
sc "Zed Hartmann" zed@example.org "2026-10-20T10:00:00+0000" "Fix typo in README"
