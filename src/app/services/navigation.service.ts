import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TabType, ViewType } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private viewSignal = signal<ViewType>('landing');
  private activeTabSignal = signal<TabType>('dashboard');
  
  // ✅ Signals públicos (readonly)
  public view = this.viewSignal.asReadonly();
  public activeTab = this.activeTabSignal.asReadonly();

  constructor(private router: Router) {}

  setView(view: ViewType): void {
    this.viewSignal.set(view);
    
    switch (view) {
      case 'landing':
        this.router.navigate(['/']);
        break;
      case 'login':
        this.router.navigate(['/login']);
        break;
      case 'app':
        this.router.navigate(['/app']);
        break;
      case 'set-password':
        this.router.navigate(['/set-password']);
        break;
      case 'reset-password':
        this.router.navigate(['/reset-password']);
        break;
    }
  }

  setActiveTab(tab: TabType): void {
    this.activeTabSignal.set(tab);
  }

  goToDashboard(): void {
    this.setActiveTab('dashboard');
    this.setView('app');
  }

  goToTasks(): void {
    this.setActiveTab('tasks');
    this.setView('app');
  }

  goToUsers(): void {
    this.setActiveTab('users');
    this.setView('app');
  }

  goToProfile(): void {
    this.setActiveTab('profile');
    this.setView('app');
  }

  goToReports(): void {
    this.setActiveTab('reports');
    this.setView('app');
  }

  goToLogin(): void {
    this.setView('login');
  }

  goToLanding(): void {
    this.setView('landing');
  }
}