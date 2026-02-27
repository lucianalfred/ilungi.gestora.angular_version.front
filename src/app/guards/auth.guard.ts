import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const isAuthenticated = authService.isAuthenticated();
  const isLoading = authService.isLoading();
  
  if (isLoading) {
    return true;
  }
  
  if (isAuthenticated) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};