#!/usr/bin/env python3
"""Real-repository sweep of the deterministic workproof commands against plain git.

Usage:
  python3 bench/sweep/sweep.py run --work DIR [--repos bench/sweep/repos.tsv] [--only SUBSTR] [--no-verify]
  python3 bench/sweep/sweep.py probes --work DIR
  python3 bench/sweep/sweep.py summarize --work DIR

Per repository: clone, pin HEAD, derive reference numbers with plain git, run
figures (text, json, windowed json, by name), the default report (+ check, verify,
verdict, mine, bullets), compare, delete the clone. Results go to DIR/results/<slug>.json.
No model is called. Nothing under the tool's own checkout is modified; clones live in DIR.

Reference definitions (all plain `git`, clean environment: GIT_CONFIG_GLOBAL=/dev/null):
  identity E      the lower-cased %aE (mailmap-aware) with most non-merge commits, bots skipped
                  (bot = the four address patterns of src/figures/bot.ts, copied here).
  commits         non-merge commits (<= 1 parent) from `git log HEAD` whose lower-cased %aE is in
                  the identity set and whose %aI date part (the author's own calendar date) is inside
                  [since, until] inclusive. No window = all.
  merges          the same with >= 2 parents.
  first / last    the author's own calendar date of the commit with the earliest / latest author
                  INSTANT (datetime.fromisoformat of %aI), among those commits.
  active months   distinct %aI[:7] of those commits.
  gaps > 30 days  distinct calendar dates sorted; consecutive differences > 30 days.
  distinct authors  distinct lower-cased %aE of all non-merge commits in the window, bots included.
  by committer date  as `commits` but the window is applied to the %cI date part.
  lines raw       sum of added / deleted of `git log HEAD --numstat` (full walk, merges have no
                  numstat) over those commits, binary ("-") files not counted.
  lines -w        the same from `git log --no-walk --stdin -w --numstat` over those commits.
  whitespace-only the commit has raw lines (added+deleted over text files) > 0 and -w lines == 0.
  large added     files with >= 40 added lines in `git log --no-walk --stdin --diff-filter=A --numstat`
                  over those commits (paths starting with a quote skipped, core.quotepath=false).
  reverts         commits whose message matches "This reverts commit <40 hex>" (git log --grep -E).
  identity candidates  other addresses (non-merge commits, not bots) whose author name folds equal to a
                  name of E (foldIdentity port): the tool's count must be >= this count.
  tenure (report) first / last = min / max wall-clock (%aI[:19]) over ALL commits by E, merges included.
  windowLines (report) = report.windowLines + report.excluded.items.paths (the tool's own
                  excluded part) must equal the raw numstat sum over E's non-merge commits inside the
                  tenure days.
"""
import argparse, datetime as dt, json, os, re, shutil, subprocess, sys, time, unicodedata
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CLI = os.environ.get("WORKPROOF_CLI", os.path.join(ROOT, "dist", "src", "cli.js"))
SLOW = 30.0
CMD_TIMEOUT = int(os.environ.get("SWEEP_TIMEOUT", "1500"))
MAX_CLONE_MB = 300
ENV = dict(os.environ, GIT_CONFIG_GLOBAL="/dev/null", GIT_CONFIG_NOSYSTEM="1", GIT_TERMINAL_PROMPT="0", LANG="en_US.UTF-8", LC_ALL="en_US.UTF-8")
BOT = [re.compile(p, re.I) for p in (r"^(?:\d+)?[^@]+\[bot\]@users\.noreply\.github\.com$", r"^bot@renovateapp\.com$", r"^gitlab-bot@gitlab\.com$", r"^teabot@gitea\.io$")]
is_bot = lambda e: any(p.search(e) for p in BOT)
CRASH = re.compile(r"TypeError|RangeError|ReferenceError|SyntaxError|Unhandled|ERR_CHILD_PROCESS|maxBuffer|heap out of memory|\n\s+at [^\n]+\((?:file|node):", re.I)


def run(cmd, cwd, timeout=CMD_TIMEOUT, inp=None):
    t = time.time()
    try:
        p = subprocess.run(cmd, cwd=cwd, env=ENV, input=inp, capture_output=True, timeout=timeout, text=True, errors="replace")
        return dict(rc=p.returncode, out=p.stdout, err=p.stderr, secs=round(time.time() - t, 2), timeout=False)
    except subprocess.TimeoutExpired as e:
        return dict(rc=-9, out=(e.stdout or b"").decode(errors="replace") if isinstance(e.stdout, bytes) else (e.stdout or ""), err="TIMEOUT", secs=round(time.time() - t, 2), timeout=True)


def git(clone, *args, inp=None):
    p = subprocess.run(["git", *args], cwd=clone, env=ENV, input=inp, capture_output=True, text=True, errors="replace")
    if p.returncode:
        raise RuntimeError(f"git {' '.join(args)} failed: {p.stderr.strip()[:200]}")
    return p.stdout


def fold(s):
    s = unicodedata.normalize("NFKC", s)
    s = re.sub("[İıIi]", "i", s).replace("̇", "")
    s = s.replace("ß", "ss").replace("ẞ", "ss").lower()
    return unicodedata.normalize("NFKC", s).strip()


def pdate(iso):
    try:
        return dt.datetime.fromisoformat(iso)
    except Exception:
        return None


