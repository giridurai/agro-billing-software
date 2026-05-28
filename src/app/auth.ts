// src/app/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedIn = false;

  private email = 'crm@crm.com';
  private password = 'crm123';

  login(email: string, password: string): boolean {
    if (email === this.email && password === this.password) {
      this.isLoggedIn = true;
      return true;
    }
    return false;
  }

  logout(): void {
    this.isLoggedIn = false;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}
