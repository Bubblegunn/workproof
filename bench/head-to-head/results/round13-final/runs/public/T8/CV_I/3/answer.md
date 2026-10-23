I saved the tailored resume to `resume.md` in the current directory. The fit score is about 84/100, a strong fit. I haven't run it through the CV Builder preflight or exported a PDF.

## Fit report
| Dimension | Score |
|---|---|
| Skills match (40%) | 85 |
| Experience match (40%) | 85 |
| Culture and seniority signals (20%) | 80 |

**Strengths**
- **Go, SQS and event-driven design:** Your shipment tracking service at Cedarline covers all three. It processes 4M events per day. It is also the same domain as this shipment platform role.
- **PostgreSQL:** The reconciliation APIs and the query tuning at Brightforge.
- **Terraform:** The CI/CD automation at Brightforge.

**Risks**
- **Go and PostgreSQL:** Your Go work and your PostgreSQL work are in different roles, so no single bullet shows them together.
- **Terraform:** It is tied to a 2019–2022 role, not your current one.

**Requirement coverage**
| Requirement | Type | Evidence | Status |
|---|---|---|---|
| Go | Required | Cedarline tracking service | Covered |
| AWS SQS / queue systems | Required | Cedarline tracking service | Covered |
| Event-driven design | Required | Cedarline; skills list | Covered |
| PostgreSQL | Required | Brightforge | Covered |
| Terraform | Required | Brightforge CI/CD | Covered |
| Kubernetes | Nice to have | Listed under skills only | Thin evidence |
| Rust | Nice to have | None | Gap |
| gRPC | Nice to have | None | Gap |

## What changed
- The summary now names Go, SQS, event-driven design, PostgreSQL and Terraform, and cites the 4M-events-per-day figure.
- Skills are regrouped with Go first, then messaging, PostgreSQL and Terraform.
- Bullets, metrics and dates are unchanged. Nothing was added.
- Rust and gRPC are left out because the resume has no evidence for them.
- The file uses the cv-builder/v1 format. I dropped the layout notes from your source file.

## Open questions
- **Kubernetes:** Have you used it in production? If so, tell me where and what you did, and I'll add a bullet. It is currently only a skills-list entry.
- **Rust or gRPC:** Any real experience, even side projects? If so, I can add it. Otherwise I'll leave them out.
- **PostgreSQL with Go:** Did you use PostgreSQL with Go at Cedarline? If so, a bullet saying so would help.
- **Placeholder facts:** Your source file is labeled as a fictional reference resume, with `example.com` contacts and a placeholder name. I used it as you instructed. Replace the name, contact details and facts with your real ones before applying.

If the CV Builder server is connected, I can open the result in the browser Builder for the ATS preflight and PDF export.