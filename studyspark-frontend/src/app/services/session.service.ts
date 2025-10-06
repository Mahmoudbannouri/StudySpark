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
}
