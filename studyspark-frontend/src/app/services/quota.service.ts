import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class QuotaService {
  private apiUrl = 'http://localhost:5000/api/quotas';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** ✅ Get the logged-in user’s quota */
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
}