# ---------------------------------------------------------------- reference
class History:
    def __init__(self, clone):
        self.clone = clone
        fmt = "%H%x1f%aE%x1f%aN%x1f%aI%x1f%cI%x1f%P%x1f%cE"
        raw = git(clone, "log", "HEAD", "--format=" + fmt)
        self.commits = []
        for line in raw.split("\n"):
            if not line:
                continue
            sha, ae, an, ai, ci, par, ce = line.split("\x1f")
            self.commits.append(dict(sha=sha, email=ae.lower(), name=an, ai=ai, ci=ci, np=len(par.split()), cemail=ce.lower()))
        self.nonmerge = [c for c in self.commits if c["np"] <= 1]
        self._raw = None
        self._want = set()

    def top_author(self):
        cnt = Counter(c["email"] for c in self.nonmerge)
        ranked = cnt.most_common()
        human = [(e, n) for e, n in ranked if not is_bot(e)]
        return (human[0][0] if human else None), (ranked[0][0] if ranked else None), cnt

    def emails_for_email(self, e):
        return {c["email"] for c in self.commits if fold(c["email"]) == fold(e)}

    def emails_for_name(self, n):
        return {c["email"] for c in self.commits if fold(c["name"]) == fold(n)}

    def names_of(self, emails):
        return {c["name"] for c in self.commits if c["email"] in emails}

    def prefetch(self, emails):
        self._want = {c["sha"] for c in self.nonmerge if c["email"] in emails}

    def raw_numstat(self, shas):
        """Full-walk numstat for the prefetched shas: sha -> list of (path, added|None, deleted|None)."""
        if self._raw is not None:
            return self._raw
        want = self._want
        out = {}
        p = subprocess.Popen(["git", "-c", "core.quotepath=false", "log", "HEAD", "--numstat", "--no-color", "--format=@@%H"], cwd=self.clone, env=ENV, stdout=subprocess.PIPE, text=True, errors="replace", bufsize=1 << 20)
        cur = None
        for line in p.stdout:
            line = line.rstrip("\n")
            if line.startswith("@@") and "\t" not in line and re.fullmatch(r"@@[0-9a-f]{40,64}", line):
                cur = line[2:]
                if cur in want:
                    out[cur] = []
                else:
                    cur = None
                continue
            if cur is None or not line:
                continue
            parts = line.split("\t")
            if len(parts) >= 3:
                out[cur].append(("\t".join(parts[2:]), None if parts[0] == "-" else int(parts[0]), None if parts[1] == "-" else int(parts[1])))
        p.wait()
        self._raw = out
        return out

    def stdin_numstat(self, shas, *extra):
        out = {}
        if not shas:
            return out
        raw = git(self.clone, "-c", "core.quotepath=false", "log", "--no-walk=unsorted", "--stdin", "--numstat", "--no-color", "--format=@@%H", *extra, inp="\n".join(shas) + "\n")
        cur = None
        for line in raw.split("\n"):
            if line.startswith("@@") and "\t" not in line and re.fullmatch(r"@@[0-9a-f]{40,64}", line):
                cur = line[2:]
                out[cur] = []
            elif cur and line:
                parts = line.split("\t")
                if len(parts) >= 3:
                    out[cur].append(("\t".join(parts[2:]), None if parts[0] == "-" else int(parts[0]), None if parts[1] == "-" else int(parts[1])))
        return out

    def reverts(self):
        out = git(self.clone, "log", "HEAD", "--no-merges", "-E", "--grep=This reverts commit [0-9a-f]{40}", "--format=%H")
        return set(out.split())


def inwin(iso, since, until):
    d = iso[:10]
    return (since is None or d >= since) and (until is None or d <= until)


