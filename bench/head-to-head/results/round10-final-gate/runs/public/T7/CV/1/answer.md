I saved the tailored resume to `resume.md`. It uses only facts from your portfolio bank, so it has gaps against the JD.

## Fit report: about 58/100, moderate fit
The skill's guidance says to ask before drafting at this level. I drafted anyway because you asked for the resume.

- **Skills (about 55):** The bank covers LangGraph, RAG, ChromaDB, FastAPI, YOLOv8, ONNX and a churn model.
- **Experience (about 60):** You have one internship and two projects, and the JD doesn't state a seniority level.
- **Culture and seniority (about 60):** I'm assuming this part, since the JD gives little to go on.

**Strengths:**
- DocQA matches the LangGraph, RAG and ChromaDB requirements, with measured accuracy gains (62% to 81%).
- ScanSense matches the YOLO and ONNX requirements.
- The Example Corp churn model matches the nice-to-have on churn, and its FastAPI deployment matches the FastAPI requirement.

## Gaps
These are required by the JD but not in your bank, so I left them out.

| Requirement | Evidence in bank | Missing |
|---|---|---|
| Python | Implied by FastAPI, LangGraph and XGBoost, but never stated | Confirm it |
| PyTorch | YOLOv8 is usually run through PyTorch, but the bank doesn't say so | Did you use it? Where? |
| Pinecone, FAISS | Only ChromaDB | Any experience with either? |
| Docker | None | Did you containerize DocQA or the churn service? |
| Edge deployment | ONNX, plus 25 FPS on CPU | Was it deployed to a device? |

## Open items
- **Name and contact:** The bank has no name or contact details, so the header holds placeholders (`Your Name`, `your.email@example.com`). Education isn't in the bank either, so there is no Education section.
- **ScanSense:** It's marked in-progress, so I labeled it that way. Its F2 bullet is still TODO and I skipped it. A concrete result for it would help, since it is your only computer vision project.
- **Summary:** It states only what the bank supports.

If you confirm Python, PyTorch, Docker or the others, I'll add them to Skills and the relevant bullets.