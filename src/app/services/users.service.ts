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

  // =====================================================
  // STATE (Signals privados)
  // =====================================================

  private _users = signal<User[]>([]);
  private _isLoading = signal(false);

  // =====================================================
  // READONLY SIGNALS públicos
  // =====================================================

  users = this._users.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // =====================================================
  // COMPUTED
  // =====================================================

  admins = computed(() =>
    this._users().filter(u => u.role === UserRole.ADMIN)
  );

  employees = computed(() =>
    this._users().filter(u => u.role === UserRole.USER)
  );

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private apiService: ApiService,
    private notificationsService: NotificationsService,
    private activitiesService: ActivitiesService
  ) {}

  // =====================================================
  // LOAD USERS (apenas admins)
  // =====================================================

  async loadUsers(): Promise<void> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.getAdminUsers()
      );

      const users = Array.isArray(response)
        ? response.map(mapUserFromAPI)
        : [];

      this._users.set([...users]);
     

    } catch (error) {
      
      this._users.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // LOAD ALL USERS
  // =====================================================

  async loadAllUsers(): Promise<void> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.getUsers()
      );

      const users = Array.isArray(response)
        ? response.map(mapUserFromAPI)
        : [];

      this._users.set([...users]);
      console.log('✅ Todos os usuários carregados da API:', users.length);

    } catch (error) {
      console.error('Erro ao carregar todos os usuários:', error);
      this._users.set([]);
    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // CREATE USER - RECARREGA DA API APÓS CRIAR
  // =====================================================

  async createUser(userData: any): Promise<User> {
    this._isLoading.set(true);

    try {
      // 1. Cria o usuário na API
      const response = await firstValueFrom(
        this.apiService.createUser(userData)
      );

      const newUser = mapUserFromAPI(response);
      
      
      await this.loadAllUsers(); // ou await this.loadUsers() se for apenas admins
      
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
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // UPDATE USER - RECARREGA DA API APÓS ATUALIZAR
  // =====================================================

  async updateUser(id: string, userData: any): Promise<User> {
    this._isLoading.set(true);

    try {
      // 1. Atualiza o usuário na API
      const response = await firstValueFrom(
        this.apiService.updateUser(id, userData)
      );

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
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // DELETE USER - RECARREGA DA API APÓS DELETAR
  // =====================================================

  async deleteUser(id: string): Promise<void> {
    const userToDelete = this._users().find(u => u.id === id);
    if (!userToDelete) return;

    this._isLoading.set(true);

    try {
    
      await firstValueFrom(
        this.apiService.deleteUser(id)
      );

    
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
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // CHANGE ROLE
  // =====================================================

  async changeUserRole(id: string, role: string): Promise<User> {
    this._isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.apiService.changeUserRole(id, role)
      );

      const updatedUser = mapUserFromAPI(response);

   
      this.loadUsers();

      return updatedUser;

    } finally {
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(
    id: string,
    newPassword: string,
    oldPassword?: string
  ): Promise<void> {

    this._isLoading.set(true);

    try {
      await firstValueFrom(
        this.apiService.changePassword(id, newPassword, oldPassword)
      );

   
      await this.loadAllUsers();

      const updatedUser = this._users().find(u => u.id === id);

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
      this._isLoading.set(false);
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  getUserById(id: string): User | undefined {
    return this._users().find(u => u.id === id);
  }

  getAvatarUrl(user: User): string | null {
    return user.avatar ?? null;
  }

  saveAvatar(userId: string, dataUrl: string): void {
   
    this.loadAllUsers();
    localStorage.setItem(`gestora_avatar_${userId}`, dataUrl);
  }
}