def reference(H, emails, since=None, until=None, now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    mine = [c for c in H.nonmerge if c["email"] in emails and inwin(c["ai"], since, until)]
    r = {}
    r["commits"] = len(mine)
    timed = [(pdate(c["ai"]), c) for c in mine]
    timed = [(t, c) for t, c in timed if t]
    timed.sort(key=lambda x: x[0])
    r["first"] = timed[0][1]["ai"][:10] if timed else None
    r["last"] = timed[-1][1]["ai"][:10] if timed else None
    r["months"] = len({c["ai"][:7] for c in mine})
    days = sorted({c["ai"][:10] for c in mine})
    r["gaps"] = sum(1 for a, b in zip(days, days[1:]) if (dt.date.fromisoformat(b) - dt.date.fromisoformat(a)).days > 30)
    win_all = [c for c in H.nonmerge if inwin(c["ai"], since, until)]
    r["all"] = len(win_all)
    r["distinct"] = len({c["email"] for c in win_all})
    r["bots"] = sum(1 for c in win_all if is_bot(c["email"]))
    r["by_committer"] = sum(1 for c in H.nonmerge if c["email"] in emails and inwin(c["ci"], since, until))
    r["merges"] = sum(1 for c in H.commits if c["np"] > 1 and c["email"] in emails and inwin(c["ai"], since, until))
    rv = H.reverts()
    r["reverts"] = sum(1 for c in mine if c["sha"] in rv)
    shas = [c["sha"] for c in mine]
    raw = H.raw_numstat([c["sha"] for c in H.nonmerge if c["email"] in emails])
    r["added"] = sum(a or 0 for s in shas for _, a, d in raw.get(s, []))
    r["deleted"] = sum(d or 0 for s in shas for _, a, d in raw.get(s, []))
    w = H.stdin_numstat(shas, "-w")
    r["added_w"] = sum(a or 0 for s in shas for _, a, d in w.get(s, []))
    r["deleted_w"] = sum(d or 0 for s in shas for _, a, d in w.get(s, []))
    wsonly = 0
    for s in shas:
        rt = sum((a or 0) + (d or 0) for _, a, d in raw.get(s, []))
        wt = sum((a or 0) + (d or 0) for _, a, d in w.get(s, []))
        if rt > 0 and wt == 0:
            wsonly += 1
    r["wsonly"] = wsonly
    big = 0
    for s, files in H.stdin_numstat(shas, "--diff-filter=A").items():
        big += sum(1 for p, a, d in files if (a or 0) >= 40 and not p.startswith('"'))
    r["large"] = big
    allmine = [c for c in H.commits if c["email"] in emails]
    r["future"] = sum(1 for c in allmine if (t := pdate(c["ai"])) and t > now)
    r["cfuture"] = sum(1 for c in allmine if (t := pdate(c["ci"])) and t > now)
    r["early"] = sum(1 for c in allmine if (a := pdate(c["ai"])) and (b := pdate(c["ci"])) and b < a)
    # same-name candidates over the whole history
    names = {fold(n) for n in H.names_of(emails)}
    cand = {c["email"] for c in H.nonmerge if c["email"] not in emails and not is_bot(c["email"]) and fold(c["name"]) in names}
    r["samename_candidates"] = len(cand)
    r["samename_in_window"] = sum(1 for c in win_all if c["email"] in cand)
    return r


def iso_week(d):
    y, w, _ = d.isocalendar()
    return (y, w)


def report_reference(H, emails, tags, since=None, until=None):
    """What the default report should say for an explicit --author, from plain git."""
    allmine = [c for c in H.commits if c["email"] in emails and pdate(c["ai"])]
    loc = sorted(c["ai"][:19] for c in allmine)
    r = {}
    if since or until:
        first = since or loc[0][:10]
        last = until or loc[-1][:10]
    else:
        first, last = (loc[0][:10], loc[-1][:10]) if loc else (None, None)
    r["first"], r["last"] = first, last
    if not first:
        return r
    human = [c for c in H.nonmerge if not is_bot(c["email"]) and first <= c["ai"][:10] <= last]
    r["share_author"] = sum(1 for c in human if c["email"] in emails)
    r["share_total"] = len(human)
    mine = [c for c in human if c["email"] in emails]
    raw = H.raw_numstat([c["sha"] for c in H.nonmerge if c["email"] in emails])
    r["raw_added"] = sum(a or 0 for c in mine for _, a, d in raw.get(c["sha"], []))
    r["raw_deleted"] = sum(d or 0 for c in mine for _, a, d in raw.get(c["sha"], []))
    wk = {iso_week(dt.date.fromisoformat(c["ai"][:10])) for c in mine}
    r["active_weeks"] = len(wk)
    weeks, d, end = [], dt.date.fromisoformat(first), dt.date.fromisoformat(last)
    while d <= end:
        w = iso_week(d)
        if not weeks or weeks[-1] != w:
            weeks.append(w)
        d += dt.timedelta(days=1)
    r["weeks"] = len(weeks)
    streak = best = 0
    for w in weeks:
        streak = streak + 1 if w in wk else 0
        best = max(best, streak)
    r["streak"] = best
    lo = dt.datetime.fromisoformat(first + "T00:00:00+00:00")
    hi = dt.datetime.fromisoformat(last + "T23:59:59+00:00")
    r["tags"] = sum(1 for t in tags if lo <= t <= hi)
    return r


def tag_dates(clone):
    out = git(clone, "for-each-ref", "--format=%(creatordate:iso-strict)", "refs/tags")
    return [t for t in (pdate(x) for x in out.split("\n") if x) if t]


def blame_reference(clone, emails):
    """Surviving-line reference with plain git blame over text files at HEAD (see module doc)."""
    gi = ".git-blame-ignore-revs"
    ign = ["--ignore-revs-file", os.path.join(clone, gi)] if os.path.exists(os.path.join(clone, gi)) else []
    files = [f for f in git(clone, "grep", "-I", "-l", "-z", "", "HEAD").split("\0") if f]
    files = [f.split(":", 1)[1] if f.startswith("HEAD:") else f for f in files]
    # git grep does not search symlink blobs; the tool counts each symlink as one line, so they are added here and counted apart
    links = [l.split("\t", 1)[1] for l in git(clone, "ls-tree", "-r", "-z", "HEAD").split("\0") if l.startswith("120000 ")]
    # git grep -l '' also skips empty files; the tool lists them (numstat 0 0) and they hold no lines
    empties = [l.split("\t", 1)[1] for l in git(clone, "ls-tree", "-r", "-l", "-z", "HEAD").split("\0") if l and re.match(r"100\d+ blob \S+\s+0\t", l)]
    files = sorted(set(files) | set(links) | set(empties))

    def one(f):
        p = subprocess.run(["git", "blame", "--line-porcelain", "-w", "-M", *ign, "HEAD", "--", f], cwd=clone, env=ENV, capture_output=True, text=True, errors="replace")
        n = m = 0
        mail = ""
        for line in p.stdout.split("\n"):
            if line.startswith("author-mail "):
                mail = line[12:].strip("<>").lower()
            elif line.startswith("\t"):
                n += 1
                m += mail in emails
        return n, m

    with ThreadPoolExecutor(8) as ex:
        res = list(ex.map(one, files))
    return dict(symlinks=len(links), files=len(files), attributed=sum(r[0] for r in res), lines=sum(r[1] for r in res))


# ---------------------------------------------------------------- comparison helpers
class Rec:
    def __init__(self, slug):
        self.d = dict(slug=slug, checks=[], mismatches=[], anomalies=[], timings={})

    def cmp(self, name, expected, actual, note=""):
        ok = expected == actual
        self.d["checks"].append(name)
        if not ok:
            self.d["mismatches"].append(dict(check=name, expected=expected, actual=actual, note=note))
        return ok

    def ge(self, name, lo, actual):
        ok = actual is not None and actual >= lo
        self.d["checks"].append(name)
        if not ok:
            self.d["mismatches"].append(dict(check=name, expected=f">= {lo}", actual=actual, note=""))

    def anomaly(self, kind, cmd, detail):
        self.d["anomalies"].append(dict(kind=kind, cmd=cmd, detail=detail))

    def timed(self, label, cmd, res):
        self.d["timings"][label] = res["secs"]
        text = res["err"] + res["out"][-4000:]
        if res["secs"] > SLOW:
            self.anomaly("slow", " ".join(cmd), f"{res['secs']}s")
        if res["timeout"]:
            self.anomaly("timeout", " ".join(cmd), f">{CMD_TIMEOUT}s")
        if CRASH.search(text):
            self.anomaly("crash-text", " ".join(cmd), (res["err"] or res["out"])[:600])


def nonzero(rec, cmd, res):
    shallow = rec.d.get("facts", {}).get("shallow")
    """Record a non-zero exit unless it is the documented shallow-clone refusal."""
    if res["rc"] == 0:
        return False
    if shallow and "is a shallow clone" in res["err"]:
        rec.d.setdefault("documented_refusals", []).append(" ".join(cmd[2:3]) or "report")
        return True
    rec.anomaly("nonzero-exit", " ".join(cmd), f"rc={res['rc']} {res['err'][:500]} {res['out'][-200:]}")
    return True


def node(*args):
    return ["node", CLI, *args]


def parse_rows(js):
    rows = {r["label"]: r for r in js["rows"]}
    return rows


def val(rows, label):
    r = rows.get(label)
    return None if r is None else r["value"]


def compare_figures(rec, tag, rows, ref):
    c = lambda n, e, a, note="": rec.cmp(f"{tag}: {n}", e, a, note)
    c("authored non-merge commits", ref["commits"], val(rows, "authored non-merge commits"))
    f, l = val(rows, "first authored commit date"), val(rows, "last authored commit date")
    c("first authored commit date", ref["first"] or "none in the window", f)
    c("last authored commit date", ref["last"] or "none in the window", l)
    c("active months", ref["months"], val(rows, "active months"))
    c("gaps over 30 days", ref["gaps"], val(rows, "gaps over 30 days"))
    c("all authors, non-merge commits", ref["all"], val(rows, "all authors, non-merge commits"))
    c("distinct authors", ref["distinct"], val(rows, "distinct authors"))
    m = re.search(r"\((\d+) bot commits\)", rows["distinct authors"]["filter"]) if "distinct authors" in rows else None
    c("bot commits in distinct authors filter", ref["bots"], int(m.group(1)) if m else None)
    c("by committer date", ref["by_committer"], val(rows, "authored non-merge commits, by committer date"))
    c("merge commits by the identities", ref["merges"], val(rows, "merge commits by the identities"))
    c("revert commits", ref["reverts"], val(rows, "revert commits"))
    c("lines added, raw", ref["added"], val(rows, "lines added, raw"))
    c("lines deleted, raw", ref["deleted"], val(rows, "lines deleted, raw"))
    c("lines added, whitespace ignored", ref["added_w"], val(rows, "lines added, whitespace ignored"))
    c("lines deleted, whitespace ignored", ref["deleted_w"], val(rows, "lines deleted, whitespace ignored"))
    c("whitespace-only commits", ref["wsonly"], val(rows, "whitespace-only commits"))
    c("large added files", ref["large"], val(rows, "large added files"))
    c("author date in the future", ref["future"], val(rows, "author date in the future"))
    c("committer date in the future", ref["cfuture"], val(rows, "committer date in the future"))
    c("committer date earlier than author date", ref["early"], val(rows, "committer date earlier than author date"))
    fl = rows.get("authored non-merge commits, with identity candidates", {}).get("filter", "")
    m = re.search(r"plus (\d+) candidate addresses", fl)
    rec.ge(f"{tag}: candidate addresses >= same-name addresses", ref["samename_candidates"], int(m.group(1)) if m else None)
    rec.ge(f"{tag}: with-candidates commits >= commits + same-name commits", ref["commits"] + ref["samename_in_window"], val(rows, "authored non-merge commits, with identity candidates"))
    nc = [k for k, r in rows.items() if not r.get("computed", True)]
    if nc:
        rec.d["mismatches"].append(dict(check=f"{tag}: rows not computed", expected="none", actual=nc, note=""))


# ---------------------------------------------------------------- per repository
def slug_of(url):
    return url.rstrip("/").split("github.com/")[-1].replace("/", "__")


def facts_of(clone, H):
    f = {}
    f["head"] = git(clone, "rev-parse", "HEAD").strip()
    f["commits"] = len(H.commits)
    f["rev_list_count"] = int(git(clone, "rev-list", "--count", "HEAD").strip())
    f["merges"] = sum(1 for c in H.commits if c["np"] > 1)
    f["roots"] = len(git(clone, "rev-list", "--max-parents=0", "HEAD").split())
    f["authors"] = len({c["email"] for c in H.commits})
    f["empty_name_commits"] = sum(1 for c in H.commits if not c["name"].strip())
    f["empty_email_commits"] = sum(1 for c in H.commits if not c["email"].strip())
    f["tags"] = len(git(clone, "tag").split())
    f["shallow"] = git(clone, "rev-parse", "--is-shallow-repository").strip() == "true"
    try:
        f["branch"] = git(clone, "symbolic-ref", "--short", "HEAD").strip()
    except RuntimeError:
        f["branch"] = "(detached)"
    f["mailmap"] = os.path.exists(os.path.join(clone, ".mailmap"))
    f["submodules"] = os.path.exists(os.path.join(clone, ".gitmodules"))
    f["bot_commits"] = sum(1 for c in H.nonmerge if is_bot(c["email"]))
    f["non_ascii_names"] = len({c["name"] for c in H.commits if any(ord(ch) > 127 for ch in c["name"])})
    cnt = Counter()
    for p in git(clone, "ls-tree", "-r", "--name-only", "HEAD").split("\n"):
        ext = os.path.splitext(p)[1].lower()
        if ext:
            cnt[ext] += 1
    f["top_extensions"] = [f"{e}:{n}" for e, n in cnt.most_common(4)]
    f["size_mb"] = round(sum(os.path.getsize(os.path.join(dp, fn)) for dp, _, fns in os.walk(os.path.join(clone, ".git")) for fn in fns) / 1e6, 1)
    return f


def last_full_year(H, emails):
    top = max(int(c["ai"][:4]) for c in H.commits if c["ai"][:4].isdigit())
    y = top - 1
    for _ in range(12):
        if any(c["email"] in emails and c["ai"][:4] == str(y) for c in H.nonmerge):
            return y
        y -= 1
    return top - 1


def sweep_one(url, sha, flags, work, no_verify=False):
    slug = slug_of(url)
    rec = Rec(slug)
    rec.d.update(url=url, requested_sha=sha)
    clone = os.path.join(work, "clone-" + slug)
    outdir = os.path.join(work, "out-" + slug)
    os.makedirs(os.path.join(work, "results"), exist_ok=True)
    try:
        return _sweep(rec, url, sha, flags, work, clone, outdir, no_verify)
    except Exception as e:  # a harness failure is recorded, never silently dropped
        rec.d["harness_error"] = repr(e)
        return rec.d
    finally:
        shutil.rmtree(clone, ignore_errors=True)
        shutil.rmtree(outdir, ignore_errors=True)
        with open(os.path.join(work, "results", slug + ".json"), "w") as fh:
            json.dump(rec.d, fh, indent=1, default=str)


def clone_repo(url, sha, flags, clone):
    shutil.rmtree(clone, ignore_errors=True)
    args = ["git", "clone", "--quiet"] + ([] if flags in ("", "-") else flags.split()) + [url, clone]
    t = time.time()
    p = subprocess.run(args, env=ENV, capture_output=True, text=True)
    if p.returncode:
        return None, p.stderr[-300:]
    if sha:
        head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=clone, capture_output=True, text=True).stdout.strip()
        if head != sha:  # reproduction of an older run: pin inside the scratch clone only
            subprocess.run(["git", "checkout", "-q", "--detach", sha], cwd=clone, env=ENV, capture_output=True, text=True)
    return round(time.time() - t, 1), ""


