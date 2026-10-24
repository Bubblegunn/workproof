#!/bin/sh
# workproof UserPromptSubmit hint. Reads the hook input JSON on stdin and prints one JSON
# line only when the prompt matches a workproof task. No writes, no network, exit 0 always.
# The input is capped at 300000 bytes. Of the flattened, lowercased prompt (JSON line-break escapes turned
# into spaces) only the first 2000 and the last 2000 bytes are matched, because the request is often last.
input=$(head -c 300000)
flat=$(printf '%s' "$input" | tr '\n\r' '  ')
prompt=$(printf '%s' "$flat" | sed -E -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"((([^"\\]|\\.)*))".*/\1/p' | sed -E 's/\\[nrt]/ /g')
lcfull=$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]')
if [ "$(printf '%s' "$lcfull" | wc -c)" -gt 4000 ]; then
  lc="$(printf '%s' "$lcfull" | head -c 2000) $(printf '%s' "$lcfull" | tail -c 2000)"
else
  lc=$lcfull
fi

# Second route for email-address phrasings: all four parts must match the same prompt.
has() { printf '%s\n' "$lc" | grep -Eq -e "$1"; }

# Email-address phrasings set addr=1. For those, addr_extra computes the several-addresses figures from
# read-only git (see below), so the answer does not depend on the model counting by hand.
addr=0
if [ -n "$lc" ] && has '(my|mine|i ).*(commits?|committed).*(email addresses|e-mail addresses|several emails|different emails|old (work )?email)'; then
  addr=1
fi
if [ "$addr" = 0 ] && [ -n "$lc" ] \
  && has '(^|[^a-z])(my|mine|me|i|i.ve|i.m)([^a-z]|$)' \
  && has 'commits?|committed|commit history|git[[:space:]]history|(my|mine) (own )?contributions?|lines of code|blame|(share|part|amount) of (the|my) (work|code)|in this (repo|repository|codebase)' \
  && has '((two|three|four|several|multiple|many|different|various|old|previous|former|another|other)( (work|personal|github|school|company|different|other|old|previous|noreply))* (e-?mails?|e-mail addresses|email addresses|addresses))|(e-?mail.{0,20}(several|multiple|many|two|three) times)|(git[[:space:]]thinks i am (two|three|several|multiple|more than one))' \
  && has 'how (many|much)|count|mine|my numbers|my work|my share|share of (the|my) (work|code)|total of my|combine'; then
  addr=1
fi

match=0
if [ -n "$lc" ] && printf '%s\n' "$lc" | grep -Eq \
  -e 'how (many|much).*(commits?|lines?|code|repo|codebase|repository).*(mine|my (own )?(work|code|contribution)|i (wrote|made|did|built))' \
  -e '(cv|résumé|resume) bullets?|bullets? (for|on) my (cv|résumé|resume)|my (cv|résumé|resume).*(what i (did|built|wrote)|this (repo|repository|codebase))' \
  -e 'tailor (my|the|this|a|these)? ?(resume|résumé|cv|bullets)' \
  -e '(self-review|self review).*(repo|repository|codebase|mine|my work|git|promotion)|(promotion|performance review).*(how much|mine|my work|i (wrote|did|built)|self-review|git)' \
  -e '(visa|immigration|global talent).*(proof|evidence).*(my|what i|i ).*(work|did|built|repo|contribut)|(proof|evidence) (of|for) (my|what i).*(work|did|built|repo|contribut)' \
  -e 'prove (what i|my work|that i)' \
  -e 'workproof' \
  -e '(sent|received|gave) (me|us).*(report|files|evidence).*(trust|verify|check|their work|his work|her work)|(trust|verify).*(this|the|these).*(report|figures|files).*(sent|candidate|applicant|evidence)' \
  -e '(candidate|applicant).*(evidence of (their|his|her) work)' \
  -e 'my claude code (usage|sessions?)|claude code usage.*(deliver|report|manager|impact)|what (all )?my claude.*deliver' \
  -e 'session (export|logs?)|(export|exported) .*(claude code|sessions?)|claude code sessions? (logs?|usage|export)|summari[sz]e my (claude )?usage|(totals|counts) by (type|model)|(tok.ns?|usage|responses?|totals?|counts?).*per[- ]model|per[- ]model (tok.ns?|counts?|totals?|usage)|assistant responses|(tools|tool calls).*claude (called|used)|co-?authored?.*claude|claude.*co-?authors?' \
  -e '(private|client|nda).*(repo|repository).*(cannot|can.t|not allowed|am not).*(show|share).*(proof|evidence|what i)' \
  -e '(sent|received|gave) (me|us).*(files|report|evidence).*evidence of (their|his|her) work|evidence of (their|his|her) work.*(trust|verify|check)' \
  -e '(my bullet points?|my bullets?).*(git|history|repo).*(performance review|promotion|review)'; then
  match=1
