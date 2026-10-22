I haven't written `resume.md` yet. The file you gave me looks like a sample, not your own resume, and the GapToGrowth workflow needs a few answers from you before I can write one.

**1. Is this really your resume?**
`./resumes/past-resume.md` is headed "Reference Resume: Experienced Professional (fictional)". It says every name, company and number in it is made up, and it's meant for layout ideas only. It's under the name Avery Collins. GapToGrowth doesn't treat reference resumes as facts about you, so I can't build on it unless you confirm it describes your real experience.

Reply with one of: `It's mine, use it as my standing resume` · `It's a sample, I'll add my real resume`

**2. Keyword review (draft).** This assumes the answer above is "It's mine". Evidence confidence is my estimate from the text alone.

| Keyword | Need | Evidence in the file | Category |
|---|---|---|---|
| Go | required | Shipment tracking service in Go, listed in Skills | AUTO-ADDED |
| AWS SQS / queue-based systems | required | Service built on Go and SQS, 4M events a day | AUTO-ADDED |
| Event-driven design | required | Same service, plus "event-driven architecture" in Skills | AUTO-ADDED |
| PostgreSQL | required | Reconciliation APIs and query tuning at Brightforge | AUTO-ADDED |
| Terraform | required | CI/CD automation at Brightforge, listed in Skills | AUTO-ADDED |
| Kubernetes | preferred | Skills list only, no bullet showing real use | C: Verify |
| gRPC | preferred | None | C: Verify |
| Rust | preferred | None | B: Learning Hub only |

**3. Questions**
- **Kubernetes:** have you run workloads on it at work, only in a lab, or not at all? I'd keep it in Skills only if you've used it.
- **gRPC:** have you used it at work, in a lab, or not at all? If not, it goes to the Learning Hub and stays off the resume.
- **Terraform and PostgreSQL:** Terraform appears only in the Brightforge CI/CD bullet, and PostgreSQL only in the older Brightforge role. Have you used either more recently, for example at Cedarline? I'd only add that if it's true.
- **Title line:** may I use "Backend Engineer, Shipment Platform" as the subtitle? Your closest real title is Senior Software Engineer.

After you answer, I'll write the one-page tailored resume to `./resume.md`. It will use Go, SQS, event-driven design, PostgreSQL and Terraform, and only the keywords you can truthfully claim. I'll also report which keywords I used and which I left out.

The skill also keeps a Learning Hub for your gaps (Rust, and gRPC or Kubernetes if you haven't used them). It creates a project folder with knowledge files for that. Tell me if you'd rather skip that and only get `resume.md`.