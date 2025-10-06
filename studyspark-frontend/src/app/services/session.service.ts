import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })
export class SessionService {
  jwtHelper = new JwtHelperService();

  constructor(private auth: AuthService) {}

  /** ✅ Get decoded token info */
  getSessionDetails() {
    const token = this.auth.getToken();
    if (!token) return null;

    const decoded = this.jwtHelper.decodeToken(token);
    const expiry = this.jwtHelper.getTokenExpirationDate(token);
    const isExpired = this.jwtHelper.isTokenExpired(token);

    console.log('🔐 JWT Token:', token);
    console.log('🧩 Decoded Token:', decoded);
    console.log('⏰ Expiration:', expiry);
    console.log('✅ Is Valid:', !isExpired);

    return {
      token,
      decoded,
      expiry,
      isExpired
    };
  }

  /** ✅ Helper getters */
  get userId() {
    return this.auth.getUserId();
  }

  get role() {
    return this.auth.getRole();
  }

  get fullname() {
    return this.auth.getUserInfo()?.fullname;
  }

  get email() {
    return this.auth.getUserInfo()?.email;
  }

  get userInfo() {
    return this.auth.getUserInfo();
  }

  /** ✅ Get selected document from session storage */
  getSelectedDocument() {
    return {
      id: sessionStorage.getItem('selectedDocumentId'),
      name: sessionStorage.getItem('selectedDocumentName')
    };
  }

  /** ✅ Store user info in session storage for easy access across components */
  storeUserSession() {
    const user = this.userInfo;
    if (user) {
      sessionStorage.setItem('userId', user.id?.toString() || '');
      sessionStorage.setItem('userFullname', user.fullname || '');
      sessionStorage.setItem('userEmail', user.email || '');
      sessionStorage.setItem('userRole', user.role || '');
    }
  }

  /** ✅ Clear session storage */
  clearSession() {
    sessionStorage.clear();
  }
}
