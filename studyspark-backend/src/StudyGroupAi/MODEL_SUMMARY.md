# StudyGroup AI Model — Summary

Rabie: This short doc explains what the model does, what features it needs, how prediction works, and which app modules provide the signals.

## What the model does
- Learner grouping: Predicts a compatibility cluster for a student based on study-related signals and supports forming balanced study groups.
- Algorithm: StandardScaler → Gaussian Mixture Model (GMM, k=2). Returns predicted cluster and class probabilities.
- Output usage: Scores help rank/route students into groups that mix stronger and weaker profiles for collaborative learning.
- Dev fallback: If trained artifacts are missing, a lightweight heuristic returns reasonable probabilities so the flow still works locally.

## Features required for prediction
The model consumes a compact 3-feature vector per student (built in Node by the aggregator):
- Academics/skill signal (from quizzes + summaries + document context)
- Availability fit (number/diversity of available time slots)
- Interest overlap (topic match from interests/courses/summaries)

These are derived from multiple channels:
- Courses: inferred from recent document titles/names
- Availability: simple slot list (defaults provided if missing)
- Interests: keywords from summaries + any explicit interest tags
- Quizzes: per-topic accuracy from past quizzes (score/total)
- Summaries: topic/keyword overlap with the requested topic

Weights (env-overridable) are applied before scaling:
- W_COURSES, W_AVAILABILITY, W_INTERESTS, W_QUIZZES, W_SUMMARIES

## Where the features come from (project modules)
Backend (Node/Express):
- Aggregation: `src/services/studyGroupFeatureAggregator.js`
  - Reads from models: `Document`, `Summary`, `Quiz`
  - Produces normalized signals + weighted 3-feature vector
- Group formation: `src/services/groupFormationService.js`
  - Uses model scores to interleave high/low skill members and assign mentors
  - Persists to `StudyGroup` and `StudyGroupMember`
- API surface:
  - ML proxy: `src/services/mlService.js`, routed by `src/routes/recommendationgroupsRoutes.js`
  - Formation admin: `src/routes/groupFormationRoutes.js` (form/list/refresh)
  - Optional scheduler: `src/jobs/groupRefreshJob.js`

Frontend (Angular):
- StudyGroup page: `src/app/pages/student/studygroup-recommendations/*`
  - Calls recommendation and group-formation endpoints, shows groups & members

## ML service API (Flask)
- `GET /health` → `{ model_loaded, scaler_loaded, dev_mode }`
- `POST /predict` → `{ features: [a,b,c] }` or `{ w_academics, w_availability, w_interests }`
  - Returns: `{ prediction, probabilities? }`
- `POST /predict_batch` → `{ rows: [[a,b,c], ...] | [{...}, ...] }`
  - Returns: `{ predictions, probabilities? }`

Artifacts are searched under `src/StudyGroupAi/exported_models/` (fallback: `model_outputs/`).

## Environment
- Backend: `ML_SERVICE_URL` (e.g., `http://127.0.0.1:5000`)
- Backend weights: `W_COURSES`, `W_AVAILABILITY`, `W_INTERESTS`, `W_QUIZZES`, `W_SUMMARIES`
- Backend port: `.env PORT` (frontend expects `http://localhost:5002/api`)

## Minimal data needed for good predictions
- At least a few of the following per user and target topic:
  - A document whose title hints the topic
  - A generated summary with relevant keywords
  - One or more quizzes with `score/totalQuestions`
  - A couple of availability slots
- If these are sparse, the aggregator supplies safe defaults so the system still works; more data improves grouping quality.

## Quick test
1) Flask up: `POST /predict` with `{ "features": [1,1,1] }` → 200 with probabilities.
2) Backend up: `POST /api/group-formation/form { topic: "biology" }` → creates groups.
3) UI: StudyGroups page → topic "biology" → Load → see groups & members.

## Use case: Adaptive study groups for a topic
Rabie: A typical flow to create and maintain fair, adaptive groups for a topic (e.g., Biology):
- A student uploads Biology notes; a summary is generated with keywords (e.g., biology, cell, genetics). The aggregator detects interests from those keywords.
- The student takes a Biology quiz; the quiz score updates the per-topic skill signal.
- The backend aggregates signals (academics, availability, interests) into a 3D feature vector and calls the Flask model for a compatibility score.
- The group formation service forms or refreshes Biology groups, interleaving high/low skill and assigning a mentor.
- Periodically (or after exams), a refresh re-evaluates groups to keep them balanced and relevant as students improve.

## How to test the full model (local)
Rabie: Below is a practical end‑to‑end test using your existing scripts and endpoints. Use Windows PowerShell.

1) Start the ML service (Flask)
  - From folder: `studyspark-backend/src/StudyGroupAi`
  - Ensure artifacts exist in `exported_models/` (`final_clusters_GMM_k2_reg1e-1.pkl`, `scaler.pkl`).
  - Run the server and check health returns `{ model_loaded: true, scaler_loaded: true }`.
  - Minimal probe (PowerShell):
    - POST http://127.0.0.1:5000/predict with body `{ "features": [1,1,1] }`

2) Start the backend (Node/Express)
  - From folder: `studyspark-backend`
  - Ensure `.env` has `PORT=5002` and `ML_SERVICE_URL=http://127.0.0.1:5000`.
  - Run: `npm run dev` and verify http://localhost:5002/ returns "StudySpark Backend Running...".

3) Seed minimal Biology signals (users + docs + summaries + quizzes)
  - From folder: `studyspark-backend`
  - Run: `node scripts/seed_biology_candidates.js`
  - Expected: Logs user IDs created (e.g., `[3,4,5]`).

4) Form Biology groups and list them (uses dev JWT automatically)
  - From folder: `studyspark-backend`
  - Run: `powershell -ExecutionPolicy Bypass -File .\scripts\form_groups.ps1 -BaseUrl 'http://localhost:5002' -Topic 'biology'`
  - Expected: A group is created (e.g., id: 2) and listed with 3–4 members.

5) Exercise the recommendation proxy
  - Issue a dev token: `POST /api/dev/issue-token { userId: 2 }`.
  - Call: `POST /api/recommendation-groups { item: 'topic:biology' }` with `Authorization: Bearer <token>`.
  - Expected: `{ recommendations: [...], top: { score, groupId? }, debug: ... }`.

6) Verify in the UI (Angular)
  - From folder: `studyspark-frontend`
  - Run: `npm start` → open http://localhost:4200
  - Log in; go to "StudyGroup AI Recommendations"; set topic to "biology" and click "Load".
  - Expected: See the Biology group with members; you can also click "Form" or "Refresh".

Troubleshooting tips
- If formation says `not-enough-candidates`, run the seed again or reduce constraints (e.g., smaller group size/min members via the UI/Form call).
- If `/health` shows `dev_mode: true`, the Flask service is running without artifacts; the heuristic fallback will work but real probabilities require loading the exported model/scaler.
- Ensure you’re logged in when calling protected endpoints from the UI (they require a JWT in the `Authorization` header).
