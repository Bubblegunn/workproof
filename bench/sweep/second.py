#!/usr/bin/env python3
"""Second run of the real-repository sweep: the per-repository checks of sweep.py plus
`reviews`, `owner` and `figures --brief`, and the probe cases.

Usage (use a private build, never the checkout's dist/):
  WORKPROOF_CLI=<build>/dist/src/cli.js python3 bench/sweep/second.py run --work DIR [--only SUBSTR]... [--skip-first N]
  WORKPROOF_CLI=<build>/dist/src/cli.js python3 bench/sweep/second.py probes --work DIR

run: for every listed repository (repos.tsv order): clone, pin HEAD (or the sha in the file), run everything
sweep.py runs, then the extra checks below, write DIR/results2/<slug>.json and delete the clone.

Extra checks (reference = plain git, clean environment):
  reviews  --path <top-level directory with most non-merge commits> --since Y-01-01 --until Y-12-31, with Y the latest
           year <= 2025 in which that directory has a commit. In-scope count must equal the number of non-merge
           commits of `git log HEAD --no-merges -- <dir>` whose %aI date part is inside the window.
           text, csv and json output are searched for '@'. Each is timed.
  owner    --path <largest tracked text file that the tool does not leave out> --claim <top author name>.
           No '@' in text or json output, exit 0. The header total of "surviving lines ... whitespace and moves ignored"
           must equal the line count of `git blame -w -C --line-porcelain HEAD -- file`; the plain row must equal the
           line count of `git blame --line-porcelain`.
  brief    `figures --brief`: time, no '@', at most 22 lines.
No model is called.
"""
import argparse, datetime as dt, json, os, re, shutil, subprocess, sys, time
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sweep as sw  # noqa: E402

ENV, run, git, node = sw.ENV, sw.run, sw.git, sw.node
EMAILISH = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")


class CapturingHistory(sw.History):
    last = None

    def __init__(self, clone):
        super().__init__(clone)
        CapturingHistory.last = self


def at_lines(text):
    return [l for l in text.split("\n") if "@" in l]


def record_at(rec, label, text):
    """Search an output for '@'. Records every hit; flags separately the ones that look like an email address."""
    hits = at_lines(text)
    x = rec.d["extras"]
    x.setdefault("at_hits", {})[label] = dict(lines=len(hits), emailish=sum(1 for l in hits if EMAILISH.search(l)), first=hits[0][:200] if hits else None)
    return hits


def top_dir(clone):
    raw = git(clone, "-c", "core.quotepath=false", "log", "HEAD", "--no-merges", "--name-only", "--no-renames", "--format=@@%H")
    per = defaultdict(set)
    cur = None
    for line in raw.split("\n"):
        if line.startswith("@@") and re.fullmatch(r"@@[0-9a-f]{40,64}", line):
            cur = line[2:]
        elif line and cur and "/" in line:
            per[line.split("/", 1)[0]].add(cur)
    if not per:
        return None, 0
    d, s = max(per.items(), key=lambda kv: (len(kv[1]), kv[0]))
    return d, len(s)


def extra_reviews(rec, clone, work):
    x = rec.d["extras"]
    d, n = top_dir(clone)
    if d is None:
        x["reviews"] = dict(skipped="no directory in history")
        return
    ref = [l.split("\x1f") for l in git(clone, "log", "HEAD", "--no-merges", "--format=%H%x1f%aI", "--", d).split("\n") if l]
    years = {int(a[:4]) for _, a in ref if a[:4].isdigit() and int(a[:4]) <= 2025}
    Y = max(years) if years else 2025
    since, until = f"{Y}-01-01", f"{Y}-12-31"
    expected = sum(1 for _, a in ref if since <= a[:10] <= until)
    r = dict(path=d, path_commits=n, window=f"{since}..{until}", expected=expected)
    outs = {}
    for fmt in ("text", "csv", "json"):
        cmd = node("reviews", "--repo", clone, "--path", d, "--since", since, "--until", until, "--format", fmt)
        res = run(cmd, work)
        rec.timed("reviews_" + fmt, cmd, res)
        r[f"rc_{fmt}"] = res["rc"]
        if res["rc"] != 0:
            rec.anomaly("nonzero-exit", " ".join(cmd), f"rc={res['rc']} {res['err'][:400]}")
        outs[fmt] = res["out"]
        record_at(rec, "reviews_" + fmt, res["out"] + res["err"])
    m = re.search(r"^(\d+) in scope", outs["text"], re.M)
    r["text_in_scope"] = int(m.group(1)) if m else None
    try:
        js = json.loads(outs["json"])
        r["json_rows"] = len(js.get("rows", []))
        m = re.match(r"(\d+) in scope", js.get("summary", ""))
        r["json_in_scope"] = int(m.group(1)) if m else None
        r["json_computed"] = js.get("computed")
    except Exception as e:
        r["json_error"] = repr(e)
    r["csv_rows"] = max(0, len([l for l in outs["csv"].split("\n") if l]) - 1)  # quoted newlines would inflate this; compared, not trusted alone
    rec.cmp("reviews: text in-scope == plain git", expected, r["text_in_scope"])
    rec.cmp("reviews: json in-scope == plain git", expected, r.get("json_in_scope"))
    rec.cmp("reviews: json rows == in-scope", expected, r.get("json_rows"))
    x["reviews"] = r


