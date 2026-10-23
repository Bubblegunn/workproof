I saved the tailored resume to `resume.md` in canonical `cv-builder/v1` Markdown. I didn't check it against the Builder's validator.

**Fit: about 88/100, a strong fit.**
- Skills match: 85.
- Experience match: 92.
- Culture and seniority signals: 85.
- The posting doesn't state any work-authorization or location requirement, so I couldn't verify those.

**Required skills (all covered by real content):**

| Requirement | Evidence in your resume |
|---|---|
| Go | Cedarline shipment tracking service |
| AWS SQS | Same service, 4M events per day |
| Event-driven design | Same service, plus the Step Functions migration |
| PostgreSQL | Brightforge reconciliation APIs and query tuning |
| Terraform | Brightforge CI/CD automation |

**Nice-to-haves:**
- Kubernetes appears only in your skills list, with no bullet behind it.
- Rust and gRPC appear nowhere in your resume, so I left both out.

**What I changed:**
- **Summary:** It now leads with Go, SQS, PostgreSQL and Terraform, and says "backend engineer".
- **Skills:** I regrouped them so Go, PostgreSQL, SQS and Terraform come first, and added a "Data & Messaging" line.
- **Brightforge:** I named PostgreSQL in the query-optimization bullet. That work was already on PostgreSQL, but the bullet didn't say so.
- **Bullets and metrics:** Every bullet and number is unchanged from your original.
- **Dates:** I kept the dates and your original job titles as they were.
- **Layout:** I converted the format to Builder Markdown, so the one-page layout specs in the old file no longer apply. Export to PDF from the Builder.

**Questions for you:**
1. Have you used Kubernetes in a role, for example deploying Go services to it? If so, I can add a bullet.
2. Do you have any Rust or gRPC experience, even in side projects? If not, leave them off.
3. Have you used Terraform at Cedarline too? It's your most recent role, so a bullet there would help.

I didn't call the CV Builder's `open_builder` tool, since I haven't loaded it here. I can open the file in the browser Builder for ATS preflight if you want.