import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** ✅ Get all users (Admin only) */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Update a user's role (Admin) */
  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/role`, { role }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /** ✅ Get a specific user */
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
