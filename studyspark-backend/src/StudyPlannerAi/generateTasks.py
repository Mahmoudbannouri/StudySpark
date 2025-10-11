# generateTasks.py
from google import genai
import os
import json
import re
from dotenv import load_dotenv

# Load env first
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Initialize Gemini client
client = genai.Client(api_key=api_key)

def generate_tasks_ai(documents, free_days, daily_hours, session_duration, exam_dates=None):
    """
    Generate study plan tasks using Gemini API.
    :param documents: list of {id, name, extractedText}
    :param free_days: ["Monday", "Wednesday", ...]
    :param daily_hours: { "Monday": "08:00-12:00", ... }
    :param session_duration: hours per session
    :param exam_dates: optional {documentId: "YYYY-MM-DD"}
    :return: JSON list of tasks [{title, documentId, startTime, endTime, type, completed}]
    """

    # Combine all document texts with their names
    docs_text = "\n".join([f"{doc['name']}:\n{doc['extractedText']}" for doc in documents])
    exams_text = json.dumps(exam_dates) if exam_dates else "No exam dates."

    prompt = f"""
You are a study planner AI. 

User preferences:
- Free days: {free_days}
- Daily hours: {daily_hours}
- Session duration: {session_duration} hours
- Exam dates: {exams_text}

Documents:
{docs_text}

Task:
- Prioritize the subjects by difficulty and exams.
- Split them into study sessions across the free days and hours.
- Decide how many sessions each subject needs.
- Return a JSON list of tasks only, inside a ```json ... ``` block.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # Extract the JSON from the AI response
    ai_text = response.output_text if hasattr(response, "output_text") else str(response)
    match = re.search(r"```json(.*?)```", ai_text, re.DOTALL)
    if match:
        json_text = match.group(1).strip()
        try:
            tasks = json.loads(json_text)
            return tasks
        except json.JSONDecodeError as e:
            print("JSON parsing error:", e)
            print("Raw JSON text:", json_text)
            return []
    else:
        print("No JSON block found in AI output.")
        print("Raw AI output:", ai_text)
        return []
