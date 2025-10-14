# generateTasks.py
from google import genai
import os
import json
import re
from dotenv import load_dotenv
from datetime import datetime, timedelta
from ortools.sat.python import cp_model
# Load env first
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Initialize Gemini client
client = genai.Client(api_key=api_key)


def optimize_schedule_with_ortools(tasks, free_days, daily_hours):
    print("tasks in OR-Tools:", tasks)
    print("free_days in OR-Tools:", free_days)
    print("daily_hours in OR-Tools:", daily_hours)
    
    model = cp_model.CpModel()
    time_format = "%Y-%m-%dT%H:%M:%SZ"

    # Prepare limits
    day_limits = {}
    for day, hours in daily_hours.items():
        start_h, end_h = [int(h.split(':')[0]) for h in hours.split('-')]
        day_limits[day] = (start_h, end_h)

    start_vars, end_vars, duration_vars = {}, {}, {}
    valid_tasks = []

    for i, task in enumerate(tasks):
        start_dt = datetime.strptime(task["startTime"], time_format)
        end_dt = datetime.strptime(task["endTime"], time_format)
        duration = int((end_dt - start_dt).total_seconds() // 3600)

        # Normalize cross-day tasks
        if end_dt.date() != start_dt.date():
            end_dt = start_dt.replace(hour=start_dt.hour + duration)
            task["endTime"] = end_dt.strftime(time_format)

        weekday = start_dt.strftime("%A")
        task_date = start_dt.date()  # Track the actual date

        # Skip if not a free day or not in daily_hours
        if weekday not in free_days or weekday not in day_limits:
            print(f"Skipping task {task.get('title', i)} — not on a free day ({weekday}).")
            continue

        start_min, end_max = day_limits[weekday]
        
        # Check if task fits within allowed hours
        task_start_hour = start_dt.hour
        task_end_hour = end_dt.hour
        
        if task_start_hour < start_min or task_end_hour > end_max:
            print(f"Warning: Task {task.get('title', i)} ({task_start_hour}:00-{task_end_hour}:00) "
                  f"doesn't fit in {weekday} hours ({start_min}:00-{end_max}:00). Adjusting...")
            
            # Try to fit the task in the available window
            if start_min + duration <= end_max:
                task_start_hour = start_min
                task_end_hour = start_min + duration
            else:
                print(f"Task {task.get('title', i)} duration ({duration}h) exceeds available time window. Skipping.")
                continue

        start_vars[i] = model.NewIntVar(start_min, end_max - duration, f"start_{i}")
        end_vars[i] = model.NewIntVar(start_min, end_max, f"end_{i}")
        duration_vars[i] = duration

        model.Add(end_vars[i] == start_vars[i] + duration)
        model.Add(end_vars[i] <= end_max)
        
        valid_tasks.append((i, task, weekday, task_date))

    # No overlap constraints (only same DATE, not just same weekday)
    for idx1, (i, _, day_i, date_i) in enumerate(valid_tasks):
        for idx2 in range(idx1 + 1, len(valid_tasks)):
            j, _, day_j, date_j = valid_tasks[idx2]
            
            # Only check overlap if tasks are on the SAME DATE
            if date_i != date_j:
                continue

            task_i_before_j = model.NewBoolVar(f"task_{i}_before_{j}")
            task_j_before_i = model.NewBoolVar(f"task_{j}_before_{i}")
            model.Add(end_vars[i] <= start_vars[j]).OnlyEnforceIf(task_i_before_j)
            model.Add(end_vars[j] <= start_vars[i]).OnlyEnforceIf(task_j_before_i)
            model.AddBoolOr([task_i_before_j, task_j_before_i])

    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10
    status = solver.Solve(model)

    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        print(f"No solution found. Status: {solver.StatusName(status)}")
        print(f"Valid tasks considered: {len(valid_tasks)}")
        return tasks  # return original Gemini schedule

    print(f"Solution found! Status: {solver.StatusName(status)}")
    
    # Apply optimized times
    optimized_tasks = []
    for i, task, _, _ in valid_tasks:
        start_dt = datetime.strptime(task["startTime"], time_format)
        new_start_hour = solver.Value(start_vars[i])
        new_end_hour = solver.Value(end_vars[i])
        
        task["startTime"] = start_dt.replace(hour=new_start_hour, minute=0).strftime(time_format)
        task["endTime"] = start_dt.replace(hour=new_end_hour, minute=0).strftime(time_format)
        optimized_tasks.append(task)
        
        print(f"Optimized: {task['title']} -> {new_start_hour}:00-{new_end_hour}:00")

    return optimized_tasks
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
- If you cannot fit all chapters exactly in the free days/hours, generate tasks anyway and distribute them as best as possible.

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
            print("Before OR-Tools call")
            tasks = optimize_schedule_with_ortools(tasks, free_days, daily_hours)
            print("After OR-Tools call")
            return tasks
        except json.JSONDecodeError as e:
            print("JSON parsing error:", e)
            print("Raw JSON text:", json_text)
            return []
    else:
        print("No JSON block found in AI output.")
        print("Raw AI output:", ai_text)
        return []