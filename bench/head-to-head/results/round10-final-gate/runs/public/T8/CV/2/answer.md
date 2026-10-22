I saved the tailored resume to `resume.md` in cv-builder/v1 Markdown. I haven't parsed it with CV Builder's validator, and I haven't opened it in the browser Builder.

## Fit report: about 80/100, strong fit
- **Skills match (about 80):**
  - Go and SQS: you built the Cedarline shipment tracking service in them.
  - Event-driven design: that same service.
  - PostgreSQL: the Brightforge reconciliation APIs and query tuning.
  - Terraform: the Brightforge CI/CD work.
- **Experience match (about 85):** You have logistics and shipment-tracking experience plus senior-level backend work.
- **Seniority and culture (about 75):** You have mentoring and design-review experience.
- **Hard requirements:** The posting states no citizenship, visa or language requirements. I couldn't verify any, so I'm noting them as unverified.

## What I changed
- **Summary:** It now leads with Go, SQS, event-driven design, PostgreSQL and Terraform, plus your strongest metric, the 4M events per day and the latency cut from 15 minutes to under 30 seconds.
- **Bullets:** I reordered them so the posting's skills come first. I added "in PostgreSQL" to the query-optimization bullet, which your source supports. I changed no other bullet wording or numbers.
- **Skills:** Go is now first, and a new "Messaging & Data" group surfaces SQS, event-driven architecture and PostgreSQL. Kubernetes (nice-to-have) stays in the list.

## Gaps
| Requirement | Evidence | Missing proof |
|---|---|---|
| Rust (nice-to-have) | None | Any Rust use? |
| gRPC (nice-to-have) | None; the resume mentions REST/FastAPI and contract testing | Any gRPC services? |
| Kubernetes (nice-to-have) | Listed under skills only | Any real work, such as deploying or operating workloads? |
| Go with PostgreSQL | Your PostgreSQL work was in Python, and your Go work was on SQS | Did you use Postgres from Go at Cedarline? |
| Terraform (required) | Used for CI/CD at Brightforge | Any infrastructure provisioning, such as SQS or RDS? |

I added none of these. If you have real experience with any of them, tell me the details and I'll add a bullet.

## Questions
- **Years of experience:** The original summary said "7 years", but your dates (Jul 2017 to now) add up to about 9. I dropped the number rather than guess, so please confirm it.
- **Source file:** The file's header says all of its names and numbers are fictional layout examples. I treated the content as yours, so please check every fact before sending it.
- **Layout:** The cv-builder format has no one-page layout controls. I used a compact one-column layout, and you can check the page count when you export.