# generateTasks.py
from google import genai
import os
import json
import re
from dotenv import load_dotenv
from datetime import datetime, timedelta
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
    today = datetime.today().strftime("%Y-%m-%d")
    prompt = f"""
You are a study planner AI.

Today's date is {today}.
⚠️ Very important:
- Do NOT schedule any sessions before {today}.
- All startTime and endTime values must be today or in the future.
- All dates must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
- Each session must last exactly {session_duration} hours.
- Each session **must completely fit inside the user's free hours**.
  - Example: if free hours on Saturday are 10:00-15:00, no session can start before 10:00 or end after 15:00.
- If a session cannot fit in the current day's free hours, schedule it on the next available free day.
- Do not overlap sessions.
- Prioritize subjects based on difficulty and exam dates.

User preferences:
- Free days: {free_days}
- Daily hours: {daily_hours}
- Session duration: {session_duration} hours
- Exam dates: {exams_text}

Documents:
{docs_text}

Task:
- Split the study material into sessions that respect the free days and daily hours.
- Decide how many sessions each subject needs.
- Return a JSON list of tasks **exactly** with these fields:
  - title
  - description
  - document
  - startTime
  - endTime
  - type ("study", "review", "practice", "quiz")
  - completed (boolean)
- Return the JSON **only**, inside a ```json ... ``` block.
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