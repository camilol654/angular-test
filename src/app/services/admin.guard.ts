import { CanMatchFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const adminOnlyGuard: CanMatchFn = () => {
  return inject(AuthService).isAdmin(); // true permite cargar el chunk; false lo bloquea
};