def _sweep(rec, url, sha, flags, work, clone, outdir, no_verify):
    os.makedirs(outdir, exist_ok=True)
    if not os.path.isdir(os.path.join(clone, ".git")):
        secs, err = clone_repo(url, sha, flags, clone)
        if secs is None:
            rec.d["skipped"] = "clone failed: " + err
            return rec.d
        rec.d["timings"]["clone"] = secs
    t0 = time.time()
    H = History(clone)
    rec.d["timings"]["history_read"] = round(time.time() - t0, 1)
    f = facts_of(clone, H)
    rec.d["facts"] = f
    rec.cmp("rev-list --count equals log lines", f["rev_list_count"], f["commits"])
    if f["size_mb"] > MAX_CLONE_MB:
        rec.d["skipped"] = f"over {MAX_CLONE_MB} MB ({f['size_mb']})"
        return rec.d
    E, top_any, cnt = H.top_author()
    if not E:
        rec.d["skipped"] = "no human author"
        return rec.d
    rec.d["author"] = dict(email=E, commits=cnt[E], top_overall=top_any)
    emails = H.emails_for_email(E)
    nm = Counter(c["name"] for c in H.nonmerge if c["email"] == E).most_common(1)
    name = nm[0][0] if nm else ""
    rec.d["author"]["name"] = name
    now = dt.datetime.now(dt.timezone.utc)
    union = set(emails) | H.emails_for_name(name) if name else set(emails)
    if top_any and is_bot(top_any):
        union |= H.emails_for_email(top_any)
    H.prefetch(union)
    full = reference(H, emails, now=now)
    Y = last_full_year(H, emails)
    rec.d["window"] = f"{Y}-01-01..{Y}-12-31"
    win = reference(H, emails, f"{Y}-01-01", f"{Y}-12-31", now=now)
    rec.d["ref_full"], rec.d["ref_window"] = full, win

    # figures: text, json, windowed json
    cmd = node("figures", "--repo", clone, "--author", E)
    res = run(cmd, work)
    rec.timed("figures_text", cmd, res)
    nonzero(rec, cmd, res)
    cmd = node("figures", "--repo", clone, "--author", E, "--json")
    res = run(cmd, work)
    rec.timed("figures_json", cmd, res)
    try:
        js = json.loads(res["out"])
        rows = parse_rows(js)
        compare_figures(rec, "figures full", rows, full)
        rec.cmp("figures full: repository row commit count", f["commits"], int(re.match(r"(\d+) commits", rows["repository"]["filter"]).group(1)))
        rec.cmp("figures full: HEAD row", "HEAD " + f["head"][:7], rows["repository"]["value"])
    except Exception as e:
        rec.anomaly("unparseable-json", " ".join(cmd), f"{e!r} rc={res['rc']} {res['err'][:300]}")
    cmd = node("figures", "--repo", clone, "--author", E, "--since", f"{Y}-01-01", "--until", f"{Y}-12-31", "--json")
    res = run(cmd, work)
    rec.timed("figures_window", cmd, res)
    try:
        compare_figures(rec, "figures window", parse_rows(json.loads(res["out"])), win)
    except Exception as e:
        rec.anomaly("unparseable-json", " ".join(cmd), f"{e!r} rc={res['rc']} {res['err'][:300]}")
    # by name
    if name:
        n_emails = H.emails_for_name(name)
        if len(n_emails) > 1 or n_emails != emails:
            rec.d["name_run_emails"] = len(n_emails)
            ref_n = reference(H, n_emails, now=now)
            cmd = node("figures", "--repo", clone, "--author", name, "--json")
            res = run(cmd, work)
            rec.timed("figures_name", cmd, res)
            try:
                compare_figures(rec, "figures by name", parse_rows(json.loads(res["out"])), ref_n)
            except Exception as e:
                rec.anomaly("unparseable-json", " ".join(cmd), f"{e!r} {res['err'][:300]}")
    # bot author
    if top_any and is_bot(top_any):
        bemails = H.emails_for_email(top_any)
        cmd = node("figures", "--repo", clone, "--author", top_any, "--json")
        res = run(cmd, work)
        rec.timed("figures_bot", cmd, res)
        try:
            compare_figures(rec, "figures bot author", parse_rows(json.loads(res["out"])), reference(H, bemails, now=now))
        except Exception as e:
            rec.anomaly("unparseable-json", " ".join(cmd), f"{e!r} {res['err'][:300]}")

    # default report
    rbase = os.path.join(outdir, "r")
    cmd = node("--repo", clone, "--author", E, "--out", rbase, "--quiet")
    res = run(cmd, work)
    rec.timed("report", cmd, res)
    key = (re.search(r"fingerprint key ([0-9a-f]{32})", res["out"] + res["err"]) or [None, None])[1]
    if res["rc"] != 0:
        if f["shallow"] and "shallow clone" in res["err"]:
            rec.d["report_refused"] = "shallow (documented refusal)"
        else:
            rec.anomaly("nonzero-exit", " ".join(cmd), f"rc={res['rc']} {res['err'][:500]}")
        if f["shallow"]:
            _tail(rec, clone, E, work, outdir, None, None)
            return rec.d
    else:
        try:
            rep = json.load(open(rbase + ".json"))["repositories"][0]
            tags = tag_dates(clone)
            rr = report_reference(H, emails, tags)
            v = {fg["id"]: fg["value"] for fg in rep["figures"]}
            rec.cmp("report: tenure first", rr["first"], v["tenure"]["first"])
            rec.cmp("report: tenure last", rr["last"], v["tenure"]["last"])
            rec.cmp("report: commitShare author", rr["share_author"], v["commitShare"]["author"])
            rec.cmp("report: commitShare total", rr["share_total"], v["commitShare"]["total"])
            ex = rep["excluded"]["items"]["paths"]
            rec.cmp("report: windowLines added + excluded added", rr["raw_added"], rep["windowLines"]["added"] + ex["added"])
            rec.cmp("report: windowLines deleted + excluded deleted", rr["raw_deleted"], rep["windowLines"]["deleted"] + ex["deleted"])
            rec.cmp("report: cadence activeWeeks", rr["active_weeks"], v["cadence"]["activeWeeks"])
            rec.cmp("report: cadence weeksInTenure", rr["weeks"], v["cadence"]["weeksInTenure"])
            rec.cmp("report: cadence longestStreakWeeks", rr["streak"], v["cadence"]["longestStreakWeeks"])
            rec.cmp("report: cadence tagsInTenure", rr["tags"], v["cadence"]["tagsInTenure"])
            rec.cmp("report: head", f["head"], rep["head"])
            rec.d["report_summary"] = dict(excluded_files=rep["excluded"]["files"], excluded_bot_commits=rep["excluded"]["botCommits"], surviving=v.get("survivingLines", {}).get("lines"), attributed=v.get("survivingLines", {}).get("linesAttributed"), sample=v.get("survivingLines", {}).get("sample"), filesTotal=v.get("survivingLines", {}).get("filesTotal"))
            # the figures command and the report disagree about "first/last" when merges bound the range
            ff, fl = ref_first_last_nonmerge(full)
            if (ff, fl) != (v["tenure"]["first"], v["tenure"]["last"]):
                rec.d.setdefault("notes", []).append(f"tenure (report, merges included) {v['tenure']['first']}..{v['tenure']['last']} differs from figures first/last (non-merge) {ff}..{fl}")
        except Exception as e:
            rec.anomaly("report-parse", " ".join(cmd), repr(e))
    _tail(rec, clone, E, work, outdir, key, rbase, no_verify, H, emails, Y)
    return rec.d


