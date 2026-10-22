import subprocess, sys, json, collections
EMAILS = {"ulisesgascongonzalez@gmail.com", "ulises.gascon@example-corp.test", "ulisesgg@users.noreply.github.com"}
NOISE_PREFIXES = ("third_party/", "dist/")
NOISE_BASENAMES = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}
REPO = None
def git(*a):
    return subprocess.run(["git", "-C", REPO, *a], capture_output=True, text=True, check=True).stdout

def is_bot(n, e):
    return n.endswith("[bot]") or "[bot]@" in e

def noisy(path):
    b = path.rsplit("/", 1)[-1]
    return (any(path.startswith(p) for p in NOISE_PREFIXES) or b in NOISE_BASENAMES or b.endswith(".lock"))

def collect():
    out = git("log", "--no-merges", "--no-renames", "--numstat", "--format=@@%H|%aN|%aE|%aI|%s")
    commits, cur = [], None
    for line in out.splitlines():
        if line.startswith("@@"):
            h, n, e, d, s = line[2:].split("|", 4)
            cur = dict(h=h, n=n, e=e.lower(), d=d, s=s, add=0, dele=0, nadd=0, ndel=0, files=set())
            commits.append(cur)
        elif line.strip() and cur is not None:
            a, dl, p = line.split("\t", 2)
            a = 0 if a == "-" else int(a); dl = 0 if dl == "-" else int(dl)
            cur["add"] += a; cur["dele"] += dl
            if not noisy(p):
                cur["nadd"] += a; cur["ndel"] += dl; cur["files"].add(p)
    merges = []
    for line in git("log", "--merges", "--format=%H|%aN|%aE|%aI").splitlines():
        h, n, e, d = line.split("|"); merges.append((h, n, e.lower(), d))
    return commits, merges

def facts():
    commits, merges = collect()
    human = [c for c in commits if not is_bot(c["n"], c["e"])]
    mine = [c for c in human if c["e"] in EMAILS]
    byid = collections.Counter(c["e"] for c in mine)
    months = sorted({c["d"][:7] for c in mine})
    years = collections.Counter(c["d"][:4] for c in mine)
    dates = sorted(c["d"][:10] for c in mine)
    f = dict(
        identities_seen=len(byid),
        commits_all_identities_no_merges=len(mine),
        commits_by_identity_sorted=sorted(byid.values(), reverse=True),
        merge_commits_authored_by_user=sum(1 for m in merges if m[2] in EMAILS),
        bot_commits_in_repo=len(commits) - len(human),
        first_commit_date=dates[0], last_commit_date=dates[-1],
        active_months=len(months),
        commits_per_year={k: years[k] for k in sorted(years)},
        lines_added_raw=sum(c["add"] for c in mine), lines_deleted_raw=sum(c["dele"] for c in mine),
        lines_added_excl_vendored_generated_lock=sum(c["nadd"] for c in mine),
        lines_deleted_excl_vendored_generated_lock=sum(c["ndel"] for c in mine),
        distinct_files_touched_excl_noise=len({p for c in mine for p in c["files"]}),
        repo_human_commits_no_merges=len(human),
        share_of_repo_human_commits_percent=round(100.0 * len(mine) / len(human), 2),
    )
    n = 0
    for rec in git("log", "--no-merges", "--format=%aE%x1f%B%x1e").split("\x1e"):
        if "\x1f" not in rec: continue
        ae, body = rec.split("\x1f", 1)
        low = body.lower()
        if ae.strip().lower() not in EMAILS and "co-authored-by:" in low and any(e in low for e in EMAILS):
            n += 1
    f["commits_by_others_crediting_user_in_trailer_only"] = n
    f["_mine"] = mine
    return f

def main():
    global REPO
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    REPO = args[0].rstrip("/") + "/repo"
    f = facts(); mine = f.pop("_mine")
    extra(f, mine, args[0])
    if "--json" in sys.argv:
        print(json.dumps(f, indent=2, sort_keys=True)); return
    print("TRUTH (plain git; merges excluded, bots excluded, identities merged case-insensitively)")
    for k in sorted(f):
        print(f"{k}: {f[k]}")
    tail(f, args[0])

def tail(f, d): pass
def extra(f, mine, d): pass

MAP = {"commits_authored": "commits_all_identities_no_merges", "first_commit": "first_commit_date",
       "last_commit": "last_commit_date", "active_months": "active_months",
       "lines_added": "lines_added_excl_vendored_generated_lock",
       "lines_deleted": "lines_deleted_excl_vendored_generated_lock",
       "share_of_repo_commits_percent": "share_of_repo_human_commits_percent",
       "identities_merged": "identities_seen"}
def tail(f, d):
    import os
    p = d.rstrip("/") + "/report.json"
    if not os.path.exists(p): return
    rep = json.load(open(p))["figures"]
    print("\nREPORT COMPARISON (reported vs true)")
    for k, tk in MAP.items():
        ok = rep.get(k) == f[tk]
        print(f"{k}: reported={rep.get(k)} true={f[tk]} {'ok' if ok else 'MISMATCH'}")
main()
