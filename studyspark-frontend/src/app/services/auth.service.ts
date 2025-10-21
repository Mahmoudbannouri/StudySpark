import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import Swal from 'sweetalert2';
import { API_BASE } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_BASE}/users`; // ✅ centralized backend base route
  private jwtHelper = new JwtHelperService();

  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next(decoded);
    }
  }

  /** =============================
   * ✅ REGISTER NEW USER
   * ============================= */
  register(data: { fullname: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      map((res: any) => {
        Swal.fire('✅ Registered!', 'Your account has been created successfully.', 'success');
        return res;
      })
    );
  }

  /** =============================
   * ✅ LOGIN USER + SAVE TOKEN
   * ============================= */
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      map((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          const decoded = this.jwtHelper.decodeToken(res.token);
          this.currentUserSubject.next(decoded);
          Swal.fire('✅ Welcome!', `Hello ${decoded.fullname || 'User'}!`, 'success');
        }
        return res;
      })
    );
  }

  /** =============================
   * ✅ LOGOUT
   * ============================= */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    Swal.fire('👋 Logged out', 'See you soon!', 'info');
  }

  /** =============================
   * ✅ GET TOKEN FOR AUTH HEADERS
   * ============================= */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** =============================
   * ✅ GET DECODED USER INFO
   * ============================= */
  getUserInfo(): any {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }

  /** =============================
   * ✅ GET ROLE (admin/student)
   * ============================= */
  getRole(): string | null {
    const user = this.getUserInfo();
    return user ? user.role : null;
  }

  /** =============================
   * ✅ GET USER ID
   * ============================= */
  getUserId(): number | null {
    const user = this.getUserInfo();
    return user ? user.id : null;
  }

  /** =============================
   * ✅ IS LOGGED IN
   * ============================= */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  /** =============================
   * ✅ IS ADMIN
   * ============================= */
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  /** =============================
   * ✅ AUTH HEADER BUILDER
   * ============================= */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** =============================
   * ✅ OBSERVABLE USER STREAM
   * ============================= */
  get currentUser$(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  /** ✅ Get current decoded user instantly */
  get currentUser() {
    return this.currentUserSubject.value;
  }
}