def ref_first_last_nonmerge(full):
    return full["first"], full["last"]


def _tail(rec, clone, E, work, outdir, key, rbase, no_verify=False, H=None, emails=None, Y=None):
    name_of_E = rec.d.get("author", {}).get("name", "")
    jd = os.path.join(HERE, "jd.txt")
    if rbase and os.path.exists(rbase + ".json"):
        cmd = node("check", rbase + ".json")
        res = run(cmd, work)
        rec.timed("check", cmd, res)
        nonzero(rec, cmd, res)
        if not no_verify and key:
            cmd = node("verify", rbase + ".json", "--repo", clone, "--fingerprint-key", key)
            res = run(cmd, work)
            rec.timed("verify", cmd, res)
            if res["rc"] != 0 or "all figures reproduce" not in res["out"]:
                n_other = len(H.emails_for_name(name_of_E) - emails) if H else None
                rec.anomaly("verify-not-clean", " ".join(cmd), f"other addresses with the same name: {n_other}; rc={res['rc']} {(res['out'] + res['err'])[-700:]}")
        cmd = node("verdict", rbase + ".json", "--repo", clone, "--author", E, *(["--fingerprint-key", key] if key else []))
        res = run(cmd, work)
        rec.timed("verdict", cmd, res)
        m = re.search(r"## Verdict\n\*\*(.*?)\*\*", res["out"])
        rec.d["verdict"] = m.group(1) if m else None
        if res["rc"] != 0 or not m or not m.group(1).startswith("Figures reproduce"):
            rec.anomaly("verdict-not-clean", " ".join(cmd), f"rc={res['rc']} headline={m.group(1) if m else None} {res['err'][:200]}")
        cmd = node("bullets", "--jd", jd, "--report", rbase + ".json", "--out", os.path.join(outdir, "b.md"))
        res = run(cmd, work)
        rec.timed("bullets", cmd, res)
        nonzero(rec, cmd, res)
    cmd = node("mine", "--repo", clone, "--author", E, "--out", os.path.join(outdir, "m.md"))
    res = run(cmd, work)
    rec.timed("mine", cmd, res)
    nonzero(rec, cmd, res)
    if H is None:
        return
    # windowed report (last full year)
    wbase = os.path.join(outdir, "w")
    cmd = node("--repo", clone, "--author", E, "--since", f"{Y}-01-01", "--until", f"{Y}-12-31", "--out", wbase, "--quiet")
    res = run(cmd, work)
    rec.timed("report_window", cmd, res)
    if nonzero(rec, cmd, res):
        pass
    else:
        try:
            rep = json.load(open(wbase + ".json"))["repositories"][0]
            rr = report_reference(H, emails, tag_dates(clone), f"{Y}-01-01", f"{Y}-12-31")
            v = {fg["id"]: fg["value"] for fg in rep["figures"]}
            ex = rep["excluded"]["items"]["paths"]
            rec.cmp("report window: commitShare author", rr["share_author"], v["commitShare"]["author"])
            rec.cmp("report window: commitShare total", rr["share_total"], v["commitShare"]["total"])
            rec.cmp("report window: windowLines added + excluded", rr["raw_added"], rep["windowLines"]["added"] + ex["added"])
            rec.cmp("report window: windowLines deleted + excluded", rr["raw_deleted"], rep["windowLines"]["deleted"] + ex["deleted"])
            rec.cmp("report window: activeWeeks", rr["active_weeks"], v["cadence"]["activeWeeks"])
        except Exception as e:
            rec.anomaly("report-parse", " ".join(cmd), repr(e))
    # surviving lines against plain git blame, small repositories only
    try:
        nfiles = len([x for x in git(clone, "grep", "-I", "-l", "-z", "", "HEAD").split("\0") if x])
    except RuntimeError:
        nfiles = 10**9
    if nfiles <= 500:
        bbase = os.path.join(outdir, "b")
        cmd = node("--repo", clone, "--author", E, "--no-exclusions", "--sample", "1", "--out", bbase, "--quiet")
        res = run(cmd, work)
        rec.timed("report_blame_check", cmd, res)
        if res["rc"] == 0:
            rep = json.load(open(bbase + ".json"))["repositories"][0]
            sv = next(fg["value"] for fg in rep["figures"] if fg["id"] == "survivingLines")
            t0 = time.time()
            ref = blame_reference(clone, emails)
            rec.d["timings"]["blame_reference"] = round(time.time() - t0, 1)
            rec.cmp("blame check: lines attributed", ref["attributed"], sv["linesAttributed"])
            rec.cmp("blame check: lines by E", ref["lines"], sv["lines"])
            rec.cmp("blame check: files", ref["files"], sv["filesTotal"])
            rec.d["blame_symlinks"] = ref["symlinks"]
    # no --author: configured email, identity merging
    git(clone, "config", "user.email", E)
    cmd = node("--repo", clone, "--sample", "50", "--out", os.path.join(outdir, "d"), "--quiet")
    res = run(cmd, work)
    rec.timed("report_configured_identity", cmd, res)
    if nonzero(rec, cmd, res):
        pass
    else:
        rep = json.load(open(os.path.join(outdir, "d.json")))["repositories"][0]
        rec.d["configured_identity"] = dict(count=rep["identity"]["count"], merged=rep["identity"].get("merged"), possiblySplit=(rep["identity"].get("possiblySplit") or {}).get("count"))
        explicit = next(fg["value"]["author"] for fg in rep["figures"] if fg["id"] == "commitShare")
        rec.ge("configured identity: commits >= explicit address", sum(1 for c in H.nonmerge if c["email"] in emails), explicit)
    cmd = node("mine", "--repo", clone, "--out", os.path.join(outdir, "m2.md"))
    res = run(cmd, work)
    rec.timed("mine_configured", cmd, res)
    nonzero(rec, cmd, res)


