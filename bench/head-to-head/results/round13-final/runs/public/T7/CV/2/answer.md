I saved the tailored resume to `resume.md`. It's a draft that needs your name and contact details before you can send it, and it has real gaps against the JD.

**Fit: about 56/100, a moderate fit.**
- Skills match is about 55.
- Experience match is about 60. You have one internship plus two projects.
- Culture and seniority signals are about 50. The JD says little about them.

I drafted it anyway because you asked. The score is low mainly because the bank doesn't cover several required skills.

**Strengths**
- LangGraph and RAG, from DocQA.
- Chroma.
- FastAPI.
- YOLOv8, from ScanSense.
- ONNX, from ScanSense. It's a nice-to-have.
- Churn modelling, from the Example Corp internship. It's also a nice-to-have.

**What I changed**
- ScanSense now comes first under Projects because it covers the YOLO and ONNX requirements.
- Under the internship, the churn model bullet comes before the FastAPI one.
- DocQA is the second project.
- The summary and skills are grouped to match the JD's wording.
- Every bullet comes from your bank. I added no metrics and no skills.
- I left out ScanSense F2, which is still a TODO in the bank.

**Gaps**

| Requirement | Evidence in bank | What I need from you |
|---|---|---|
| Python | Implied by XGBoost and FastAPI, but never stated | Confirm it, and I'll add it to Skills. |
| PyTorch | None. YOLOv8 runs on it, but the bank doesn't say you used it. | Did you use PyTorch directly, for training or fine-tuning? |
| Pinecone, FAISS | None. Only Chroma. | Any experience with either? |
| Docker | None | Did you containerize the FastAPI service or DocQA? |
| Edge deployment | ONNX is listed, but no detail | What did you do with ONNX, and on what hardware? |

**Placeholders to fix**
- The name and email in the header are placeholders. The bank has no contact details.
- There's no Education section because the bank has none. Tell me your degree and I'll add it.
- The ScanSense and DocQA entries have no dates because the bank has none. ScanSense is marked "In progress".

Tell me which of the gaps are real and I'll add them.