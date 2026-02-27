import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole } from '../models/types';
import { mapUserFromAPI } from '../utils/mapper';
import { NotificationsService } from './notifications.service';
import { ActivitiesService } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersSignal = signal<User[]>([]);
  private isLoadingSignal = signal(false);

  public users = this.usersSignal.asReadonly();
  public isLoading = this.isLoadingSignal.asReadonly();

  public admins = computed(() =>
    this.usersSignal().filter(u => u.role === UserRole.ADMIN)
  );

  public employees = computed(() =>
    this.usersSignal().filter(u => u.role === UserRole.USER)
  );

  constructor(
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private activitiesService: ActivitiesService
  ) {}

  /**
   * Carrega usuários da API (apenas admin)
   */
  async loadUsers(): Promise<void> {
    if (this.isLoadingSignal()) {
      return;
    }

    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getAdminUsers());
      
      const users = Array.isArray(response) 
        ? response.map(mapUserFromAPI)
        : [];
      
      this.usersSignal.set(users);
      
      localStorage.setItem('gestora_users_last_load', Date.now().toString());

    } catch (error) {

      this.usersSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Carrega todos os usuários (endpoint público)
   */
  async loadAllUsers(): Promise<void> {
    if (this.isLoadingSignal()) {
      return;
    }

    this.isLoadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.getUsers());
      
      const users = Array.isArray(response)
        ? response.map(mapUserFromAPI)
        : [];

      this.usersSignal.set(users);

    } catch (error) {
    
      this.usersSignal.set([]);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Cria um novo usuário
   */
  async createUser(userData: any): Promise<User> {
    this.isLoadingSignal.set(true);

    try {
      const response = await firstValueFrom(this.apiService.createUser(userData));
      const newUser = mapUserFromAPI(response);
      
      await this.loadAllUsers();
      
      this.notificationsService.addNotification(
        'system',
        `Utilizador "${newUser.name}" criado com sucesso.`,
        'success'
      );

      this.activitiesService.addActivity({
        type: 'user_added',
        userId: newUser.id,
        userName: newUser.name,
        description: `Utilizador adicionado: ${newUser.name}`
      });

      return newUser;

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao criar utilizador.',
        'error'
      );
      throw error;

    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, userData: any): Promise<User> {
    this.isLoadingSignal.set(true);

    try {
      const response = await firstValueFrom(this.apiService.updateUser(id, userData));
      const updatedUser = mapUserFromAPI(response);

      await this.loadAllUsers(); 

      this.notificationsService.addNotification(
        'system',
        `Utilizador "${updatedUser.name}" atualizado com sucesso.`,
        'success'
      );

      this.activitiesService.addActivity({
        type: 'user_updated',
        userId: updatedUser.id,
        userName: updatedUser.name,
        description: `Utilizador atualizado: ${updatedUser.name}`
      });

      return updatedUser;

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao atualizar utilizador.',
        'error'
      );
      throw error;

    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Remove um usuário
   */
  async deleteUser(id: string): Promise<void> {
    const userToDelete = this.usersSignal().find(u => u.id === id);
    if (!userToDelete) return;

    this.isLoadingSignal.set(true);

    try {
      await firstValueFrom(this.apiService.deleteUser(id));

      await this.loadAllUsers(); 

      this.notificationsService.addNotification(
        'system',
        `Utilizador "${userToDelete.name}" eliminado com sucesso.`,
        'success'
      );

      this.activitiesService.addActivity({
        type: 'user_deleted',
        userId: userToDelete.id,
        userName: userToDelete.name,
        description: `Utilizador eliminado: ${userToDelete.name}`
      });

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao eliminar utilizador.',
        'error'
      );
      throw error;

    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Altera o cargo de um usuário
   */
  async changeUserRole(id: string, role: string): Promise<User> {
    this.isLoadingSignal.set(true);

    try {
      const response = await firstValueFrom(this.apiService.changeUserRole(id, role));
      const updatedUser = mapUserFromAPI(response);

      await this.loadUsers();

      return updatedUser;

    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Altera a senha de um usuário
   */
  async changePassword(id: string, newPassword: string, oldPassword?: string): Promise<void> {
    this.isLoadingSignal.set(true);

    try {
      await firstValueFrom(this.apiService.changePassword(id, newPassword, oldPassword));

      await this.loadAllUsers();

      const updatedUser = this.usersSignal().find(u => u.id === id);

      if (updatedUser) {
        this.notificationsService.addNotification(
          'system',
          `Senha alterada com sucesso para "${updatedUser.name}".`,
          'success'
        );

        this.activitiesService.addActivity({
          type: 'password_changed',
          userId: updatedUser.id,
          userName: updatedUser.name,
          description: `Senha alterada para ${updatedUser.name}`
        });
      }

    } catch (error) {
      this.notificationsService.addNotification(
        'system',
        'Erro ao alterar senha. Verifique os dados e tente novamente.',
        'error'
      );
      throw error;

    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Busca um usuário por ID
   */
  getUserById(id: string): User | undefined {
    return this.usersSignal().find(u => u.id === id);
  }

  /**
   * Retorna a URL do avatar de um usuário
   */
  getAvatarUrl(user: User): string | null {
    return user.avatar ?? null;
  }

  /**
   * Salva o avatar de um usuário
   */
  saveAvatar(userId: string, dataUrl: string): void {
    localStorage.setItem(`gestora_avatar_${userId}`, dataUrl);
    this.loadAllUsers();
  }

  /**
   * Recarrega os usuários (força atualização)
   */
  async refreshUsers(): Promise<void> {
    await this.loadUsers();
  }
}