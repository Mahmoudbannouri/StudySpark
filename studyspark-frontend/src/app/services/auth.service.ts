import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/users'; // adjust to your backend route
  private currentUserSubject = new BehaviorSubject<any>(null);
  jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next(decoded);
    }
  }

  /** ✅ Register a new user */
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** ✅ Login and store token */
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      map((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          const decoded = this.jwtHelper.decodeToken(res.token);
          this.currentUserSubject.next(decoded);
        }
        return res;
      })
    );
  }

  /** ✅ Logout */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /** ✅ Get current user data */
  get currentUser() {
    return this.currentUserSubject.asObservable();
  }

  /** ✅ Get decoded user info directly */
  getUserInfo() {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }
  getRole(): string | null {
    const user = this.getUserInfo();
    return user ? user.role : null;
  }
  
  /** ✅ Check if logged in */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }
}