def largest_text_files(clone, k=8):
    ents = []
    for e in git(clone, "ls-tree", "-r", "-l", "-z", "--full-tree", "HEAD").split("\0"):
        if not e:
            continue
        meta, path = e.split("\t", 1)
        mode, typ, sha, size = meta.split()
        if typ == "blob" and mode != "120000" and size.isdigit():
            ents.append((int(size), path))
    ents.sort(reverse=True)
    out = []
    for size, path in ents[:60]:
        p = subprocess.run(["git", "grep", "-I", "-c", "", "HEAD", "--", ":(literal)" + path], cwd=clone, env=ENV, capture_output=True, text=True, errors="replace")
        if p.returncode == 0:
            out.append((size, path))
            if len(out) >= k:
                break
    return out


def blame_count(clone, path, ws):
    p = subprocess.run(["git", "blame", *(["-w", "-C"] if ws else []), "--line-porcelain", "HEAD", "--", path], cwd=clone, env=ENV, capture_output=True, text=True, errors="replace")
    n, auth = 0, defaultdict(int)
    name = ""
    for line in p.stdout.split("\n"):
        if line.startswith("author "):
            name = line[7:]
        elif line.startswith("\t"):
            n += 1
            auth[name] += 1
    return n, auth, p.returncode


def extra_owner(rec, clone, work, claim):
    x = rec.d["extras"]
    cands = largest_text_files(clone)
    tried = []
    for size, path in cands[:5]:
        cmd = node("owner", "--repo", clone, "--path", path, "--claim", claim)
        res = run(cmd, work)
        left = re.search(r"left out: (.+)", res["out"])
        tried.append(dict(path=path, size=size, secs=res["secs"], left_out=bool(left)))
        if left and "1 file at HEAD" in res["out"]:
            continue  # the tool leaves the file out (lock file, generated, minified): try the next largest
        rec.timed("owner_text", cmd, res)
        break
    else:
        x["owner"] = dict(tried=tried, skipped="every candidate was left out by the tool")
        return
    r = dict(path=path, size=size, tried=tried, rc_text=res["rc"])
    if res["rc"] != 0:
        rec.anomaly("nonzero-exit", " ".join(cmd), f"rc={res['rc']} {res['err'][:400]}")
    record_at(rec, "owner_text", res["out"] + res["err"])
    cmdj = cmd + ["--json"]
    rj = run(cmdj, work)
    rec.timed("owner_json", cmdj, rj)
    r["rc_json"] = rj["rc"]
    record_at(rec, "owner_json", rj["out"] + rj["err"])
    n_w, auth_w, rc_w = blame_count(clone, path, True)
    n_p, auth_p, rc_p = blame_count(clone, path, False)
    r["own_blame_w"], r["own_blame_plain"] = n_w, n_p
    try:
        js = json.loads(rj["out"])
        rows = js["rows"]
        w = next(rw for rw in rows if rw["label"].startswith("surviving lines by author, whitespace"))
        p = next(rw for rw in rows if rw["label"].startswith("surviving lines by author, plain"))
        mw = re.match(r"(\d+) lines?", w["value"])
        mp = re.match(r"(\d+) lines?", p["value"])
        r["tool_w"] = int(mw.group(1)) if mw else None
        r["tool_plain"] = int(mp.group(1)) if mp else None
        # per-author rows listed after each header row (the tool may list only the leading authors)
        def authors_after(i):
            out = {}
            for rw in rows[i + 1:]:
                if not rw["label"].startswith("  "):
                    break
                m = re.match(r"(\d+) lines?", rw["value"])
                if m:
                    out[rw["label"].strip()] = int(m.group(1))
            return out
        r["tool_w_authors"] = authors_after(rows.index(w))
        r["tool_w_sum_listed"] = sum(r["tool_w_authors"].values())
        claim_row = next((rw for rw in rows if rw["label"].startswith("claim")), None)
        r["claim_row"] = claim_row["value"][:200] if claim_row else None
    except Exception as e:
        r["json_error"] = repr(e)
        rec.anomaly("unparseable-json", " ".join(cmdj), repr(e))
    rec.cmp("owner: surviving total (w) == blame -w -C line count", n_w, r.get("tool_w"))
    rec.cmp("owner: plain total == blame line count", n_p, r.get("tool_plain"))
    x["owner"] = r


