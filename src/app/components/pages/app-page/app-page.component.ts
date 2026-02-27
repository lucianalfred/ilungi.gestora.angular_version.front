import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
import { InitService } from '../../../services/init.service';

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
  private initService = inject(InitService);

  readonly TaskStatus = TaskStatus;
  readonly UserRole = UserRole;
  readonly users = computed(() => this.usersService.users() ?? []);

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

  private notificationsSubscription?: Subscription;

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
  async ngOnInit(): Promise<void> {
    if (this.user) {
      // Os dados já foram carregados pelo appInitGuard
      // Mas garantimos que estão atualizados
      await this.initService.initializeApp();
      
      this.notificationsSubscription = interval(30000).pipe(
        switchMap(() => {
          if (this.user) {
            return this.notificationsService.loadNotifications();
          }
          return [];
        })
      ).subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
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

  unreadCount = computed(() => {
    return this.notificationsService.unreadCount();
  });

  handleSetActiveTabSafe(tab: string): void {
    this.setActiveTabSafe(tab as TabType);
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

  async refreshAllData(): Promise<void> {
    await this.initService.refreshAllData();
  }

  async refreshTasks(): Promise<void> {
    await this.initService.refreshTasks();
  }

  async refreshUsers(): Promise<void> {
    await this.initService.refreshUsers();
  }

  async refreshNotifications(): Promise<void> {
    await this.initService.refreshNotifications();
  }

  loadUserData(): void {
    this.tasksService.loadTasks();

    if (this.user?.role === UserRole.ADMIN) {
      this.usersService.loadUsers();
    }
  }

  async loadNotifications(): Promise<void> {
    try {
      await this.notificationsService.loadNotifications();
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
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

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.tasksService.clearFilters();
  }

  // ================================
  // Notificações
  // ================================

  async markAllNotificationsAsRead(): Promise<void> {
    await this.notificationsService.markAllAsRead();
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.notificationsService.markAsRead(id);
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

  async handleCreateTask(taskData: any): Promise<void> {
    try {
      const newTask = await this.tasksService.createTask(taskData);
      
      this.addNotification(
        this.user!.id,
        'Tarefa criada com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao criar tarefa.',
        'error'
      );
    }
  }

  async handleUpdateTask(taskId: string, taskData: any): Promise<void> {
    try {
      await this.tasksService.updateTask(taskId, taskData);
      this.addNotification(
        this.user!.id,
        'Tarefa atualizada com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao atualizar tarefa.',
        'error'
      );
    }
  }

  // ================================
  // Users
  // ================================

  async handleUpdateUser(userId: string, data: any): Promise<void> {
    try {
      await this.usersService.updateUser(userId, data);
      this.addNotification(
        this.user!.id,
        'Utilizador atualizado com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao atualizar utilizador.',
        'error'
      );
    }
  }

  async handleDeleteUser(userId: string): Promise<void> {
    try {
      await this.usersService.deleteUser(userId);
      this.addNotification(
        this.user!.id,
        'Utilizador eliminado com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao eliminar utilizador.',
        'error'
      );
    }
  }

  async handleCreateUser(userData: any): Promise<void> {
    try {
      await this.usersService.createUser(userData);
      this.addNotification(
        this.user!.id,
        'Utilizador criado com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao criar utilizador.',
        'error'
      );
    }
  }

  async handleChangeUserRole(userId: string, role: string): Promise<void> {
    try {
      await this.usersService.changeUserRole(userId, role);
      this.addNotification(
        this.user!.id,
        'Cargo do utilizador alterado com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao alterar cargo:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao alterar cargo do utilizador.',
        'error'
      );
    }
  }

  async handleChangePassword(userId: string, newPassword: string, oldPassword?: string): Promise<void> {
    try {
      await this.usersService.changePassword(userId, newPassword, oldPassword);
      this.addNotification(
        this.user!.id,
        'Senha alterada com sucesso!',
        'success'
      );
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      this.addNotification(
        this.user!.id,
        'Erro ao alterar senha.',
        'error'
      );
    }
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

  // ================================
  // Utilitários
  // ================================

  getUserById(userId: string): User | undefined {
    return this.usersService.getUserById(userId);
  }

  getTaskById(taskId: string): any {
    return this.tasksService.getTaskById(taskId);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOverdue(task: any): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  }
}