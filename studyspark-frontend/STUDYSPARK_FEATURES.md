# StudySpark - AI-Powered Learning Platform

## 🎯 Project Overview

StudySpark is a comprehensive AI-powered learning assistant designed to help students study more effectively from their own materials. The platform allows users to upload study documents (PDFs, text files, audio, and video) and use various AI tools to interact with the content.

## ✨ Features Implemented

### 1. **Authentication System** ✅
- User registration and login
- JWT-based authentication
- Role-based access control (Admin/Student)
- Beautiful animated login/register pages
- Logout functionality with smooth transitions

### 2. **Sidebar Navigation** ✅
- Fixed collapsible sidebar with all AI tools
- Responsive design (mobile-friendly)
- Active route highlighting
- Quick access to all features
- Logout button in sidebar footer

### 3. **Student Dashboard** ✅
- Welcome header with user info
- Quota card showing usage limits
- Quick stats (Documents, Flashcards, Quizzes, Study Plans)
- Interactive tool cards with hover effects
- Direct navigation to each AI tool

### 4. **Document Upload** ✅
- Drag & drop interface
- File type validation (PDF, TXT, MP3, WAV, MP4)
- File size validation (50MB limit)
- Upload progress indicator
- Beautiful preview of selected files
- Tips section for best practices

### 5. **Q&A Chatbot** ✅
- Document selection interface
- Real-time chat with AI
- Message history
- Typing indicators
- Timestamp for each message
- Smooth animations
- Ready for RAG model integration

### 6. **Admin Dashboard** ✅
- User management table
- Role assignment
- Quota management
- Clean and professional UI
- Logout functionality

## 🛠️ AI Tools Structure

The following AI tools are structured and ready for backend integration:

### Core Tools:
1. **📄 Summarizer** - Generate summaries (short, medium, detailed)
2. **🧠 Flashcards** - Create interactive flashcards
3. **❓ Quiz Generator** - Auto-generate multiple-choice quizzes
4. **💬 Q&A Chatbot** - Ask questions about documents (RAG-powered)
5. **📅 Study Plan** - Personalized study schedules
6. **🗺️ Mind Map** - Hierarchical topic visualization
7. **👨‍🏫 AI Tutor** - Four guided learning modes:
   - Simplify Concept
   - Socratic Discussion
   - Connect Concepts
   - Teach-Back Challenge
8. **🎥 Transcribe Media** - Convert audio/video to text
9. **🎨 Visualize Concepts** - Generate diagrams and illustrations

## 📁 Project Structure

```
src/app/
├── components/
│   └── sidebar/              # Reusable sidebar navigation
├── pages/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── admin/
│   │   └── admin-dashboard/
│   └── student/
│       ├── student-dashboard/
│       ├── upload/
│       ├── chatbot/
│       └── [other AI tools]    # TODO: Implement remaining tools
├── services/
│   ├── auth.service.ts        # Authentication
│   ├── user.service.ts        # User management
│   ├── quota.service.ts       # Quota management
│   └── document.service.ts    # Document & AI operations
└── guards/
    └── auth.guard.ts          # Route protection
```

## 🎨 Design Features

### Visual Enhancements:
- Modern gradient backgrounds
- Smooth animations with GSAP
- Hover effects on cards
- Responsive design for all screen sizes
- Custom scrollbar styling
- Bootstrap Icons integration
- Professional color scheme:
  - Primary: Blue gradient (#3b82f6 → #2563eb)
  - Admin: Red gradient (#dc2626 → #ef4444)
  - Background: #f8f9fc

### UI Components:
- Animated tool cards
- Interactive sidebar
- Progress indicators
- Toast notifications
- Loading states
- Empty states
- Error handling

## 🔌 Backend Integration Ready

### Document Service Methods:
```typescript
// File operations
uploadDocument(file: File)
getUserDocuments()
getDocumentById(id)
deleteDocument(id)

// AI features
generateSummary(documentId, length)
generateFlashcards(documentId, count)
generateQuiz(documentId, count)
askQuestion(documentId, question, useWebSearch)
generateStudyPlan(documentId, examDate)
generateMindMap(documentId)
transcribeMedia(documentId)
aiTutorInteraction(documentId, mode, input)
visualizeConcept(documentId, concept)
```

### API Endpoints Expected:
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/my-documents` - Get user documents
- `POST /api/documents/:id/summarize` - Generate summary
- `POST /api/documents/:id/flashcards` - Generate flashcards
- `POST /api/documents/:id/quiz` - Generate quiz
- `POST /api/documents/:id/ask` - RAG chatbot
- `POST /api/documents/:id/study-plan` - Create study plan
- `POST /api/documents/:id/mind-map` - Generate mind map
- `POST /api/documents/:id/transcribe` - Transcribe media
- `POST /api/documents/:id/tutor` - AI tutor interaction
- `POST /api/documents/:id/visualize` - Visualize concept

## 🚀 Next Steps

### Immediate TODOs:
1. **Connect Upload Component** to backend API
2. **Connect Chatbot** to your RAG model
3. **Create remaining AI tool pages:**
   - Summarizer page
   - Flashcards page
   - Quiz page
   - Study Plan page
   - Mind Map page
   - AI Tutor page
   - Transcribe page
   - Visualize page
   - Documents list page

4. **Backend Integration:**
   - Ensure backend endpoints match service methods
   - Test file upload functionality
   - Verify RAG model integration
   - Test all AI features

5. **Additional Features:**
   - Document list/management page
   - Search functionality
   - Favorites/bookmarks
   - Recent documents
   - Collaboration features (groups)
   - Progress tracking

## 💻 Running the Project

```bash
# Install dependencies
npm install

# Run development server
ng serve

# Build for production
ng build
```

The backend should be running on `http://localhost:5000`

## 🔑 Key Technologies

- **Frontend**: Angular 18+ (Standalone components)
- **Styling**: SCSS + Bootstrap 5
- **Icons**: Bootstrap Icons
- **Animations**: GSAP
- **HTTP**: HttpClient with JWT
- **Routing**: Angular Router with Guards
- **State**: RxJS Observables

## 📝 Notes for Team

### For Mahmoud (Chatbot QA):
- Chatbot component is ready at `/student/chatbot`
- Connect `askQuestion()` method in DocumentService to your RAG model
- Message format is flexible, adjust as needed

### For Hadil (Transcription):
- Upload component supports audio/video files
- `transcribeMedia()` method ready in DocumentService
- Consider adding progress for long transcriptions

### For Imen (Summarization):
- Create summarizer page similar to chatbot
- Three length options: short, medium, detailed
- Use `generateSummary()` from DocumentService

### For Selim (Study Plans):
- Study plan page needs date picker
- `generateStudyPlan()` expects exam date
- Display as calendar or timeline

### For Rihem (Quizzes):
- Quiz page needs question display + answer selection
- `generateQuiz()` returns questions array
- Add score tracking and feedback

### For Rabie (Collaboration):
- Group features can be added to sidebar
- Consider shared documents feature
- Study group recommendations

## 🎉 Current Status

✅ **Complete:**
- Authentication system
- Dashboard layouts
- Sidebar navigation
- Upload component
- Chatbot interface
- Admin panel
- Document service
- Routing structure
- Visual design system

🔨 **In Progress:**
- Backend API integration
- Individual AI tool pages

📋 **Pending:**
- Document management page
- Remaining AI tool pages
- Real-time features
- Collaboration features
- Analytics dashboard

---

**Last Updated:** October 2025
**Version:** 1.0.0 MVP