fi
if [ "$addr" = 1 ]; then match=1; fi

# Two-factor test, in addition to the patterns above (OR). History factor: a word about git history,
# a repository or exported sessions, or a working directory inside a git work tree. Intent factor: one
# or more intent classes. Generic verbs (check, verify, compare, summarise, report, audit, raise) are not
# intent words alone: they count only through a person or business word (contractor, invoice, candidate,
# quarter, promotion ...). A match whose history factor is only a repository word or the working directory
# gets the weak answer: the pointer to the rules, without the instruction to run the tool.
HIST_STRONG='(commit|repo|repository|git) history|git[[:space:]]log|(my|their|his|her) (own )?commits|history of (the|my|this|that) (repo|repository|project|commits)|(^|[^a-z])blame([^a-z]|$)|claude code|claude sessions?|session (exports?|folders?|logs?)|exported? (claude )?sessions?|transcripts?'
HIST_WEAK='(^|[^a-z])(commits?|committed|repos?|repository|repositories|clone|cloned|branch|branches|codebase|pull requests?|git)([^a-z]|$)'
I_WORK='contributions?|contributed|deliver|ship(ped|ping)?([^a-z]|$)|(^|[^a-z])(built|wrote|authored|implemented|finished|completed|produced)([^a-z]|$)|(^|[^a-z])(my|their|his|her|our|own) (work|part|role|features?)|work (i|they|he|she)|(i|we) (did|built|wrote|worked|led|owned|authored?|got done|finished)|what i (did|built|wrote|worked|made|delivered)|accomplish|achiev|(my|their) share|workload|responsib|get done|(who|how much of).*(wrote|write|built|did)|written by|done by|did the most|handover|hand-over|outsourc|predecessor|left behind|personally|(my|their|his|her) (own )?commits'
I_REPORT='write.?up|statement|quarter|(^|[^a-z])q[1-4]([^a-z]|$)|half[- ]?year|year[- ]end|review (doc|file|packet)|recap|retrospective|self[- ]assessment'
I_EVID='evidence|proof|(^|[^a-z])prove|attest|(my|the) case for|application|affidavit|testimony|lawyer|attorney|solicitor|immigration|visa|committee|promotion|performance review|portfolio (entry|piece|item|section)|appraisal|self[- ]?(review|assessment)|auditor|audit evidence|compliance (team|officer|audit|review)|second person.?s review|reviewed-by trailers?'
# Generic verbs and nouns: an intent word only together with a strong history word.
I_GENERIC='summar|(^|[^a-z])report|overview|(^|[^a-z])(verify|check|compare|confirm|audit|trust)([^a-z]|$)'
I_USAGE='usage|tok.ns?|per[- ]model|claude code|sessions?|prompts? (count|total)|co-?authored|ai[- ]assisted|assisted commits|copilot'
I_CHECK='claims?|claimed|(^|[^a-z])(bill|bills|supplier|vendor|agency|consultant|contractors?)([^a-z]|$)|(did|really|actually) .*(do|done|deliver|commit|merge)|holds? up|backs?( it| this| that| them)? up|backed up|invoice|billed|billing|(^|[^a-z])hours([^a-z]|$)|freelanc|candidate|applicant|legit|exaggerat|inflat|overstat|double[- ]check|sanity[- ]check|(match(es)?|consistent with) (the |their |his |her )?(history|commits|claim)|(^|[^a-z])(says|said|states|stated) (he|she|they|i)|report (i|we) (received|got)|(received|got|sent) (me|us) (a|the|this) report'
I_NOPERSON='(who|how much of).*(wrote|write|built|did)|written by|done by|did the most|handover|hand-over|outsourc|predecessor|left behind|(exported?|folder).*sessions?|sessions?.*(exported?|folder)'
PERSON='(^|[^a-z])(i|my|me|mine|we|their|his|her|they|person|candidate|applicant|contractor|freelancer|vendor|supplier|agency|consultant|colleague|employee)([^a-z]|$)'
cls=""
weak=0
cwdonly=0
if [ -n "$lc" ] && [ "$match" = 0 ]; then
  hist=0
  strong=0
  if has "$HIST_STRONG"; then
    hist=1; strong=1
  elif has "$HIST_WEAK"; then
    hist=1; weak=1
  else
    cwd=$(printf '%s' "$flat" | sed -E -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"([^"\\]*)".*/\1/p')
    case $cwd in ''|*[\\]*) ;; *)
      GIT_OPTIONAL_LOCKS=0 git -C "$cwd" rev-parse --is-inside-work-tree >/dev/null 2>/dev/null && { hist=1; weak=1; cwdonly=1; } ;;
    esac
  fi
  if [ "$hist" = 1 ]; then
    has "$I_WORK" && cls="${cls:+$cls, }work or delivery"
    has "$I_REPORT" && cls="${cls:+$cls, }report or summary"
    has "$I_EVID" && cls="${cls:+$cls, }evidence or proof"
    has "$I_USAGE" && cls="${cls:+$cls, }usage"
    has "$I_CHECK" && cls="${cls:+$cls, }check of someone else's claim"
    # The working directory alone is a weak history factor: it also needs a person word, a report word or a who-did-it phrase.
    if [ "$cwdonly" = 1 ] && ! has "$PERSON" && ! has "$I_REPORT" && ! has "$I_NOPERSON"; then cls=""; fi
    [ -n "$cls" ] || { [ "$strong" = 1 ] && has "$I_GENERIC" && cls="report or summary"; }
    [ -z "$cls" ] || match=1
  fi
