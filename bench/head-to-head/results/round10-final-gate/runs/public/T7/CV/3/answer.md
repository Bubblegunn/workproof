I saved the tailored resume to `resume.md`. It uses only facts from your portfolio bank, so some required skills are missing, and you need to fill in a few things before sending it.

## Fit report: about 56/100, moderate fit
The score is skills 55, experience 60 and culture/seniority 50. The 50 is a guess because the bank says nothing on that. I drafted the resume anyway because you asked for it. The skill would normally check with you first at this score.

**Strengths**
- LangGraph and RAG are covered by DocQA.
- ChromaDB, FastAPI and YOLOv8 are all in the bank.
- ONNX (nice-to-have) is covered by ScanSense.
- The churn model (nice-to-have) is covered by the Example Corp internship.

**Risks**
- The experience is a single internship.
- ScanSense is still in progress, so I labelled it that way.

## Gaps and open questions
| Requirement | Evidence in bank | Missing proof | Suggested bullet (use your real facts) |
|---|---|---|---|
| Python (required) | XGBoost, FastAPI and LangGraph imply it, but it isn't stated | Explicit confirmation | Add "Python" to Skills if true |
| PyTorch (required) | None | Any PyTorch work, for example YOLO training | "Trained/fine-tuned [model] in PyTorch on [data]" |
| Pinecone, FAISS (required) | Only ChromaDB | Any use of either | "Evaluated FAISS vs Chroma for [task]" |
| Docker (required) | None | Whether the FastAPI services were containerized | "Containerized [service] with Docker" |

PyTorch and Docker are the most likely to filter the resume out. If you have real experience with any of these, tell me and I'll add it.

## What I changed
- **Order:** I put the LLM/RAG, vector-database and computer-vision skills first, in the order the JD lists them.
- **Dropped bullet:** I left out ScanSense F2 because it is still "TODO" in the bank.
- **Added detail:** I wrote that DocQA is served through FastAPI. The bank lists FastAPI in DocQA's stack but doesn't describe how the project is served, so confirm or remove that bullet.
- **Placeholder name:** The bank has no name, contact details or education. The name and the `example.com` email are placeholders, so replace them. I left Education out, and Start/End dates on the projects are blank.

I did not open the browser Builder because no MCP server is connected here.