def extra_brief(rec, clone, work):
    cmd = node("figures", "--brief", "--repo", clone)
    res = run(cmd, work)
    rec.timed("brief", cmd, res)
    nl = len([l for l in res["out"].split("\n") if l.strip()])
    r = dict(rc=res["rc"], lines=nl, total_lines=len(res["out"].rstrip("\n").split("\n")))
    if res["rc"] != 0:
        rec.anomaly("nonzero-exit", " ".join(cmd), f"rc={res['rc']} {res['err'][:300]}")
    record_at(rec, "brief", res["out"] + res["err"])
    rec.cmp("brief: at most 22 lines", True, r["total_lines"] <= 22)
    r["head"] = res["out"].split("\n")[0][:160]
    rec.d["extras"]["brief"] = r


def sweep_one2(url, sha, flags, work, no_verify=False):
    slug = sw.slug_of(url)
    rec = sw.Rec(slug)
    rec.d.update(url=url, requested_sha=sha)
    rec.d["extras"] = {}
    clone = os.path.join(work, "clone-" + slug)
    outdir = os.path.join(work, "out-" + slug)
    os.makedirs(os.path.join(work, "results2"), exist_ok=True)
    CapturingHistory.last = None
    try:
        sw._sweep(rec, url, sha, flags, work, clone, outdir, no_verify)
        if not rec.d.get("skipped") and os.path.isdir(os.path.join(clone, ".git")):
            claim = rec.d.get("author", {}).get("name") or rec.d.get("author", {}).get("email", "")
            for fn, args in ((extra_reviews, ()), (extra_owner, (claim,)), (extra_brief, ())):
                try:
                    fn(rec, clone, work, *args)
                except Exception as e:
                    rec.d.setdefault("harness_errors", []).append(f"{fn.__name__}: {e!r}")
    except Exception as e:
        rec.d["harness_error"] = repr(e)
    finally:
        shutil.rmtree(clone, ignore_errors=True)
        shutil.rmtree(outdir, ignore_errors=True)
        with open(os.path.join(work, "results2", slug + ".json"), "w") as fh:
            json.dump(rec.d, fh, indent=1, default=str)
    return rec.d


def api_size_kb(url):
    p = subprocess.run(["curl", "-s", "-m", "20", "https://api.github.com/repos/" + url.split("github.com/")[1]], capture_output=True, text=True)
    try:
        return json.loads(p.stdout).get("size")
    except Exception:
        return None


def cmd_run(a):
    repos = sw.load_repos(a.repos)
    if a.only:
        repos = [r for r in repos if any(o in r["url"] for o in a.only)]
    if a.unpinned:
        repos = [r for r in repos if not r["sha"]]
    repos = repos[a.skip_first:]
    os.makedirs(a.work, exist_ok=True)
    os.makedirs(os.path.join(a.work, "results2"), exist_ok=True)
    for i, r in enumerate(repos):
        slug = sw.slug_of(r["url"])
        if os.path.exists(os.path.join(a.work, "results2", slug + ".json")) and not a.force:
            continue
        print(f"[{i + 1}/{len(repos)}] {r['url']}", flush=True)
        kb = api_size_kb(r["url"])
        if kb and kb > 450_000:
            json.dump(dict(slug=slug, url=r["url"], skipped=f"over 300 MB by the GitHub API size ({kb // 1000} MB); not cloned"), open(os.path.join(a.work, "results2", slug + ".json"), "w"))
            print("    skipped by API size", kb, flush=True)
            continue
        clone = os.path.join(a.work, "clone-" + slug)
        secs, err = sw.clone_repo(r["url"], r["sha"], r["flags"], clone)
        if secs is None:
            json.dump(dict(slug=slug, url=r["url"], skipped="clone failed: " + err), open(os.path.join(a.work, "results2", slug + ".json"), "w"))
            print("    clone failed", err, flush=True)
            continue
        d = sweep_one2(r["url"], r["sha"], r["flags"], a.work, a.no_verify)
        d.setdefault("timings", {})["clone"] = secs
        json.dump(d, open(os.path.join(a.work, "results2", slug + ".json"), "w"), indent=1, default=str)
        f = d.get("facts", {})
        print(f"    head={f.get('head', '?')[:12]} commits={f.get('commits')} mismatches={len(d.get('mismatches', []))} anomalies={len(d.get('anomalies', []))} {d.get('skipped', '')} {d.get('harness_error', '')}", flush=True)