# ---------------------------------------------------------------- driver
def load_repos(path):
    rows = []
    for line in open(path):
        if line.startswith("#") or not line.strip():
            continue
        p = line.rstrip("\n").split("\t")
        p += [""] * (4 - len(p))
        rows.append(dict(url=p[0], sha=p[1].strip(), flags=p[2].strip() or "-", why=p[3]))
    return rows


def cmd_run(a):
    repos = load_repos(a.repos)
    if a.only:
        repos = [r for r in repos if a.only in r["url"]]
    os.makedirs(a.work, exist_ok=True)
    pool = ThreadPoolExecutor(1)

    def pre(r):
        clone = os.path.join(a.work, "clone-" + slug_of(r["url"]))
        return clone_repo(r["url"], r["sha"], r["flags"], clone)

    futs = [pool.submit(pre, repos[0])] if repos else []
    for i, r in enumerate(repos):
        secs, err = futs[i].result()
        if i + 1 < len(repos):
            futs.append(pool.submit(pre, repos[i + 1]))
        slug = slug_of(r["url"])
        print(f"[{i + 1}/{len(repos)}] {r['url']}", flush=True)
        if secs is None:
            os.makedirs(os.path.join(a.work, "results"), exist_ok=True)
            json.dump(dict(slug=slug, url=r["url"], skipped="clone failed: " + err), open(os.path.join(a.work, "results", slug + ".json"), "w"))
            continue
        d = sweep_one(r["url"], r["sha"], r["flags"], a.work, a.no_verify)
        d.setdefault("timings", {})["clone"] = secs
        json.dump(d, open(os.path.join(a.work, "results", slug + ".json"), "w"), indent=1, default=str)
        f = d.get("facts", {})
        print(f"    head={f.get('head', '?')[:12]} commits={f.get('commits')} mismatches={len(d.get('mismatches', []))} anomalies={len(d.get('anomalies', []))} {d.get('skipped', '')}", flush=True)


