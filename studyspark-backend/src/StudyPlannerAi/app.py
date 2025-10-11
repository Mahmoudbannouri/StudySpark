# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional
from generateTasks import generate_tasks_ai
import uvicorn

app = FastAPI(title="Study Planner AI API")

# -----------------------------
# Request schema
# -----------------------------
class Document(BaseModel):
    id: int
    name: str
    extractedText: str

class GenerateTasksRequest(BaseModel):
    documents: List[Document]
    freeDays: List[str]
    dailyHours: Dict[str, str]
    sessionDuration: int
    examDates: Optional[Dict[int, str]] = None

# -----------------------------
# Endpoint
# -----------------------------
@app.post("/generate-tasks")
def generate_tasks(request: GenerateTasksRequest):
    tasks = generate_tasks_ai(
        documents=[doc.dict() for doc in request.documents],
        free_days=request.freeDays,
        daily_hours=request.dailyHours,
        session_duration=request.sessionDuration,
        exam_dates=request.examDates
    )
    return {"tasks": tasks}

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
