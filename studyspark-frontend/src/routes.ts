import { Routes } from '@angular/router';
import { LoginComponent } from './app/pages/auth/login/login.component';
import { RegisterComponent } from './app/pages/auth/register/register.component';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { AuthGuard } from './app/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
];