fi
[ -n "$cls" ] || cls="work evidence"

# addr_extra prints the plain-git sentence (and the address list when the prompt asks for it), or nothing
# when the figures cannot be computed: not a repository, more than 20000 commits, no git identity, git missing.
addr_extra() {
  cwd=$(printf '%s' "$flat" | sed -E -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"([^"\\]*)".*/\1/p')
  case $cwd in *[\\]*) return 0 ;; esac
  [ -n "$cwd" ] || cwd=.
  export GIT_OPTIONAL_LOCKS=0
  [ "$(git -C "$cwd" rev-parse --is-inside-work-tree 2>/dev/null)" = true ] || return 0
  n=$(git -C "$cwd" rev-list --count --max-count=20001 HEAD 2>/dev/null)
  case $n in ''|*[!0-9]*) return 0 ;; esac
  [ "$n" -le 20000 ] || return 0
  name=$(git -C "$cwd" config user.name 2>/dev/null)
  email=$(git -C "$cwd" config user.email 2>/dev/null)
  if [ -z "$name" ] && [ -z "$email" ]; then return 0; fi
  ask=0
  if has 'which (e-?mail|address)|list (the |my |all )?(e-?mail|address)|show (me )?(the |my )?(e-?mail|address)|what (e-?mail|address)'; then ask=1; fi

  # One awk pass over the shortlog. Counts are per address. Rules, in order: configured address; the
  # configured name on that address; the local part equal to the configured local part; a noreply login
  # equal to the configured local part or to the name with non-alphanumerics removed. First rule wins.
  out=$(git -C "$cwd" shortlog -sne --no-merges HEAD 2>/dev/null | CN="$name" CE="$email" ASK="$ask" awk '
    BEGIN {
      FS = "\t"; cn = tolower(ENVIRON["CN"]); ce = tolower(ENVIRON["CE"]); cl = ce; sub(/@.*/, "", cl)
      sq = cn; gsub(/[^a-z0-9]/, "", sq)
    }
    {
      rest = substr($0, index($0, "\t") + 1)
      if (match(rest, /<[^<]*$/) == 0) next
      ea = tolower(substr(rest, RSTART + 1)); ea = substr(ea, 1, length(ea) - 1)
      en = tolower(substr(rest, 1, RSTART - 1)); sub(/ +$/, "", en)
      c = $1; gsub(/[^0-9]/, "", c)
      cnt[ea] += c
      if (cn != "" && en == cn) named[ea] = 1
    }
    END {
      total = 0; k = 0; list = ""
      for (a in cnt) {
        r = ""
        at = index(a, "@"); dom = substr(a, at + 1); l = substr(a, 1, at - 1); sub(/^[0-9]+\+/, "", l)
        if (ce != "" && a == ce) r = "C"
        else if (named[a]) r = "N"
        else if (dom == "users.noreply.github.com" && ((cl != "" && l == cl) || (sq != "" && l == sq))) r = "R"
        else if (cl != "" && l == cl) r = "A"
        if (r == "") continue
        g[r]++; k++; total += cnt[a]
        list = list (list == "" ? "" : ", ") a
      }
      if (k == 0) exit
      print total " " k " " g["C"] + 0 " " g["N"] + 0 " " g["A"] + 0 " " g["R"] + 0
      if (ENVIRON["ASK"] == 1) print list
    }
  ' 2>/dev/null)
  [ -n "$out" ] || return 0
  nums=$(printf '%s\n' "$out" | sed -n 1p)
  addrs=$(printf '%s\n' "$out" | sed -n 2p | tr -d '[:cntrl:]"\\')
  set -- $nums
  total=$1; k=$2; ncfg=$3; nn=$4; na=$5; nr=$6
  groups=""
  if [ "$ncfg" -gt 0 ]; then groups="the configured one"; fi
  if [ "$nn" -gt 0 ]; then groups="${groups:+$groups, }$nn carrying the configured name"; fi
  if [ "$na" -gt 0 ]; then groups="${groups:+$groups, }$na whose address name matches"; fi
  if [ "$nr" -gt 0 ]; then groups="${groups:+$groups, }$nr GitHub noreply address(es) whose login matches"; fi
  extra=$(printf '%s' 'Plain git count (git shortlog -sne --no-merges, a quick estimate that can differ from the tool by bot and generated-file exclusions): '"$total"' non-merge commits across '"$k"' address(es): '"$groups"'. These are rules, not proof, and may include another person who shares the name or the address name. For the full verifiable figures run `npx workproof mine --out <file>`.')
  if [ "$ask" = 1 ]; then extra="$extra Addresses: $addrs."; fi
  # Paste-ready basis sentence, the wording workproof mine prints. mine merges only noreply-login matches, so
  # merged is nr alone. Same-name and address-name addresses are in the computed count but are not named here.
  merged=$nr
  if [ "$merged" -gt 0 ]; then
    rules="a GitHub noreply address whose login matches the name or the address in git config"
    if [ "$merged" -eq 1 ]; then who="1 other address"; else who="$merged other addresses"; fi
    extra="$extra"' To record the basis, paste this under a heading \"Which addresses are counted\": \"Counted as the same person: '"$who"', because the rules matched: '"$rules"'. This is a rule, not proof: it can be wrong, and --no-merge-identities counts only the configured address and addresses with the same name.\"'
  fi
  printf '%s' "$extra"
}

