I saved the tailored resume to `resume.md` in canonical cv-builder/v1 Markdown. I didn't call `open_builder`, so it hasn't been checked in the browser Builder.

## Fit report: 84/100, strong fit

Skills match scores 85, experience match 85, and culture and seniority signals 80. I didn't score location and format, since the JD states neither.

**Strengths**
- **Go, AWS SQS and event-driven design:** your Cedarline shipment tracking service uses all three and processes 4M events per day. It's also in the logistics domain.
- **PostgreSQL:** you have PostgreSQL work at Brightforge, covering reconciliation APIs and query tuning.
- **Terraform:** you used it at Brightforge for CI/CD automation.

**Risks**
- Rust and gRPC (both nice-to-have) have no evidence in your resume.
- Kubernetes appears only as a skills-list entry.
- The JD doesn't mention work authorization or location, so I couldn't check those.

## Gaps

| Requirement | Evidence | Missing proof | Suggested bullet |
|---|---|---|---|
| Terraform (required) | CI/CD automation at Brightforge | Whether you provisioned infrastructure with it, such as SQS queues or RDS | "Provisioned [resources] with Terraform …" |
| Kubernetes (nice-to-have) | Skills list only | Any real deployment work | "Deployed/ran [service] on Kubernetes …" |
| gRPC (nice-to-have) | None | Any usage | Add only if true |
| Rust (nice-to-have) | None | Any usage | Add only if true |

Do you have real experience with any of these?

## What changed
- **Summary:** it now leads with the Go/SQS event-driven work and the PostgreSQL volume.
- **Brightforge bullets:** I reordered them so the PostgreSQL and Terraform bullets come first. I also named PostgreSQL in the query-optimization bullet. Your original says "reporting queries", so confirm those ran on PostgreSQL.
- **Skills:** regrouped to put Go, SQS, PostgreSQL and Terraform first. I added no new tools.
- **Everything else:** bullets, numbers and dates are unchanged.

## Open questions
- **Years of experience:** the old summary said "7 years", but Jul 2017 to now is about 9. I removed the number, so tell me the figure you want.
- **Placeholder content:** the file's header says it's a fictional layout reference. I treated it as your real resume, as you said. Replace the name, contact details and employers if that isn't accurate.