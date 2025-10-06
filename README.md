# 📚 StudySpark - AI-Powered Learning Platform

> Transform your study materials into powerful learning tools with AI assistance

StudySpark is a comprehensive educational platform that leverages artificial intelligence to help students learn more effectively. Upload your documents, lectures, or course materials, and let our AI tools create summaries, flashcards, quizzes, study plans, and more.

---

## 🌟 Features

### 🔐 Authentication & Authorization
- **Secure JWT Authentication** - Token-based authentication with role-based access control
- **User Roles** - Admin and Student role management
- **Session Management** - Persistent user sessions with automatic token refresh

### 📄 Document Management
- **Multi-Format Upload** - Support for PDF, TXT, audio (MP3, WAV), and video (MP4) files
- **Drag & Drop Interface** - Easy file uploads with visual feedback
- **Document Library** - Organized storage with search and filtering capabilities
- **Word Count Analysis** - Automatic document analysis and metadata extraction

### 🤖 AI-Powered Study Tools

#### 📝 Document Summarizer
- Generate summaries in three levels: Short, Medium, and Detailed
- Extract key points automatically
- Save and manage multiple summaries per document

#### 🗂️ Flashcard Generator
- Automatically create question-answer flashcards from your documents
- Interactive flip animation for studying
- Export and share flashcard sets

#### ❓ Quiz Generator
- Generate multiple-choice quizzes based on your content
- Automatic grading and scoring
- Review correct answers after completion

#### 💬 Intelligent Study Chatbot (RAG)
- Ask questions about your uploaded documents
- Powered by Retrieval-Augmented Generation (RAG)
- Context-aware responses with web search integration
- Focus on specific documents or query across all materials

#### 📅 Study Plan Creator
- Personalized study schedules based on your materials
- Milestone tracking and progress monitoring
- Adaptive planning based on your learning pace

#### 🗺️ Mind Map Generator
- Visual concept mapping from document content
- Hierarchical organization of topics
- Interactive and exportable diagrams

#### 🎥 Media Transcription
- Convert audio/video lectures to text
- Automatic formatting and structuring
- Searchable transcripts

#### 🎨 Concept Visualizer
- Generate images and diagrams for complex topics
- Visual learning aids for better comprehension

### 💳 Subscription Management

#### Three Tier System
1. **Free Tier** - $0/forever
   - 10 Summaries
   - 20 Flashcards
   - 5 Quizzes
   - 50 Chat Messages
   - 2 Study Plans
   - 5 Max Uploads

2. **Pro Tier** - $9.99/week
   - 100 Summaries
   - 200 Flashcards
   - 50 Quizzes
   - 500 Chat Messages
   - 20 Study Plans
   - 50 Max Uploads

3. **VIP Tier** - $29.99/week
   - 1000 Summaries
   - 2000 Flashcards
   - 500 Quizzes
   - 10,000 Chat Messages
   - 100 Study Plans
   - 500 Max Uploads

### 📊 Quota System
- Real-time quota tracking for all AI features
- Visual quota cards on dashboard
- Low quota warnings (< 5 remaining)
- Quota exhaustion prevention with upgrade prompts
- Automatic quota reset based on subscription cycle

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 18+ (Standalone Components)
- **Language**: TypeScript
- **Styling**: SCSS with custom design system
- **Animations**: GSAP (GreenSock)
- **UI Components**: Bootstrap Icons
- **HTTP Client**: Angular HttpClient with RxJS Observables
- **Alerts**: SweetAlert2

### Backend
- **Runtime**: Node.js (v20.17.0+)
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcryptjs
- **Environment Management**: dotenv
- **CORS**: cors middleware

### Database Schema
- **Users**: Authentication and profile management
- **Quotas**: Usage tracking and limits
- **Subscriptions**: Tier management and billing
- **Documents**: File storage and metadata
- **Summaries**: Generated summaries storage
- **Flashcards**: Flashcard sets and cards
- **Quizzes**: Quiz questions and answers
- **ChatMessages**: Conversation history
- **StudyPlans**: Personalized study schedules
- **MindMaps**: Visual concept maps

