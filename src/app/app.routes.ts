// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './gaurds/auth.guard';
import { loginGuard } from './gaurds/login.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing-page/landing-page.component')
      .then(m => m.LandingPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [loginGuard] 
  },
  {
    path: 'set-password',
    loadComponent: () => import('./components/auth/set-password/set-password.component')
      .then(m => m.SetPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/auth/password-reset/password-reset.component')
      .then(m => m.PasswordResetComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./components/pages/app-page/app-page.component')
      .then(m => m.AppPageComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];