def cmd_summarize(a):
    rd = os.path.join(a.work, "results")
    rows = [json.load(open(os.path.join(rd, f))) for f in sorted(os.listdir(rd)) if f.endswith(".json")]
    print("| repo | sha | commits | merges | authors | size MB | top extensions | author (commits) | notes |\n|---|---|---|---|---|---|---|---|---|")
    for d in rows:
        f = d.get("facts", {})
        notes = [k for k, on in (("shallow", f.get("shallow")), ("mailmap", f.get("mailmap")), ("submodules", f.get("submodules")), ("branch " + str(f.get("branch")), f.get("branch") not in ("main", "master")), (f"{f.get('tags')} tags", f.get("tags", 1) == 0), (f"{f.get('bot_commits')} bot commits", f.get("bot_commits", 0) > 50), ("empty-name", f.get("empty_name_commits")), ("non-ASCII names", f.get("non_ascii_names"))) if on]
        au = d.get("author", {})
        print(f"| {d.get('url')} | {f.get('head', '')} | {f.get('commits', '')} | {f.get('merges', '')} | {f.get('authors', '')} | {f.get('size_mb', '')} | {' '.join(f.get('top_extensions', []))} | {au.get('email', '')} ({au.get('commits', '')}) | {', '.join(notes)}{' SKIPPED: ' + d['skipped'] if d.get('skipped') else ''} |")
    print()
    tot = sum(len(d.get("checks", [])) for d in rows)
    bad = sum(len(d.get("mismatches", [])) for d in rows)
    print(f"repos={len(rows)} checks={tot} mismatches={bad}")
    for d in rows:
        for m in d.get("mismatches", []):
            print(f"MISMATCH {d['url']} {m['check']}: expected {m['expected']} actual {m['actual']} {m['note']}")
        for m in d.get("anomalies", []):
            print(f"ANOMALY {d['url']} [{m['kind']}] {m['cmd'][-200:]} :: {str(m['detail'])[:300]}")
        for n in d.get("notes", []):
            print(f"NOTE {d['url']} {n}")
        if d.get("harness_error"):
            print(f"HARNESS {d['url']} {d['harness_error']}")


