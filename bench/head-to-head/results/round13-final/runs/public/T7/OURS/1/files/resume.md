# Resume
Target role: ML Engineer, Retail AI

## Summary
ML engineer with a multi-agent RAG project (LangGraph, Chroma, FastAPI), a churn model deployed as a FastAPI service, and an in-progress YOLOv8 and ONNX shelf-gap detector for retail images.

## Skills
LangGraph, RAG, ChromaDB, FastAPI, XGBoost, YOLOv8, ONNX, computer vision, churn modelling

## Experience
### Example Corp
Role: Machine Learning Intern, Jun 2024 to Aug 2024
- Built a churn model in XGBoost on 1.2M customer records, reaching 0.87 AUC. [E01-F1]
- Deployed the model as a FastAPI service, serving 40k predictions per day. [E01-F2]

## Projects
### DocQA
Status: complete
Domain: agentic, enterprise
Stack: LangGraph, ChromaDB, FastAPI
- Multi-agent RAG over 5,000 policy PDFs with a planner, retriever and critic agent. [P01-F1]
- Raised answer accuracy from 62% to 81% on a 200-question eval set. [P01-F2]

### ScanSense
Status: in-progress
Domain: computer vision
Stack: YOLOv8, ONNX
- Detects shelf gaps in retail images at 25 FPS on CPU. [P02-F1]

## Gaps
- Python: not in your facts
- PyTorch: not in your facts
- Pinecone, FAISS: not in your facts; Chroma is covered
- Docker: not in your facts
- Edge deployment: not stated; ONNX and CPU inference are covered

## Keyword coverage
| JD item | Must-have? | Covered | Source tag |
|---|---|---|---|
| Python | yes | no | none |
| PyTorch | yes | no | none |
| LLM applications: LangGraph, RAG | yes | yes | P01-F1 |
| Vector databases: Chroma, Pinecone, FAISS | yes | partial (Chroma only) | P01-F1 |
| Docker | yes | no | none |
| FastAPI | yes | yes | P01-F1 |
| Computer vision: YOLO or similar | yes | yes (YOLOv8) | P02-F1 |
| ONNX or edge deployment | nice | yes | P02-F1 |
| Experience with churn or customer models | nice | yes | E01-F1 |

## Ordering check
Complete before in-progress: ok
Entries and dates unchanged from the source: ok
