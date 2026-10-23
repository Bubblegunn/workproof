I saved the tailored resume to `resume.md`. It uses only facts from your bank.

## Fit report: 57/100, moderate

The skill says to ask before drafting at this score. You'd already asked for the resume, so I drafted it and am flagging the gaps below.

| Dimension | Score | Why |
|---|---|---|
| Skills (40%) | 55 | Covered: LangGraph, RAG, Chroma, FastAPI, YOLO, ONNX. Missing: PyTorch, Docker, Pinecone, FAISS. |
| Experience (40%) | 60 | One internship plus two projects. The churn work matches the nice-to-have. ScanSense is still in progress. |
| Seniority and culture (20%) | 55 | The bank shows intern-level experience. |

**Strengths:**
- DocQA covers LangGraph, RAG and Chroma, with a measured gain from 62% to 81% accuracy.
- ScanSense covers YOLO, ONNX and CPU inference.
- The internship covers both the churn model and FastAPI serving.

**Risks:**
- PyTorch, Docker, Pinecone and FAISS are required and nothing in your bank mentions them.
- Python isn't listed anywhere in the bank.

## Gaps

| Requirement | Evidence in bank | Missing proof |
|---|---|---|
| Python | XGBoost, LangGraph and FastAPI are all Python tools, but Python isn't stated | Do you want it listed? |
| PyTorch | None | Any PyTorch work, for example training or fine-tuning? |
| Docker | None | Did you containerize the FastAPI service or DocQA? |
| Pinecone / FAISS | Only ChromaDB | Any use of either? |
| ScanSense F2 | The bank says TODO | A result, such as mAP or the dataset size. |

I left all of these out rather than guess. If any are true, send me the details and I'll add them. Docker and PyTorch would raise the fit the most.

## Changes
- **Order:** DocQA comes before ScanSense, since it matches the required LLM stack. The summary leads with FastAPI deployment, RAG and CPU/ONNX.
- **Wording:** Your bank's wording is kept. I added "(in progress)" to ScanSense and used "Building" for it.
- **Churn:** The churn bullet is kept on the internship, which covers the nice-to-have.
- **Skills:** The skills list uses only skills that appear in your bank.

## Open items
- The header has only "Efe" and your email. Send your full name, plus any phone or links (GitHub, portfolio) you want shown.
- Education isn't in the bank, so there is no Education section. Send it if you want one.