def cmd_probes(a):
    """Edge invocations on a tiny synthetic and a real repository; records exit code, time and first lines."""
    os.makedirs(a.work, exist_ok=True)
    base = os.path.join(a.work, "probe-repo")
    shutil.rmtree(base, ignore_errors=True)
    clone_repo("https://github.com/sindresorhus/is-plain-obj", "", "-", base)
    E = "person@example.test"  # synthetic: the probes check exit codes and messages, not counts
    empty = os.path.join(a.work, "probe-empty")
    shutil.rmtree(empty, ignore_errors=True)
    os.makedirs(empty)
    subprocess.run(["git", "init", "-q", empty], env=ENV)
    notrepo = os.path.join(a.work, "probe-notrepo")
    os.makedirs(notrepo, exist_ok=True)
    cases = {
        "report --since '2 years ago'": node("--repo", base, "--author", E, "--since", "2 years ago", "--out", os.path.join(a.work, "p1"), "--quiet"),
        "report --since 2020-13-45": node("--repo", base, "--author", E, "--since", "2020-13-45", "--out", os.path.join(a.work, "p2"), "--quiet"),
        "report inverted window": node("--repo", base, "--author", E, "--since", "2021-01-01", "--until", "2019-01-01", "--out", os.path.join(a.work, "p3"), "--quiet"),
        "report window with no commits": node("--repo", base, "--author", E, "--since", "2001-01-01", "--until", "2001-12-31", "--out", os.path.join(a.work, "p4"), "--quiet"),
        "report unknown author": node("--repo", base, "--author", "nobody@example.invalid", "--out", os.path.join(a.work, "p5"), "--quiet"),
        "report empty repository": node("--repo", empty, "--author", "a@b.c", "--out", os.path.join(a.work, "p6"), "--quiet"),
        "figures empty repository": node("figures", "--repo", empty, "--author", "a@b.c"),
        "report not a repository": node("--repo", notrepo, "--author", "a@b.c", "--out", os.path.join(a.work, "p7"), "--quiet"),
        "figures not a repository": node("figures", "--repo", notrepo, "--author", "a@b.c"),
        "figures --since 'last tuesday'": node("figures", "--repo", base, "--author", E, "--since", "last tuesday"),
        "figures --since 2020-02-30": node("figures", "--repo", base, "--author", E, "--since", "2020-02-30"),
        "figures --since 1 year ago --json": node("figures", "--repo", base, "--author", E, "--since", "1 year ago", "--json"),
        "report --max-commits 5": node("--repo", base, "--author", E, "--max-commits", "5", "--out", os.path.join(a.work, "p8"), "--quiet"),
        "report --sample 0": node("--repo", base, "--author", E, "--sample", "0", "--out", os.path.join(a.work, "p9"), "--quiet"),
        "report --depth abc": node("--repo", base, "--author", E, "--depth", "abc", "--out", os.path.join(a.work, "p10"), "--quiet"),
        "check on a non-report file": node("check", os.path.join(HERE, "jd.txt")),
        "verify without the fingerprint key": node("verify", os.path.join(a.work, "p4.json"), "--repo", base),
        "bullets with an empty job description": node("bullets", "--jd", os.path.join(a.work, "probe-empty-jd.txt"), "--facts", os.path.join(HERE, "jd.txt")),
    }
    open(os.path.join(a.work, "probe-empty-jd.txt"), "w").close()
    out = {}
    for name, cmd in cases.items():
        res = run(cmd, a.work, timeout=300)
        out[name] = dict(rc=res["rc"], secs=res["secs"], stderr=res["err"][:400], stdout=res["out"][:300], crash_text=bool(CRASH.search(res["err"] + res["out"])))
        print(f"{name}: rc={res['rc']} {res['secs']}s crash_text={out[name]['crash_text']}\n   err={res['err'][:200]!r}\n   out={res['out'][:160]!r}", flush=True)
    json.dump(out, open(os.path.join(a.work, "probes.json"), "w"), indent=1)
    shutil.rmtree(base, ignore_errors=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    r = sp.add_parser("run")
    r.add_argument("--work", required=True)
    r.add_argument("--repos", default=os.path.join(HERE, "repos.tsv"))
    r.add_argument("--only")
    r.add_argument("--no-verify", action="store_true")
    s = sp.add_parser("summarize")
    s.add_argument("--work", required=True)
    pr = sp.add_parser("probes")
    pr.add_argument("--work", required=True)
    a = ap.parse_args()
    {"run": cmd_run, "summarize": cmd_summarize, "probes": cmd_probes}[a.cmd](a)
