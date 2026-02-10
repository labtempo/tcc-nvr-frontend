import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard checking. LoggedIn:', authService.isLoggedIn(), 'Token:', authService.getToken());
  if (authService.isLoggedIn()) {
    return true;
  } else {
    console.log('AuthGuard blocking access. Redirecting to login.');
    router.navigate(['/login']);
    return false;
  }
};
