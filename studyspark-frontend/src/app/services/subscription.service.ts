import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = 'http://localhost:5000/api/subscriptions';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Get available subscription plans
   */
  getPlans(): Observable<any> {
    return this.http.get(`${this.apiUrl}/plans`);
  }

  /**
   * Get user's current subscription
   */
  getMySubscription(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-subscription`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * Subscribe to a plan
   */
  subscribe(tier: 'free' | 'pro' | 'vip'): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/subscribe`,
      { tier },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cancel`,
      {},
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