---

## 📁 Project Structure

```
StudySpark/
├── studyspark-frontend/          # Angular Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── sidebar/      # Navigation sidebar
│   │   │   │   └── quota-card/   # Quota display cards
│   │   │   ├── pages/            # Route components
│   │   │   │   ├── auth/         # Login, Register, Logout
│   │   │   │   ├── admin/        # Admin dashboard
│   │   │   │   └── student/      # Student features
│   │   │   │       ├── student-dashboard/
│   │   │   │       ├── subscription/
│   │   │   │       ├── upload/
│   │   │   │       ├── summarizer/
│   │   │   │       ├── chatbot/
│   │   │   │       ├── flashcards/
│   │   │   │       ├── quiz/
│   │   │   │       ├── study-plan/
│   │   │   │       ├── mind-map/
│   │   │   │       ├── transcribe/
│   │   │   │       └── visualize/
│   │   │   ├── services/         # API services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── quota.service.ts
│   │   │   │   ├── subscription.service.ts
│   │   │   │   ├── document.service.ts
│   │   │   │   ├── summary.service.ts
│   │   │   │   ├── session.service.ts
│   │   │   │   └── user.service.ts
│   │   │   ├── guards/           # Route guards
│   │   │   │   └── auth.guard.ts
│   │   │   ├── modules/          # TypeScript interfaces
│   │   │   └── app.routes.ts     # Route configuration
│   │   └── styles.scss           # Global styles
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── studyspark-backend/           # Express Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # Database connection
│   │   ├── models/               # Sequelize models
│   │   │   ├── userModel.js
│   │   │   ├── Quota.js
│   │   │   ├── Document.js
│   │   │   ├── Summary.js
│   │   │   ├── Flashcard.js
│   │   │   ├── Quiz.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── StudyPlan.js
│   │   │   └── MindMap.js
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── quotaController.js
│   │   │   ├── subscriptionController.js
│   │   │   ├── documentController.js
│   │   │   ├── summaryController.js
│   │   │   ├── flashcardController.js
│   │   │   ├── quizController.js
│   │   │   ├── chatController.js
│   │   │   ├── studyPlanController.js
│   │   │   └── mindMapController.js
│   │   ├── routes/               # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── quotaRoutes.js
│   │   │   ├── subscriptionRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── summaryRoutes.js
│   │   │   ├── flashcardRoutes.js
│   │   │   ├── quizRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── studyPlanRoutes.js
│   │   │   └── mindMapRoutes.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js # JWT verification
│   │   └── server.js             # App entry point
│   ├── package.json
│   └── .env                      # Environment variables
│
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.17.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL**: v8.0 or higher
- **Git**: Latest version

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/StudySpark.git
cd StudySpark
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd studyspark-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables
nano .env
```

**Environment Variables (.env):**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=studyspark
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Create MySQL Database:**
```sql
CREATE DATABASE studyspark;
USE studyspark;
```

```bash
# Start the backend server
npm start

# For development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd studyspark-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will run on `http://localhost:4200`

### First Time Setup

1. The database tables will be created automatically on first run (Sequelize sync)
2. Navigate to `http://localhost:4200/register` to create your first account
3. New users start with the **Free Tier** subscription by default
4. Upload documents and start using AI tools!

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Quota Management
- `GET /api/quotas/my-quota` - Get current user's quota
- `PUT /api/quotas/decrement` - Decrement specific quota
- `POST /api/quotas/reset/:userId` - Reset user quota (Admin)

### Subscription Management
- `GET /api/subscriptions/plans` - Get all subscription plans
- `GET /api/subscriptions/my-subscription` - Get current subscription
- `POST /api/subscriptions/subscribe` - Subscribe to a plan
- `POST /api/subscriptions/cancel` - Cancel current subscription
- `POST /api/subscriptions/check-expired` - Check and update expired subscriptions

