# Ground truth for e3 (judging a candidate's CANDIDATE_CLAIMS.md against git history).
# Conventions:
#  * Candidate identity = the email he gives in the claims file: <email:a86484af>
#    A DIFFERENT person, same display name, authored under <email:328ef1bb>
#  * "His commits" = commits whose AUTHOR email is his, in calendar 2025. Commits he only committed
#    (committer = him, author = someone else) are listed separately and do not count as his work.
#  * errtrace authorship = surviving lines in tools/errtrace/src/*.rs (git blame, by author EMAIL) excluding the
#    generated table.rs. Blame by display name would wrongly merge the namesake; shown as the WRONG variant.
#  * Hand-written lines = lines he added excluding table.rs. Release claim: tags were removed from the fixture and
#    Cargo.toml still shows the old version, so it cannot be verified from this checkout.
import subprocess, sys, re, collections
repo = sys.argv[1]
def git(*a): return subprocess.run(["git","-C",repo,*a],check=True,capture_output=True,text=True).stdout
ME="sam.lindqvist@mailbox.example"; OTHER="sam.lindqvist@othercorp.example"
rows=[[x.strip() for x in l.split("\x1f")] for l in git("log","--no-merges","--format=%H%x1f%an%x1f%ae%x1f%aI%x1f%ce%x1f%s%x1e").split("\x1e") if l.strip()]
mine=[r for r in rows if r[2]==ME and r[3].startswith("2025")]
print("claim1_commits_authored_by_his_email_2025:", len(mine), "(claimed 214)")
print("  first/last author date:", min(r[3][:10] for r in mine), max(r[3][:10] for r in mine))
print("committed_by_him_but_authored_by_others:", [(r[0][:7], r[1]) for r in rows if r[4]==ME and r[2]!=ME])
print("namesake_commits_other_email:", len([r for r in rows if r[2]==OTHER]), "range", min(r[3][:10] for r in rows if r[2]==OTHER), max(r[3][:10] for r in rows if r[2]==OTHER))
print("WRONG_name_only_count:", len([r for r in rows if r[1]=="Sam Lindqvist"]))
add=gen=0
for r in mine:
    for l in git("show","--numstat","--format=",r[0]).splitlines():
        a,d,p=l.split("\t",2)
        if p.endswith("table.rs"): gen+=int(a)
        else: add+=int(a)
print("claim3_lines_added_total (claimed over 11,000):", add+gen, "of which generated table.rs:", gen, "handwritten:", add)
files=[f for f in git("ls-files","tools/errtrace/src").split() if f.endswith(".rs") and not f.endswith("table.rs")]
byemail=collections.Counter(); byname=collections.Counter()
for f in files:
    out=git("blame","--line-porcelain","-e",f)
    for m in re.finditer(r"^author (.*)\nauthor-mail <(.*)>",out,re.M):
        byname[m.group(1)]+=1; byemail[m.group(2)]+=1
tot=sum(byemail.values())
print("claim2_errtrace_surviving_lines_excluding_table.rs:", tot)
for e,n in byemail.most_common(): print("   ", e, n, "%.1f%%"%(100*n/tot))
print("   WRONG name-only share for 'Sam Lindqvist': %.1f%%"%(100*byname["Sam Lindqvist"]/tot))
print("claim4_active_period_of_his_authored_commits:", min(r[3][:10] for r in mine), "to", max(r[3][:10] for r in mine), "(claimed Jan-Dec 2025)")
print("claim5_tags_in_checkout:", git("tag").split() or "none", "; Cargo.toml", re.search(r'^version = "(.*)"',git("show","HEAD:Cargo.toml"),re.M).group(1), "(claimed release 1.0.100; unverifiable here)")