def cmd_summarize(a):
    rd = os.path.join(a.work, "results2")
    rows = [json.load(open(os.path.join(rd, f))) for f in sorted(os.listdir(rd)) if f.endswith(".json")]
    print("| repo | sha | commits | size MB | top author (commits) | checks | mismatches | anomalies | slowest command | notes |\n|---|---|---|---|---|---|---|---|---|---|")
    for d in rows:
        f = d.get("facts", {})
        au = d.get("author", {})
        tm = {k: v for k, v in d.get("timings", {}).items() if k not in ("clone", "history_read", "blame_reference")}
        slow = max(tm.items(), key=lambda kv: kv[1]) if tm else ("", "")
        notes = [k for k, on in (("shallow", f.get("shallow")), ("mailmap", f.get("mailmap")), ("submodules", f.get("submodules")), ("branch " + str(f.get("branch")), f.get("branch") not in ("main", "master")), ("non-ASCII names", f.get("non_ascii_names"))) if on]
        if d.get("skipped"):
            notes.append("SKIPPED: " + d["skipped"])
        print(f"| {d.get('url', '').replace('https://github.com/', '')} | {f.get('head', '')[:12]} | {f.get('commits', '')} | {f.get('size_mb', '')} | {au.get('name', '')} ({au.get('commits', '')}) | {len(d.get('checks', []))} | {len(d.get('mismatches', []))} | {len(d.get('anomalies', []))} | {slow[0]} {slow[1]}s | {', '.join(notes)} |")
    print()
    print("| repo | reviews path | window | plain git | tool | owner file (lines) | owner total (w / plain) vs own blame | brief lines | reviews s (t/c/j) | owner s | brief s |\n|---|---|---|---|---|---|---|---|---|---|---|")
    for d in rows:
        x = d.get("extras") or {}
        if not x:
            continue
        r, o, b, t = x.get("reviews", {}), x.get("owner", {}), x.get("brief", {}), d.get("timings", {})
        print(f"| {d['url'].replace('https://github.com/', '')} | {r.get('path', r.get('skipped', ''))} | {r.get('window', '')} | {r.get('expected', '')} | {r.get('text_in_scope', '')}/{r.get('json_in_scope', '')} | {o.get('path', o.get('skipped', ''))} ({o.get('own_blame_w', '')}) | {o.get('tool_w', '')} / {o.get('tool_plain', '')} vs {o.get('own_blame_w', '')} / {o.get('own_blame_plain', '')} | {b.get('lines', '')} | {t.get('reviews_text', '')}/{t.get('reviews_csv', '')}/{t.get('reviews_json', '')} | {t.get('owner_text', '')} | {t.get('brief', '')} |")
    print()
    tot = sum(len(d.get("checks", [])) for d in rows)
    bad = sum(len(d.get("mismatches", [])) for d in rows)
    print(f"repos={len(rows)} checks={tot} mismatches={bad}")
    for d in rows:
        for m in d.get("mismatches", []):
            print(f"MISMATCH {d['url']} {m['check']}: expected {m['expected']} actual {m['actual']} {m['note']}")
        for m in d.get("anomalies", []):
            print(f"ANOMALY {d['url']} [{m['kind']}] {m['cmd'][-160:]} :: {str(m['detail'])[:300]}")
        for n in d.get("notes", []):
            print(f"NOTE {d['url']} {n}")
        for k, v in ((d.get("extras") or {}).get("at_hits") or {}).items():
            if v["emailish"]:
                print(f"EMAILISH {d['url']} {k}: {v['first']}")
        for h in (d.get("harness_errors") or []) + ([d["harness_error"]] if d.get("harness_error") else []):
            print(f"HARNESS {d['url']} {h}")


