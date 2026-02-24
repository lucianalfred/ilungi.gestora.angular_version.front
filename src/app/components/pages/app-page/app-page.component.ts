import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { IconComponent } from '../../shared/icon/icon.component';
import { SidebarNavItemComponent } from '../../shared/sidebar-nav-item/sidebar-nav-item.component';

import { TasksViewComponent } from '../../tasks/tasks-view/tasks-view.component';
import { UsersViewComponent } from '../../users/users-view/users-view.component';
import { DashboardViewComponent } from '../../dashboard/dashboard-view/dashboard-view.component';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { ReportsViewComponent } from '../../dashboard/reports-view/reports-view.component';

import { AuthService } from '../../../services/auth.service';
import { TasksService } from '../../../services/tasks.service';
import { UsersService } from '../../../services/users.service';
import { NotificationsService } from '../../../services/notifications.service';
import { ActivitiesService } from '../../../services/activities.service';
import { NavigationService } from '../../../services/navigation.service';
import { LanguageService } from '../../../services/language.service';
import { ThemeService } from '../../../services/theme.service';

import {
  User,
  UserRole,
  TaskStatus,
  TabType,
  Notification
} from '../../../models/types';

import { Translations } from '../../../constants/index';

@Component({
  selector: 'app-app-page',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    SidebarNavItemComponent,
    TasksViewComponent,
    UsersViewComponent,
    DashboardViewComponent,
    ProfileViewComponent,
    ReportsViewComponent
  ],
  templateUrl: './app-page.component.html',
  styleUrls: ['./app-page.component.css']
})
export class AppPageComponent implements OnInit, OnDestroy {

  readonly TaskStatus = TaskStatus;
  readonly UserRole = UserRole;

  // ================================
  // Signals (estado local)
  // ================================
  isNotificationsOpen = signal(false);
  uploadingAvatarFor = signal<string | null>(null);

  profilePassword = signal('');
  profilePasswordConfirm = signal('');
  profilePasswordError = signal<string | null>(null);
  profilePasswordSuccess = signal<string | null>(null);

  searchQuery = signal('');
  statusFilter = signal<string>('all');

  // Signal do NavigationService
  activeTab = this.navigationService.activeTab;

  constructor(
    public authService: AuthService,
    public tasksService: TasksService,
    public usersService: UsersService,
    public notificationsService: NotificationsService,
    public activitiesService: ActivitiesService,
    public navigationService: NavigationService,
    public languageService: LanguageService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  // ================================
  // Lifecycle
  // ================================
  ngOnInit(): void {
    if (this.user) {
      this.loadUserData();
    }
  }

  ngOnDestroy(): void {
    // cleanup futuro se necessário
  }

  // ================================
  // Getters
  // ================================

  get user(): User | null {
    return this.authService.user();
  }

  get tasks() {
    return this.tasksService.tasks();
  }

  get filteredTasks() {
    return this.tasksService.filteredTasks();
  }

  get users() {
    return this.usersService.users();
  }

  // ⚠️ Getter — NÃO é função
  get notifications(): Notification[] {
    return this.notificationsService.notifications();
  }

  get t(): Translations {
    return this.languageService.translations();
  }

  get theme(): string {
    return this.themeService.theme();
  }

  get stats() {
    const tasks = this.tasks;

    return {
      active: tasks.filter(t => t.status !== TaskStatus.FECHADO).length,
      overdue: tasks.filter(t => t.status === TaskStatus.ATRASADA).length,
      completed: tasks.filter(t => t.status === TaskStatus.FECHADO).length
    };
  }

  get pageTitle(): string {
    const tab = this.activeTab();

    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Tasks';
      case 'users': return 'Users';
      case 'profile': return 'Profile';
      case 'reports': return 'Reports';
      default: return tab;
    }
  }

  // ================================
  // Avatar
  // ================================

  getAvatarUrl(user: User): string | null {
    return this.usersService.getAvatarUrl(user);
  }

  handleAvatarUpload(userId: string): void {
    this.uploadingAvatarFor.set(userId);

    setTimeout(() => {
      const input = document.getElementById('avatarInput') as HTMLInputElement;
      input?.click();
    });
  }

  handleAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && this.uploadingAvatarFor()) {
      const reader = new FileReader();

      reader.onload = () => {
        this.usersService.saveAvatar(
          this.uploadingAvatarFor()!,
          reader.result as string
        );
        this.uploadingAvatarFor.set(null);
      };

      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  // ================================
  // Dados
  // ================================

  loadUserData(): void {
    this.tasksService.loadTasks();

    if (this.user?.role === UserRole.ADMIN) {
      this.usersService.loadUsers();
    }
  }

  setActiveTabSafe(tab: TabType): void {
    if (this.user?.mustChangePassword && tab !== 'profile') {
      this.navigationService.setActiveTab('profile');
      return;
    }

    this.navigationService.setActiveTab(tab);
  }

  // ================================
  // Filtros
  // ================================

  handleSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.tasksService.filterTasks({
      search: query,
      status: this.statusFilter()
    });
  }

  handleStatusFilterChange(status: string): void {
    this.statusFilter.set(status);

    this.tasksService.filterTasks({
      search: this.searchQuery(),
      status
    });
  }

  // ================================
  // Notificações
  // ================================

  markAllNotificationsAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  markNotificationAsRead(id: string): void {
    this.notificationsService.markAsRead(id);
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(
      (n: Notification) => !n.read
    );
  }

  addNotification(
    userId: string,
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ): void {
    this.notificationsService.addNotification(
      userId,
      message,
      type
    );
  }

  // ================================
  // Tasks
  // ================================

  handleAdvanceStatus(task: any): void {
    this.tasksService.advanceStatus(task);
  }

  handleRegressStatus(task: any): void {
    this.tasksService.regressStatus(task);
  }

  handleDeleteTask(task: any): void {
    this.tasksService.deleteTask(task);
  }

  handleAddComment(taskId: string, text: string): void {
    this.tasksService.addComment(taskId, text);
  }

  // ================================
  // Users
  // ================================

  handleUpdateUser(userId: string, data: any): void {
    this.usersService.updateUser(userId, data);
  }

  handleDeleteUser(userId: string): void {
    this.usersService.deleteUser(userId);
  }

  // ================================
  // Sistema
  // ================================

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}