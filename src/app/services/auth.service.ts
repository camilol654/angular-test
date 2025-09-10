import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private admin = true;
  isAdmin(): boolean {
    return this.admin;
  }
}
