I saved the tailored resume to `resume.md` in the current directory.

One caveat: `resumes/past-resume.md` labels itself a fictional layout reference ("Avery Collins", "never as facts about the user"). I treated it as your real resume because you said it was. If any of it is placeholder, fix those facts before you send this out.

## Fit report: about 85/100, strong fit
- **Skills (about 85):** All five required items are in your history.
- **Experience (about 85):** The Cedarline SQS shipment-tracking work matches the role directly.
- **Seniority (about 85):** The senior title, mentoring and design-review leadership fit.
- **Location and format:** The posting doesn't state any, so I couldn't check them. It also states no citizenship or work-authorization requirement, so that is unverified.

| Requirement | Type | Evidence |
|---|---|---|
| Go | Required | Cedarline shipment tracking service |
| AWS SQS / queues | Required | 4M events per day at Cedarline |
| Event-driven design | Required | Cedarline service; listed in Practices |
| PostgreSQL | Required | Brightforge reconciliation APIs and query tuning |
| Terraform | Required | Brightforge CI/CD automation |
| Kubernetes | Nice to have | Listed in skills only, with no bullet |
| Rust | Nice to have | None |
| gRPC | Nice to have | None |

## What I changed
- **Summary:** Rewritten around Go, SQS, event-driven design, PostgreSQL and Terraform.
- **Bullet order:** At Brightforge, the Terraform bullet now comes first, then the PostgreSQL ones.
- **Skills:** Go is listed first. I added PostgreSQL as its own line, since you used it at Brightforge. Kubernetes stays listed.
- **Format:** Converted to the CV Builder Markdown format. No facts, metrics or titles were added.

## Questions for you
1. **Years of experience:** The old summary said "7 years", but your dates run from Jul 2017 to now, about 9 years. I dropped the number. Tell me which you want.
2. **Rust and gRPC:** Do you have any real experience with either? If so, share a detail and I'll add a bullet. Otherwise they stay as honest gaps.
3. **Kubernetes:** Do you have a concrete project, such as deploying or operating services? That would turn it from a keyword into evidence.
4. **Terraform at Cedarline:** Did you use it there too? A line on the infrastructure behind the SQS service would strengthen a required skill.

I did not call `open_builder`. I can send it there for ATS preflight and PDF export if you want.