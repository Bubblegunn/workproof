I saved the tailored resume to `resume.md` in cv-builder/v1 Markdown. I haven't opened it in the CV Builder.

## Fit report: about 85/100, strong fit
Skills match is 90, experience match 85, and seniority signals 75. Location and work authorization aren't stated in the JD, so I couldn't verify them.

| JD requirement | Type | Evidence in your resume |
|---|---|---|
| Go | Required | Cedarline shipment tracking service |
| AWS SQS / queue-based systems | Required | The same service, which processes 4M events per day |
| Event-driven design | Required | Cedarline service, plus the Step Functions migration |
| PostgreSQL | Required | Brightforge reconciliation APIs and query optimization |
| Terraform | Required | Brightforge CI/CD automation |
| Kubernetes | Nice to have | Listed in Skills only |
| Rust | Nice to have | **No evidence** |
| gRPC | Nice to have | **No evidence** |

**Strengths:** every required item is backed by a concrete, quantified bullet, and the Cedarline role is close to this one (shipment tracking, SQS, Go).

**Risks:** Kubernetes has no experience bullet behind it, and Rust and gRPC are missing.

## What I changed
- **Summary:** it now leads with Go, SQS, PostgreSQL and Terraform. I dropped "7 years", because your dates (Jul 2017 to now) add up to about 9, and I didn't want to guess which you prefer.
- **Skills:** Go now comes first, and I added a "Messaging & Data" line. Terraform moved up, and Python and Java moved down.
- **Brightforge:** I reworded the query bullet to say "PostgreSQL reporting queries". That is the only wording change in the bullets, and it adds no new claims.
- **Bullets, metrics, employers and dates:** unchanged.
- **Certificates:** I added "Amazon Web Services" as the issuer for your AWS certification. The original didn't name one.

## Open questions
- **Kubernetes:** have you run or deployed services on it, for example Cedarline workloads? If so, send me the facts and I'll add a bullet.
- **Rust and gRPC:** do you have any experience, even side projects? If not, I'd leave them out rather than stretch.
- **Years of experience:** do you want a number back in the summary? If so, which?
- **Source file:** `past-resume.md` is labeled a fictional layout reference, so I treated its contents as your real history. Please check that the facts are yours.