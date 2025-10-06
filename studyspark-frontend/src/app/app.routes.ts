import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard/student-dashboard.component';
import { UploadComponent } from './pages/student/upload/upload.component';
import { ChatbotComponent } from './pages/student/chatbot/chatbot.component';
import { SummarizerComponent } from './pages/student/summarizer/summarizer.component';
import { AuthGuard } from './guards/auth.guard';
import { LogoutComponent } from './pages/auth/logout/logout.component';
import { SessionPageComponent } from './pages/session/session-page.component';
import { SubscriptionComponent } from './pages/student/subscription/subscription.component';
import { StudyPlanComponent } from './pages/student/study-plan/study-plan.component';
import { TranscribeComponent } from './pages/student/transcribe/transcribe.component';
import { FlashcardsComponent } from './pages/student/flashcards/flashcards.component';
import { QuizComponent } from './pages/student/quiz/quiz.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },

  // Student routes
  { path: 'student', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'student/dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'student/subscription', component: SubscriptionComponent, canActivate: [AuthGuard] },
  { path: 'student/upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'student/chatbot', component: ChatbotComponent, canActivate: [AuthGuard] },
  { path: 'student/summarizer', component: SummarizerComponent, canActivate: [AuthGuard] },
  { path: 'student/documents', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create documents page
  { path: 'student/flashcards', component: FlashcardsComponent, canActivate: [AuthGuard] },
  { path: 'student/quiz', component: QuizComponent, canActivate: [AuthGuard] },
  { path: 'student/study-plan', component: StudyPlanComponent, canActivate: [AuthGuard] },
  { path: 'student/mind-map', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create mind map page
  { path: 'student/transcribe', component: TranscribeComponent, canActivate: [AuthGuard] },
  { path: 'student/visualize', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create visualize page

  // Session route
  { path: 'session', component: SessionPageComponent, canActivate: [AuthGuard] },
];