### Documents
- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents/upload` - Upload new document
- `DELETE /api/documents/:id` - Delete document

### AI Tools
- `POST /api/summaries/generate` - Generate document summary
- `GET /api/summaries/document/:docId` - Get document summaries
- `DELETE /api/summaries/:id` - Delete summary

- `POST /api/flashcards/generate` - Generate flashcards
- `GET /api/flashcards/document/:docId` - Get flashcard sets
- `DELETE /api/flashcards/:id` - Delete flashcard set

- `POST /api/quizzes/generate` - Generate quiz
- `GET /api/quizzes/document/:docId` - Get quizzes
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `DELETE /api/quizzes/:id` - Delete quiz

- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history/:docId` - Get chat history
- `DELETE /api/chat/history/:docId` - Clear chat history

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🎨 Design System

### Color Palette
- **Primary**: `#3b82f6` (Blue)
- **Secondary**: `#8b5cf6` (Purple)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Danger**: `#ef4444` (Red)
- **Dark**: `#1e293b` (Slate)
- **Light**: `#f8f9fc` (Off-white)

### Typography
- **Font Family**: System fonts (SF Pro, Segoe UI, Roboto)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Code**: Monospace font

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Inputs**: Clean borders with focus states
- **Modals**: Centered with backdrop blur

---

## 🧪 Testing

### Frontend Tests
```bash
cd studyspark-frontend
npm test
```

### Backend Tests
```bash
cd studyspark-backend
npm test
```

---

## 📦 Building for Production

### Frontend Build
```bash
cd studyspark-frontend
npm run build
```

Build artifacts will be in `dist/` directory.

### Backend Production
```bash
cd studyspark-backend
# Set NODE_ENV=production in .env
npm start
```

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configured CORS policies
- **SQL Injection Prevention** - Sequelize ORM parameterized queries
- **XSS Protection** - Angular's built-in sanitization
- **Role-Based Access** - Admin and student role separation
- **Route Guards** - Protected routes with auth guards

---

## 🐛 Known Issues & Limitations

1. **AI Models**: Currently using mock responses. Real AI integration pending.
2. **File Storage**: Files stored locally. Cloud storage (AWS S3) integration planned.
3. **Payment Gateway**: Subscription system ready, payment integration pending.
4. **Real-time Features**: WebSocket for live chat/collaboration planned.
5. **Mobile App**: Native mobile apps (iOS/Android) in roadmap.

---

## 🗺️ Roadmap

### Q1 2024
- [ ] OpenAI GPT-4 integration for all AI tools
- [ ] AWS S3 integration for document storage
- [ ] Stripe payment gateway integration
- [ ] Email notifications and verification
- [ ] Password reset functionality

### Q2 2024
- [ ] Real-time collaboration features
- [ ] Export functionality (PDF, DOCX)
- [ ] Mobile-responsive design improvements
- [ ] Advanced analytics dashboard
- [ ] Team/classroom features

### Q3 2024
- [ ] Native mobile apps (iOS/Android)
- [ ] Offline mode support
- [ ] Voice input for chat
- [ ] Multi-language support
- [ ] API for third-party integrations

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow Angular style guide for frontend
- Use ESLint configuration for backend
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- OpenAI for GPT models inspiration
- Angular team for the amazing framework
- Express.js community for backend tools
- All open-source contributors

---

## 📧 Support

For support, email support@studyspark.com or join our Slack channel.

---

## 📊 Project Status

**Current Version**: v1.0.0 (Beta)
**Status**: Active Development
**Last Updated**: October 2025

---

## 🎯 Quick Links

- [Frontend Documentation](./studyspark-frontend/README.md)
- [Backend API Documentation](./studyspark-backend/README.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Changelog](./CHANGELOG.md)

---

Made with ❤️ by the StudySpark Team
