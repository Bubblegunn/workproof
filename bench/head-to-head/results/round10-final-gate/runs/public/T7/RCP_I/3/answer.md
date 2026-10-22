I saved the tailored resume to `resume.md`. I didn't run the receipts miner. It builds a Claude Code usage report from session transcripts and has no resume-tailoring step, so I wrote the resume straight from `portfolio-bank.md`.

**How it maps to the JD**
- **Leading with the strongest matches:** DocQA (LangGraph and RAG, with ChromaDB and FastAPI) and ScanSense (YOLOv8 and ONNX) come first. The ONNX and edge nice-to-have is covered by ScanSense running at 25 FPS on CPU.
- **Churn nice-to-have:** the Example Corp XGBoost churn model and its FastAPI deployment cover it.
- **Opener:** the summary uses "ML engineer", your preferred opener.

**Gaps**
- **Not in your bank:** PyTorch, Pinecone, FAISS and Docker. I left them off rather than claim them. If you have real experience with any of them, add it and I'll work it in.
- **Python:** it isn't listed in your bank. I included it because your stack (LangGraph, XGBoost, FastAPI) implies it. Remove it if that's wrong.
- **ScanSense:** it is marked in-progress, and its second bullet is still `TODO`, so I used only the 25 FPS bullet.
- **Placeholders:** name, contact details and education are bracketed because the bank has none.