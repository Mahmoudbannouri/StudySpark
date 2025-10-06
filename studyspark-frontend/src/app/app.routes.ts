import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard/student-dashboard.component';
import { UploadComponent } from './pages/student/upload/upload.component';
import { ChatbotComponent } from './pages/student/chatbot/chatbot.component';
import { AuthGuard } from './guards/auth.guard';
import { LogoutComponent } from './pages/auth/logout/logout.component';
import { SessionPageComponent } from './pages/session/session-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },

  // Student routes
  { path: 'student', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'student/upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'student/chatbot', component: ChatbotComponent, canActivate: [AuthGuard] },
  { path: 'student/documents', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create documents page
  { path: 'student/summarizer', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create summarizer page
  { path: 'student/flashcards', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create flashcards page
  { path: 'student/quiz', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create quiz page
  { path: 'student/study-plan', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create study plan page
  { path: 'student/mind-map', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create mind map page
  { path: 'student/tutor', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create AI tutor page
  { path: 'student/transcribe', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create transcribe page
  { path: 'student/visualize', redirectTo: 'student', pathMatch: 'full' }, // TODO: Create visualize page

  // Session route
  { path: 'session', component: SessionPageComponent, canActivate: [AuthGuard] },
];