# brief_extra prints the prepared brief from `workproof figures --brief`, windowed by the prompt when it states one
# (the prompt goes on stdin, first 4000 bytes), escaped as the rules block is, or nothing:
# not a git work tree, the build or node missing, the command over its 2500 ms budget, or no output. Read-only.
brief_extra() {
  cwd=$(printf '%s' "$flat" | sed -E -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"([^"\\]*)".*/\1/p')
  case $cwd in ''|*[\\]*) return 0 ;; esac
  export GIT_OPTIONAL_LOCKS=0
  [ "$(git -C "$cwd" rev-parse --is-inside-work-tree 2>/dev/null)" = true ] || return 0
  [ -f "$root/dist/src/cli.js" ] || return 0
  command -v node >/dev/null 2>&1 || return 0
  b=$( (printf '%s' "$prompt" 2>/dev/null) | node "$root/dist/src/cli.js" figures --brief --repo "$cwd" --budget-ms 2500 --window-from-stdin 2>/dev/null) || return 0
  [ -n "$b" ] || return 0
  printf '%s' "$b" | tr -d '\r\t' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN{ORS=" "}{print}'
}

if [ -n "$lc" ] && [ "$match" = 1 ]; then
  extra=""
  if [ "$addr" = 1 ]; then extra=$(addr_extra); fi
  # The plugin root, so the model reads the skill's files from there and does not search the disk for them.
  root=${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)}
  root=$(printf '%s' "$root" | tr -d '[:cntrl:]"\\')
  if [ "$weak" = 1 ]; then
    ctx="This request may concern someone's work in a repository (workproof skill: evidence from git, usage reports, CV bullets, checking a report someone sent). Use the rules below only if the request is about writing, summarising or checking a person's work from history."
  else
    ctx="This request matches the workproof skill (evidence of the user's own work from git, a Claude Code usage report, tailoring CV bullets to a job description, or checking a report someone sent). Use the workproof skill and run \`npx workproof ...\` instead of counting or guessing by hand."
  fi
  ctx="$ctx If the user names a folder of exported Claude Code sessions, run \`npx workproof sessions --dir <folder>\` and do not answer from the default local logs. Plugin root: $root (skill, references and commands are under it; do not search the disk for them)."
  ctx="$ctx Intent class: $cls. The rules block below (also in $root/skills/workproof/references/core-rules.md) applies to any document about someone's work from the commit history or sessions, whether or not you run the tool; run \`workproof figures\` before counting; use the workproof report only for figures about the user's own work."
  rules=$(head -c 4500 "$root/skills/workproof/references/core-rules.md" 2>/dev/null | tr -d '\r\t' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN{ORS=" "}{print}')
  if [ -n "$rules" ]; then ctx="$ctx $rules"; fi
  if has 'reviewed-by|second person.?s review|auditor|who reviewed|review evidence|approved by|four.eyes|change.review'; then
    ctx="$ctx For evidence that changes were reviewed, run \`npx workproof reviews --path <area> --since <date> --until <date> --format csv --out <file>\` and build the answer from its rows and limits."
  fi
  if has 'candidate|claims?|contractor|wrote the|who wrote|written by|designed and wrote|owns? '; then
    ctx="$ctx To check a claim that someone wrote or owns a file or folder, run \`npx workproof owner --path <path> --claim <name>\` and quote its rows (surviving lines with whitespace and moves ignored beside plain blame, who created it, namesakes, backdated commits)."
  fi
  # The brief goes before the plain-git sentence, so the sentence still ends the context as before.
  brief=$(brief_extra)
  if [ -n "$brief" ]; then ctx="$ctx Prepared brief (from workproof figures, do not recount by hand): $brief Counts, dates and claims come from the brief above or from \`npx workproof figures|reviews|owner\` (add --author, --since, --until for another person or window); do not recount by hand; a number you write that you did not take from a tool output is a guess."; fi
  if [ -n "$extra" ]; then ctx="$ctx $extra"; fi
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$ctx"
fi
exit 0
