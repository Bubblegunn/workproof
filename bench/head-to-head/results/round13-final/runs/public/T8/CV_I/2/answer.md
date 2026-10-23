I saved the tailored resume to `resume.md` in the current directory, in cv-builder/v1 Markdown.

**Check these facts first.** The banner in `past-resume.md` calls it a fictional reference resume (Avery Collins, example.com contact details). It says to use it for layout only. I treated it as your real resume because you said it was. Replace the name, contact details and employers if they aren't yours.

## Fit report: about 86/100, strong fit
- **Skills (about 85):** Every required item has evidence in your resume.
- **Experience (about 90):** The Cedarline shipment tracking work matches this role closely.
- **Seniority (about 80):** Senior role with mentoring experience.
- **Location and format:** The posting states no work-authorization or language requirement. I couldn't verify location, because the posting doesn't give one.

| Requirement | Type | Evidence |
|---|---|---|
| Go | Required | Cedarline shipment tracking service |
| AWS SQS | Required | 4M events per day, latency cut from 15 minutes to under 30 seconds |
| Event-driven design | Required | Same service, plus the Step Functions migration |
| PostgreSQL | Required | Brightforge reconciliation APIs and query tuning |
| Terraform | Required | Brightforge CI/CD automation |
| Kubernetes | Nice to have | Listed under skills only, with no bullet |
| Rust | Nice to have | Not in your resume, so I left it out |
| gRPC | Nice to have | Not in your resume, so I left it out |

## What I changed
- **Summary:** It now leads with the Go and SQS event-driven work and names PostgreSQL and Terraform.
- **Skills:** I regrouped them so Go, SQS, event-driven architecture, PostgreSQL and Terraform come first.
- **Bullets:** I named PostgreSQL in the query-optimization bullet, because the source already described that work as PostgreSQL. No metrics or facts were added.
- **Format:** I used one-column Markdown with plain section headings so it parses cleanly in ATS.

## Open questions
1. **Years of experience:** The old summary said "7 years", but Jul 2017 to now is about 9. I removed the number. Tell me the figure you want.
2. **Go and PostgreSQL together:** Your PostgreSQL work was in Python, and your Go work was on SQS. If you've used PostgreSQL from Go, tell me and I'll say so.
3. **Kubernetes:** Do you have hands-on experience, such as deploying or operating services? If so, I can add a bullet.
4. **Rust and gRPC:** Do you have any experience with either? I didn't claim them.

Do you want me to open the result in the CV Builder for ATS preflight and PDF export?