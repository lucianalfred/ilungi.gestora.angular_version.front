import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { TasksService } from './tasks.service';
import { UsersService } from './users.service';
import { NotificationsService } from './notifications.service';
import { ActivitiesService } from './activities.service';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private authService = inject(AuthService);
  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);
  private notificationsService = inject(NotificationsService);
  private activitiesService = inject(ActivitiesService);

  private initializationPromise: Promise<void> | null = null;

  /**
   * Inicializa todos os dados necessários após login/refresh
   */
  async initializeApp(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Executa a inicialização de fato
   */
  private async performInitialization(): Promise<void> {
    console.log('🚀 Inicializando aplicação...');
    
    const user = await this.waitForUser();
    
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return;
    }

    console.log('✅ Usuário carregado:', user.email);

    try {
      // Carregar tarefas
      await this.tasksService.loadTasks();
      console.log('✅ Tarefas carregadas');

      // Se for admin, carregar usuários
      if (this.authService.isAdmin()) {
        await this.usersService.loadUsers();
        console.log('✅ Usuários carregados');
      }

      // Carregar notificações
      await this.notificationsService.loadNotifications(true);
      console.log('✅ Notificações carregadas');

      // Carregar atividades (se o método existir)
      if (typeof this.activitiesService.loadActivities === 'function') {
        await this.activitiesService.loadActivities();
        console.log('✅ Atividades carregadas');
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar dados:', error);
      throw error;
    }
  }

  /**
   * Aguarda o carregamento do usuário
   */
  private waitForUser(): Promise<any> {
    return new Promise((resolve) => {
      // Se já tem usuário, resolve imediatamente
      const user = this.authService.user();
      if (user) {
        resolve(user);
        return;
      }

      // Verificar periodicamente se o usuário foi carregado
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos (50 * 100ms)
      
      const interval = setInterval(() => {
        attempts++;
        const currentUser = this.authService.user();
        
        if (currentUser) {
          clearInterval(interval);
          resolve(currentUser);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  /**
   * Recarrega todos os dados
   */
  async refreshAllData(): Promise<void> {
    await this.performInitialization();
  }

  /**
   * Recarrega apenas tarefas
   */
  async refreshTasks(): Promise<void> {
    await this.tasksService.loadTasks();
  }

  /**
   * Recarrega apenas usuários
   */
  async refreshUsers(): Promise<void> {
    if (this.authService.isAdmin()) {
      await this.usersService.loadUsers();
    }
  }

  /**
   * Recarrega apenas notificações
   */
  async refreshNotifications(): Promise<void> {
    await this.notificationsService.loadNotifications(true);
  }

  /**
   * Recarrega apenas atividades
   */
  async refreshActivities(): Promise<void> {
    if (typeof this.activitiesService.loadActivities === 'function') {
      await this.activitiesService.loadActivities();
    }
  }
}