# ---------------------------------------------------------------- probes
def sh(cwd, *args, env=None, check=True):
    e = dict(ENV, **(env or {}))
    p = subprocess.run(args, cwd=cwd, env=e, capture_output=True, text=True, errors="replace")
    if check and p.returncode:
        raise RuntimeError(f"{' '.join(args)}: {p.stderr[:200]}")
    return p.stdout


def commit(repo, files, who, email, date, msg, trailers=""):
    for path, content in files.items():
        full = os.path.join(repo, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "a", encoding="utf-8") as fh:
            fh.write(content)
        sh(repo, "git", "add", "-A", "--", path)
    env = dict(GIT_AUTHOR_NAME=who, GIT_AUTHOR_EMAIL=email, GIT_COMMITTER_NAME=who, GIT_COMMITTER_EMAIL=email, GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
    sh(repo, "git", "commit", "-q", "--allow-empty", "-m", msg + ("\n\n" + trailers if trailers else ""), env=env)


def cmd_probes(a):
    work = a.work
    os.makedirs(work, exist_ok=True)
    base = os.path.join(work, "probe-real")
    shutil.rmtree(base, ignore_errors=True)
    sw.clone_repo("https://github.com/sindresorhus/is-plain-obj", "", "-", base)
    empty = os.path.join(work, "probe-empty")
    notrepo = os.path.join(work, "probe-notrepo")
    odd = os.path.join(work, "probe-odd")
    unborn = os.path.join(work, "probe-unborn")
    detached = os.path.join(work, "probe-detached")
    linkdir = os.path.join(work, "probe-link")
    bare = os.path.join(work, "probe-bare.git")
    for d in (empty, notrepo, odd, unborn, detached, bare):
        shutil.rmtree(d, ignore_errors=True)
    if os.path.islink(linkdir):
        os.unlink(linkdir)
    os.makedirs(notrepo)
    os.makedirs(empty)
    sh(empty, "git", "init", "-q")
    # odd repository: spaces, non-ASCII, odd offsets, extreme dates, trailers
    os.makedirs(odd)
    sh(odd, "git", "init", "-q", "-b", "main")
    commit(odd, {"dir with space/ünï cödé 文件.txt": "line one\nline two\n", "ключ/файл.md": "первая\n", "plain.txt": "x\n"}, "Zoë Łukasz", "zoe@example.test", "2024-03-05T10:00:00+01:00", "initial: ünï cödé")
    commit(odd, {"dir with space/ünï cödé 文件.txt": "line three\n"}, "Zoë Łukasz", "zoe@example.test", "2024-03-05T23:30:00-12:00", "late in the evening at -12:00", "Reviewed-by: Rev Iewer <rev@example.test>")
    commit(odd, {"ключ/файл.md": "вторая\n"}, "Zoe Lukasz", "zoe.other@example.test", "2024-03-06T00:10:00+14:00", "date at +14:00", "Reviewed-by: Zoë Łukasz <zoe@example.test>")
    commit(odd, {"a\"quote.txt": "q\n", "-dash.txt": "d\n"}, "Tab\tName", "tab@example.test", "2024-12-31T23:59:59+00:00", "quote and dash file names")
    commit(odd, {"plain.txt": "y\n"}, "Zoë Łukasz", "zoe@example.test", "1970-01-01T00:00:00+00:00", "epoch")
    commit(odd, {"plain.txt": "z\n"}, "Future Person", "future@example.test", "2099-12-31T00:00:00+00:00", "year 2099")
    commit(odd, {"plain.txt": "w\n"}, "Zoë Łukasz", "zoe@example.test", "2024-06-15T12:00:00+05:45", "offset +05:45")
    os.symlink("plain.txt", os.path.join(odd, "link-to-plain"))
    sh(odd, "git", "add", "link-to-plain")
    sh(odd, "git", "commit", "-q", "-m", "a symlink", env=dict(GIT_AUTHOR_NAME="Zoë Łukasz", GIT_AUTHOR_EMAIL="zoe@example.test", GIT_COMMITTER_NAME="Z", GIT_COMMITTER_EMAIL="z@example.test"))
    # unborn HEAD with other branches: orphan checkout in a copy
    shutil.copytree(odd, unborn, symlinks=True)
    sh(unborn, "git", "checkout", "-q", "--orphan", "fresh")
    # detached HEAD: real clone detached 3 commits back, and the odd repo at a middle commit
    shutil.copytree(base, detached, symlinks=True)
    sh(detached, "git", "checkout", "-q", "--detach", "HEAD~3")
    # symlink to the repository directory
    os.symlink(odd, linkdir)
    sh(odd, "git", "clone", "-q", "--bare", odd, bare)
    E = "zoe@example.test"
    pe = "Sindre Sorhus"
    jd = os.path.join(work, "probe-empty-jd.txt")
    open(jd, "w").close()
    o = lambda n: os.path.join(work, n)
    N = node
    cases = []

    def add(name, cmd, cwd=None):
        cases.append((name, cmd, cwd))

    add("report --since 2 years ago", N("--repo", base, "--author", pe, "--since", "2 years ago", "--out", o("p1"), "--quiet"))
    add("report --since 2 years ago (author with commits)", N("--repo", odd, "--author", E, "--since", "2 years ago", "--out", o("p1b"), "--quiet"))
    add("figures --since 2 years ago", N("figures", "--repo", odd, "--author", E, "--since", "2 years ago"))
    add("reviews --since 2 years ago", N("reviews", "--repo", odd, "--since", "2 years ago"))
    for d in ("2020-13-45", "2020-02-30", "2024-1-5", "20240105", "2024-01-05T10:00:00Z", "05/01/2024", "0000-00-00", "0001-01-01", "9999-12-31", "", "yesterday", " 2024-01-01", "2024-01-01 "):
        add(f"report --since {d!r}", N("--repo", odd, "--author", E, "--since", d, "--out", o("pd"), "--quiet"))
        add(f"figures --since {d!r}", N("figures", "--repo", odd, "--author", E, "--since", d))
        add(f"reviews --since {d!r}", N("reviews", "--repo", odd, "--since", d))
        add(f"reviews --until {d!r}", N("reviews", "--repo", odd, "--until", d))
    add("report --until 2024-02-30", N("--repo", odd, "--author", E, "--until", "2024-02-30", "--out", o("pd"), "--quiet"))
    add("report inverted window", N("--repo", odd, "--author", E, "--since", "2025-01-01", "--until", "2023-01-01", "--out", o("p3"), "--quiet"))
    add("figures inverted window", N("figures", "--repo", odd, "--author", E, "--since", "2025-01-01", "--until", "2023-01-01"))
    add("reviews inverted window", N("reviews", "--repo", odd, "--since", "2025-01-01", "--until", "2023-01-01"))
    add("reviews same-day window 2024-03-05", N("reviews", "--repo", odd, "--since", "2024-03-05", "--until", "2024-03-05"))
    add("reviews window 2024-03-06 (+14:00 commit)", N("reviews", "--repo", odd, "--since", "2024-03-06", "--until", "2024-03-06"))
    add("report window with no commits", N("--repo", odd, "--author", E, "--since", "2001-01-01", "--until", "2001-12-31", "--out", o("p4"), "--quiet"))
    add("report unknown author", N("--repo", odd, "--author", "nobody@example.invalid", "--out", o("p5"), "--quiet"))
    for name, repo in (("empty repository", empty), ("not a repository", notrepo), ("unborn HEAD (orphan)", unborn), ("nonexistent directory", o("does-not-exist"))):
        add(f"report {name}", N("--repo", repo, "--author", E, "--out", o("pe"), "--quiet"))
        add(f"report {name} (no --author)", N("--repo", repo, "--out", o("pe2"), "--quiet"))
        add(f"figures {name}", N("figures", "--repo", repo, "--author", E))
        add(f"figures --brief {name}", N("figures", "--brief", "--repo", repo))
        add(f"reviews {name}", N("reviews", "--repo", repo))
        add(f"reviews {name} --format json", N("reviews", "--repo", repo, "--format", "json"))
        add(f"owner {name}", N("owner", "--repo", repo, "--path", "x.txt"))
        add(f"mine {name}", N("mine", "--repo", repo, "--author", E, "--out", o("pm.md")))
    add("verify with an unborn HEAD repository", N("verify", o("p4.json"), "--repo", unborn, "--fingerprint-key", "00" * 16))
    add("report detached HEAD", N("--repo", detached, "--author", pe, "--out", o("pdt"), "--quiet"))
    add("figures detached HEAD", N("figures", "--repo", detached, "--author", pe))
    add("figures --brief detached HEAD", N("figures", "--brief", "--repo", detached))
    add("reviews detached HEAD", N("reviews", "--repo", detached))
    add("owner detached HEAD", N("owner", "--repo", detached, "--path", "index.js", "--claim", pe))
    add("mine detached HEAD", N("mine", "--repo", detached, "--author", pe, "--out", o("pdt.md")))
    # odd names
    add("reviews --path 'dir with space'", N("reviews", "--repo", odd, "--path", "dir with space"))
    add("reviews --path ключ (csv)", N("reviews", "--repo", odd, "--path", "ключ", "--format", "csv"))
    add("reviews --path ünï (json) non-ASCII file", N("reviews", "--repo", odd, "--path", "dir with space/ünï cödé 文件.txt", "--format", "json"))
    add("reviews --path -dash.txt", N("reviews", "--repo", odd, "--path", "-dash.txt"))
    add("reviews --path -- -dash.txt", N("reviews", "--repo", odd, "--path", "--", "-dash.txt"))
    add("reviews --path a\"quote.txt", N("reviews", "--repo", odd, "--path", 'a"quote.txt'))
    add("reviews --path nonexistent", N("reviews", "--repo", odd, "--path", "no/such/path"))
    add("reviews --path ../outside", N("reviews", "--repo", odd, "--path", "../outside"))
    add("reviews --path :(glob)**/*.md", N("reviews", "--repo", odd, "--path", ":(glob)**/*.md"))
    add("reviews --trailer reviewed-by (lower case)", N("reviews", "--repo", odd, "--trailer", "reviewed-by"))
    add("reviews all (odd repo)", N("reviews", "--repo", odd))
    add("reviews all json (odd repo)", N("reviews", "--repo", odd, "--format", "json"))
    add("reviews csv with tab in author name", N("reviews", "--repo", odd, "--format", "csv"))
    add("owner file with spaces/non-ASCII", N("owner", "--repo", odd, "--path", "dir with space/ünï cödé 文件.txt", "--claim", "Zoë Łukasz"))
    add("owner dir with spaces", N("owner", "--repo", odd, "--path", "dir with space", "--claim", "Zoe Lukasz"))
    add("owner dir ключ claim non-ASCII", N("owner", "--repo", odd, "--path", "ключ", "--claim", "Zoë Łukasz", "--json"))
    add("owner claim by address", N("owner", "--repo", odd, "--path", "plain.txt", "--claim", E))
    add("owner claim unknown", N("owner", "--repo", odd, "--path", "plain.txt", "--claim", "Nobody At All"))
    add("owner symlink path", N("owner", "--repo", odd, "--path", "link-to-plain"))
    add("owner -dash.txt", N("owner", "--repo", odd, "--path", "-dash.txt"))
    add("owner a\"quote.txt", N("owner", "--repo", odd, "--path", 'a"quote.txt'))
    add("owner path not at HEAD", N("owner", "--repo", odd, "--path", "gone.txt"))
    add("owner path ../outside", N("owner", "--repo", odd, "--path", "../outside"))
    add("owner whole repo '.'", N("owner", "--repo", odd, "--path", "."))
    add("owner with no --path", N("owner", "--repo", odd))
    add("figures --brief (odd repo)", N("figures", "--brief", "--repo", odd))
    add("figures (odd repo) epoch, 2099, +14:00", N("figures", "--repo", odd, "--author", E))
    add("report (odd repo) all history", N("--repo", odd, "--author", E, "--out", o("po"), "--quiet"))
    add("report (odd repo) then verify", N("--repo", odd, "--author", E, "--out", o("po2"), "--quiet"))
    # symlinked repository directory
    add("report symlinked repo dir", N("--repo", linkdir, "--author", E, "--out", o("pl"), "--quiet"))
    add("figures symlinked repo dir", N("figures", "--repo", linkdir, "--author", E))
    add("figures --brief symlinked repo dir", N("figures", "--brief", "--repo", linkdir))
    add("reviews symlinked repo dir", N("reviews", "--repo", linkdir, "--path", "dir with space"))
    add("owner symlinked repo dir", N("owner", "--repo", linkdir, "--path", "plain.txt"))
    add("mine symlinked repo dir", N("mine", "--repo", linkdir, "--author", E, "--out", o("pl.md")))
    add("owner cwd inside symlinked dir, no --repo", N("owner", "--path", "plain.txt"), cwd=linkdir)
    add("reviews cwd inside symlinked dir, no --repo", N("reviews"), cwd=linkdir)
    add("figures --brief cwd inside symlink", N("figures", "--brief"), cwd=linkdir)
    add("figures --repo subdirectory of a repo", N("figures", "--repo", os.path.join(odd, "ключ"), "--author", E))
    add("reviews --repo subdirectory of a repo", N("reviews", "--repo", os.path.join(odd, "ключ")))
    add("owner --repo subdirectory of a repo", N("owner", "--repo", os.path.join(odd, "ключ"), "--path", "файл.md"))
    add("figures bare repository", N("figures", "--repo", bare, "--author", E))
    add("reviews bare repository", N("reviews", "--repo", bare))
    add("owner bare repository", N("owner", "--repo", bare, "--path", "plain.txt"))
    add("figures --brief bare repository", N("figures", "--brief", "--repo", bare))
    # misc usage
    add("figures --brief --budget-ms 1", N("figures", "--brief", "--repo", base, "--budget-ms", "1"))
    add("figures --brief --budget-ms abc", N("figures", "--brief", "--repo", base, "--budget-ms", "abc"))
    add("figures --brief --author x", N("figures", "--brief", "--repo", base, "--author", "x"))
    add("figures --budget-ms 5 without --brief", N("figures", "--repo", base, "--budget-ms", "5"))
    add("reviews --format xml", N("reviews", "--repo", base, "--format", "xml"))
    add("reviews --out into a missing directory", N("reviews", "--repo", base, "--out", o("no/such/dir/out.txt")))
    add("check on a non-report file", N("check", os.path.join(HERE, "jd.txt")))
    add("report --max-commits 5", N("--repo", base, "--author", pe, "--max-commits", "5", "--out", o("p8"), "--quiet"))
    add("report --sample 0", N("--repo", base, "--author", pe, "--sample", "0", "--out", o("p9"), "--quiet"))
    add("verify without the fingerprint key", N("verify", o("po.json"), "--repo", odd))
    add("bullets with an empty job description", N("bullets", "--jd", jd, "--facts", os.path.join(HERE, "jd.txt")))
    out = {}
    for name, cmd, cwd in cases:
        res = run(cmd, cwd or work, timeout=300)
        text = res["err"] + res["out"]
        out[name] = dict(cmd=cmd[2:], rc=res["rc"], secs=res["secs"], stderr=res["err"][:1500], stdout=res["out"][:2500], crash_text=bool(sw.CRASH.search(text)), at_signs=len(at_lines(res["out"])), emailish=len([l for l in at_lines(res["out"]) if EMAILISH.search(l)]))
        print(f"{name}: rc={res['rc']} {res['secs']}s crash={out[name]['crash_text']} at={out[name]['at_signs']}\n   err={res['err'][:160]!r}\n   out={res['out'][:140]!r}", flush=True)
        if name == "report (odd repo) then verify":
            k = re.search(r"fingerprint key ([0-9a-f]{32})", text)
            vres = run(node("verify", o("po2.json"), "--repo", odd, "--fingerprint-key", k.group(1) if k else "0" * 32), work)
            out[name + " [verify]"] = dict(rc=vres["rc"], secs=vres["secs"], stdout=vres["out"][-600:], stderr=vres["err"][:300])
            print(f"   verify rc={vres['rc']} {vres['out'][-200:]!r}", flush=True)
    json.dump(out, open(os.path.join(work, "probes2.json"), "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    r = sp.add_parser("run")
    r.add_argument("--work", required=True)
    r.add_argument("--repos", default=os.path.join(HERE, "repos.tsv"))
    r.add_argument("--only", action="append")
    r.add_argument("--skip-first", type=int, default=0)
    r.add_argument("--no-verify", action="store_true")
    r.add_argument("--force", action="store_true", help="redo repositories that already have a result file")
    r.add_argument("--unpinned", action="store_true", help="only the repositories whose sha column is empty")
    sm = sp.add_parser("summarize")
    sm.add_argument("--work", required=True)
    pr = sp.add_parser("probes")
    pr.add_argument("--work", required=True)
    a = ap.parse_args()
    sw.History = CapturingHistory
    {"run": cmd_run, "probes": cmd_probes, "summarize": cmd_summarize}[a.cmd](a)
