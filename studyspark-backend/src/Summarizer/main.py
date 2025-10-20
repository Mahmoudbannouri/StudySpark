from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from app.file_loader import extract_text_from_pdf, extract_text_from_docx
from app.rag_pipeline import generate_summary_rag
from app.utils import extract_metrics
import os, shutil

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/summarize")
async def summarize(file: UploadFile, level: str = Form("medium")):
    temp_path = f"temp/{file.filename}"
    os.makedirs("temp", exist_ok=True)
    try:
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(temp_path)
        elif file.filename.endswith(".docx"):
            text = extract_text_from_docx(temp_path)
        else:
            return {"error": "Format non supporté. Utilisez PDF ou DOCX."}

        summary, chunks = generate_summary_rag(text, level)
        metrics = extract_metrics(summary, chunks)

        return {
            "documentName": file.filename,
            "summary": summary,
            "keyPoints": metrics["keywords"],
            "metrics": metrics
        }

    except Exception as e:
        return {"error": f"Erreur interne : {str(e)}"}

    finally:
        os.remove(temp_path)
