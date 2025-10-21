import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE } from '../api.config';

@Injectable({ providedIn: 'root' })
export class QuotaService {
  private apiUrl = `${API_BASE}/quotas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** ✅ Get the logged-in user's quota */
  getMyQuota(): Observable<any> {
    const userId = this.auth.getUserId();
    return this.http.get(`${this.apiUrl}/${userId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Admin: Get all quotas */
  getAllQuotas(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Update a user's quota */
  updateQuota(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Admin: Get complete quota details with subscription info */
  getAdminQuotaDetails(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/details/${userId}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Admin: Apply subscription plan to user with optional custom quotas */
  applySubscriptionPlan(userId: number, data: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    customQuotas?: {
      maxUploads?: number;
      summaries?: number;
      flashcards?: number;
      quizzes?: number;
      chats?: number;
      studyPlans?: number;
    };
    resetUsage?: boolean;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/apply-plan/${userId}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Admin: Fully customize all quota attributes for a user */
  customizeUserQuota(userId: number, data: {
    maxUploads?: number;
    summaries?: number;
    flashcards?: number;
    quizzes?: number;
    chats?: number;
    studyPlans?: number;
    usedUploads?: number;
    usedSummaries?: number;
    usedFlashcards?: number;
    usedQuizzes?: number;
    usedChats?: number;
    usedStudyPlans?: number;
    resetDate?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/customize/${userId}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Admin: Reset user quota usage */
  resetUserQuota(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}/reset`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Admin: Get quota statistics */
  getQuotaStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
