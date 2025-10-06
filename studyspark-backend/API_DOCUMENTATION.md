# StudySpark Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/users/login` and `/users/register` require JWT authentication.

**Header**: `Authorization: Bearer <token>`

---

## 📁 Documents API

### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data

Body:
- file: File (PDF, TXT, MP3, WAV, MP4 - Max 50MB)

Response:
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 1,
    "name": "document.pdf",
    "fileType": "application/pdf",
    "wordCount": 1000,
    "uploadedAt": "2025-10-06T..."
  }
}
```

### Get All Documents
```http
GET /documents

Response:
[
  {
    "id": 1,
    "name": "document.pdf",
    "fileType": "application/pdf",
    "wordCount": 1000,
    "status": "ready",
    "uploadedAt": "2025-10-06T..."
  }
]
```

### Get Single Document
```http
GET /documents/:id
```

### Delete Document
```http
DELETE /documents/:id
```

---

## 📝 Summaries API (Imen's Module)

### Generate Summary
```http
POST /summaries/generate

Body:
{
  "documentId": 1,
  "length": "short" | "medium" | "detailed"
}

Response:
{
  "message": "Summary generated successfully",
  "summary": {
    "id": 1,
    "length": "short",
    "content": "Summary text...",
    "keyPoints": ["point 1", "point 2"],
    "generatedAt": "2025-10-06T..."
  }
}
```

### Get Document Summaries
```http
GET /summaries/document/:documentId
```

### Get Single Summary
```http
GET /summaries/:id
```

### Delete Summary
```http
DELETE /summaries/:id
```

---

## 🗂️ Flashcards API (Imen's Module)

### Generate Flashcards
```http
POST /flashcards/generate

Body:
{
  "documentId": 1,
  "count": 10
}

Response:
{
  "message": "Flashcards generated successfully",
  "flashcard": {
    "id": 1,
    "setName": "Document Flashcards",
    "cards": [
      {
        "question": "What is...?",
        "answer": "It is...",
        "difficulty": "medium"
      }
    ],
    "totalCards": 10
  }
}
```

### Get Document Flashcards
```http
GET /flashcards/document/:documentId
```

### Get Single Flashcard Set
```http
GET /flashcards/:id
```

### Delete Flashcard Set
```http
DELETE /flashcards/:id
```

---

## ❓ Quizzes API (Rihem's Module)

### Generate Quiz
```http
POST /quizzes/generate

Body:
{
  "documentId": 1,
  "count": 10
}

Response:
{
  "message": "Quiz generated successfully",
  "quiz": {
    "id": 1,
    "title": "Document Quiz",
    "questions": [
      {
        "question": "What is...?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 2,
        "explanation": "Because..."
      }
    ],
    "totalQuestions": 10
  }
}
```

### Submit Quiz
```http
POST /quizzes/submit

Body:
{
  "quizId": 1,
  "answers": [0, 2, 1, 3, ...] // Array of selected option indices
}

Response:
{
  "message": "Quiz submitted successfully",
  "score": 80,
  "correctCount": 8,
  "totalQuestions": 10
}
```

### Get Document Quizzes
```http
GET /quizzes/document/:documentId
```

### Get Single Quiz
```http
GET /quizzes/:id
```

### Delete Quiz
```http
DELETE /quizzes/:id
```

---

## 💬 Chat API (Mahmoud's RAG Module)

### Ask Question
```http
POST /chat/ask

Body:
{
  "documentId": 1, // optional, null for general chat
  "question": "What is the main topic?",
  "useWebSearch": false // optional
}

Response:
{
  "message": "Question answered successfully",
  "chat": {
    "id": 1,
    "question": "What is the main topic?",
    "answer": "The main topic is...",
    "sources": null, // or array of web sources if useWebSearch=true
    "confidence": 0.85,
    "createdAt": "2025-10-06T..."
  }
}
```

### Get Document Chat History
```http
GET /chat/document/:documentId
```

### Get All User Chats
```http
GET /chat/all
```

### Delete Chat Message
```http
DELETE /chat/:id
```

---

## 📅 Study Plans API (Selim's Module)

TODO: Implement study plan generation and management

```http
POST /study-plans/generate
GET /study-plans/document/:documentId
PUT /study-plans/:id/update-progress
DELETE /study-plans/:id
```

---

## 🗺️ Mind Maps API

TODO: Implement mind map generation

```http
POST /mind-maps/generate
GET /mind-maps/document/:documentId
DELETE /mind-maps/:id
```

---

## 👥 Users API

### Register
```http
POST /users/register

Body:
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```http
POST /users/login

Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## 🎯 Quotas API

### Get My Quota
```http
GET /quotas/my-quota
```

### Update Quota (Admin only)
```http
PUT /quotas/:userId

Body:
{
  "summaries": 50,
  "flashcards": 100,
  "quizzes": 30
}
```

---

## ⚠️ Error Responses

All endpoints may return:

```json
{
  "message": "Error message"
}
```

Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

---

## 🔌 Integration Points for AI Models

### Imen (Summaries & Flashcards):
- `summaryController.js:16` - Replace mock with real AI model
- `flashcardController.js:16` - Replace mock with real AI model

### Rihem (Quiz Generation):
- `quizController.js:16` - Replace mock with real AI model

### Mahmoud (RAG Chatbot):
- `chatController.js:18` - Replace mock with real RAG model

### Hadil (Transcription):
- Create `transcriptionController.js`
- Add route for audio/video transcription

### Selim (Study Plans):
- Create `studyPlanController.js`
- Implement study plan optimization algorithm

### Rabie (Collaboration):
- Create `groupController.js`
- Implement group suggestions based on user activity

---

## 🚀 Running the Backend

```bash
cd studyspark-backend
npm install
npm run dev
```

Backend will run on `http://localhost:5000`
