import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    // Check if route requires specific role
    const expectedRole = route.data?.['role'];

    if (expectedRole && authService.getRole() !== expectedRole) {
        // Redirect to access denied page
        console.log('RoleGuard: Access Denied. Expected:', expectedRole, 'Got:', authService.getRole());
        return router.createUrlTree(['/access-denied']);
    }

    return true;
};
